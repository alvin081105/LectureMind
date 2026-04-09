package com.lecturemind.backend.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.lecturemind.backend.common.dto.PageResponse;
import com.lecturemind.backend.common.exception.ForbiddenException;
import com.lecturemind.backend.domain.*;
import com.lecturemind.backend.dto.request.QuizGenerateRequest;
import com.lecturemind.backend.dto.request.QuizSubmitRequest;
import com.lecturemind.backend.dto.response.QuizResultResponse;
import com.lecturemind.backend.dto.response.QuizSetResponse;
import com.lecturemind.backend.repository.*;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class QuizService {

    private static final String GENERATE_SYSTEM_PROMPT = """
            아래 구조화된 노트를 기반으로 퀴즈를 생성해주세요.

            규칙:
            1. 요청된 블룸 레벨에 맞는 문제만 생성하세요.
            2. 레벨별 문제 유형:
               - REMEMBER → OX 또는 FILL_BLANK
               - UNDERSTAND → MULTIPLE_CHOICE (4지선다)
               - APPLY → SCENARIO
               - ANALYZE / EVALUATE → SHORT_ANSWER
               - CREATE → SHORT_ANSWER
            3. 각 문제에 정답과 상세 해설을 포함하세요.
            4. 반드시 JSON 배열로만 응답하세요 (다른 텍스트 없이).

            출력 형식:
            [{"bloomLevel":"REMEMBER","type":"OX","question":"문제","options":["O","X"],"correctAnswer":"O","explanation":"해설"}]
            """;

    private static final String GRADE_SYSTEM_PROMPT = """
            학생의 답안을 채점해주세요. 정답과 의미적으로 동일하면 correct, 아니면 incorrect로 판단하세요.
            반드시 JSON으로만 응답하세요.
            출력 형식: {"isCorrect": true, "feedback": "피드백 내용"}
            """;

    private static final Set<String> SUBJECTIVE_TYPES = Set.of("SCENARIO", "SHORT_ANSWER");

    private final NoteRepository noteRepository;
    private final QuizSetRepository quizSetRepository;
    private final QuizRepository quizRepository;
    private final QuizResultRepository quizResultRepository;
    private final ReviewScheduleRepository reviewScheduleRepository;
    private final UserRepository userRepository;
    private final ClaudeApiClient claudeApiClient;
    private final ObjectMapper objectMapper;

    @Transactional
    public QuizSetResponse generate(Long userId, QuizGenerateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("사용자를 찾을 수 없습니다."));
        if (user.getRole() != Role.STUDENT) {
            throw new ForbiddenException("학생만 퀴즈를 생성할 수 있습니다.");
        }

        Note note = noteRepository.findById(request.getNoteId())
                .orElseThrow(() -> new EntityNotFoundException("노트를 찾을 수 없습니다."));
        if (!note.getUser().getId().equals(userId)) {
            throw new ForbiddenException("접근 권한이 없습니다.");
        }

        String userMessage = String.format("레벨: %s, 개수: %d\n노트: %s",
                request.getBloomLevels(), request.getCount(), note.getContent());

        String response = claudeApiClient.sendMessage(GENERATE_SYSTEM_PROMPT, userMessage);
        List<Quiz> quizzes = parseAndSaveQuizzes(response, note, user);

        QuizSet quizSet = quizSetRepository.save(QuizSet.builder()
                .note(note)
                .user(user)
                .build());

        quizzes = quizzes.stream()
                .map(q -> Quiz.builder()
                        .quizSet(quizSet)
                        .bloomLevel(q.getBloomLevel())
                        .type(q.getType())
                        .question(q.getQuestion())
                        .options(q.getOptions())
                        .correctAnswer(q.getCorrectAnswer())
                        .explanation(q.getExplanation())
                        .build())
                .toList();
        quizRepository.saveAll(quizzes);

        log.info("퀴즈 생성 완료: quizSetId={}, count={}", quizSet.getId(), quizzes.size());
        return QuizSetResponse.of(quizSet, quizzes);
    }

    @Transactional
    public QuizResultResponse submit(Long userId, Long quizSetId, QuizSubmitRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("사용자를 찾을 수 없습니다."));

        QuizSet quizSet = quizSetRepository.findById(quizSetId)
                .orElseThrow(() -> new EntityNotFoundException("퀴즈 세트를 찾을 수 없습니다."));
        if (!quizSet.getUser().getId().equals(userId)) {
            throw new ForbiddenException("접근 권한이 없습니다.");
        }

        List<Quiz> quizzes = quizRepository.findByQuizSetId(quizSetId);
        Map<Long, Quiz> quizMap = new HashMap<>();
        quizzes.forEach(q -> quizMap.put(q.getId(), q));

        List<QuizResultResponse.QuizResultItem> resultItems = new ArrayList<>();
        Map<String, int[]> scoreByLevel = new HashMap<>(); // [total, correct]
        int correctCount = 0;

        for (QuizSubmitRequest.Answer answer : request.getAnswers()) {
            Quiz quiz = quizMap.get(answer.getQuizId());
            if (quiz == null) continue;

            boolean isCorrect;
            String feedback = null;

            if (SUBJECTIVE_TYPES.contains(quiz.getType())) {
                Map<String, Object> gradeResult = gradeSubjective(quiz.getCorrectAnswer(), answer.getUserAnswer());
                isCorrect = (boolean) gradeResult.get("isCorrect");
                feedback = (String) gradeResult.get("feedback");
            } else {
                isCorrect = quiz.getCorrectAnswer().trim().equalsIgnoreCase(answer.getUserAnswer().trim());
            }

            if (isCorrect) correctCount++;

            scoreByLevel.computeIfAbsent(quiz.getBloomLevel(), k -> new int[2]);
            scoreByLevel.get(quiz.getBloomLevel())[0]++;
            if (isCorrect) scoreByLevel.get(quiz.getBloomLevel())[1]++;

            resultItems.add(QuizResultResponse.QuizResultItem.builder()
                    .quizId(quiz.getId())
                    .isCorrect(isCorrect)
                    .userAnswer(answer.getUserAnswer())
                    .correctAnswer(quiz.getCorrectAnswer())
                    .explanation(quiz.getExplanation())
                    .feedback(feedback)
                    .build());
        }

        int total = request.getAnswers().size();
        double scorePercent = total > 0 ? (correctCount * 100.0 / total) : 0;

        Map<String, QuizResultResponse.LevelScore> levelScoreMap = new LinkedHashMap<>();
        scoreByLevel.forEach((level, counts) ->
                levelScoreMap.put(level, QuizResultResponse.LevelScore.builder()
                        .total(counts[0]).correct(counts[1]).build()));

        List<String> weakLevels = scoreByLevel.entrySet().stream()
                .filter(e -> e.getValue()[0] > 0 && (e.getValue()[1] * 100.0 / e.getValue()[0]) < 60)
                .map(Map.Entry::getKey)
                .toList();

        try {
            String scoreByLevelJson = objectMapper.writeValueAsString(levelScoreMap);
            quizResultRepository.save(QuizResult.builder()
                    .quizSet(quizSet)
                    .user(user)
                    .totalCount(total)
                    .correctCount(correctCount)
                    .scoreByLevel(scoreByLevelJson)
                    .build());
        } catch (Exception e) {
            log.error("퀴즈 결과 저장 실패: {}", e.getMessage());
        }

        updateReviewSchedule(userId, quizSet);

        return QuizResultResponse.builder()
                .quizSetId(quizSetId)
                .totalCount(total)
                .correctCount(correctCount)
                .scorePercent(scorePercent)
                .scoreByLevel(levelScoreMap)
                .results(resultItems)
                .weakLevels(weakLevels)
                .submittedAt(LocalDateTime.now())
                .build();
    }

    @Transactional(readOnly = true)
    public PageResponse<QuizResultResponse> getHistory(Long userId, Long lectureId, Pageable pageable) {
        if (lectureId != null) {
            List<QuizResult> results = quizResultRepository.findByUserIdAndLectureId(userId, lectureId);
            return buildHistoryPageResponse(results, pageable);
        }
        Page<QuizResult> page = quizResultRepository.findByUserIdOrderBySubmittedAtDesc(userId, pageable);
        return new PageResponse<>(page.map(this::toHistoryResponse));
    }

    private PageResponse<QuizResultResponse> buildHistoryPageResponse(List<QuizResult> results, Pageable pageable) {
        int start = (int) pageable.getOffset();
        int end = Math.min(start + pageable.getPageSize(), results.size());
        List<QuizResult> slice = start >= results.size() ? Collections.emptyList() : results.subList(start, end);
        List<QuizResultResponse> mapped = slice.stream().map(this::toHistoryResponse).toList();
        return new PageResponse<>(new org.springframework.data.domain.PageImpl<>(mapped, pageable, results.size()));
    }

    private QuizResultResponse toHistoryResponse(QuizResult result) {
        Map<String, QuizResultResponse.LevelScore> levelScoreMap = new LinkedHashMap<>();
        try {
            Map<String, Map<String, Integer>> raw = objectMapper.readValue(
                    result.getScoreByLevel(), new TypeReference<>() {});
            raw.forEach((level, counts) ->
                    levelScoreMap.put(level, QuizResultResponse.LevelScore.builder()
                            .total(counts.getOrDefault("total", 0))
                            .correct(counts.getOrDefault("correct", 0))
                            .build()));
        } catch (Exception e) {
            log.warn("scoreByLevel 파싱 실패: {}", e.getMessage());
        }

        return QuizResultResponse.builder()
                .quizSetId(result.getQuizSet().getId())
                .totalCount(result.getTotalCount())
                .correctCount(result.getCorrectCount())
                .scorePercent(result.getTotalCount() > 0
                        ? (result.getCorrectCount() * 100.0 / result.getTotalCount()) : 0)
                .scoreByLevel(levelScoreMap)
                .submittedAt(result.getSubmittedAt())
                .build();
    }

    private List<Quiz> parseAndSaveQuizzes(String response, Note note, User user) {
        try {
            String cleanJson = extractJsonArray(response);
            JsonNode arr = objectMapper.readTree(cleanJson);
            List<Quiz> quizzes = new ArrayList<>();
            for (JsonNode node : arr) {
                String optionsJson = node.has("options") && !node.get("options").isNull()
                        ? objectMapper.writeValueAsString(node.get("options")) : null;
                quizzes.add(Quiz.builder()
                        .bloomLevel(node.path("bloomLevel").asText())
                        .type(node.path("type").asText())
                        .question(node.path("question").asText())
                        .options(optionsJson)
                        .correctAnswer(node.path("correctAnswer").asText())
                        .explanation(node.path("explanation").asText())
                        .build());
            }
            return quizzes;
        } catch (Exception e) {
            log.error("퀴즈 JSON 파싱 실패: {}", e.getMessage());
            return Collections.emptyList();
        }
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> gradeSubjective(String correctAnswer, String userAnswer) {
        String userMessage = String.format("정답: %s\n학생 답안: %s", correctAnswer, userAnswer);
        try {
            String response = claudeApiClient.sendMessage(GRADE_SYSTEM_PROMPT, userMessage);
            String json = extractJson(response);
            return objectMapper.readValue(json, Map.class);
        } catch (Exception e) {
            log.warn("서술형 채점 실패: {}", e.getMessage());
            return Map.of("isCorrect", false, "feedback", "채점 중 오류가 발생했습니다.");
        }
    }

    private void updateReviewSchedule(Long userId, QuizSet quizSet) {
        try {
            User user = userRepository.findById(userId).orElseThrow();
            Lecture lecture = quizSet.getNote().getLecture();
            reviewScheduleRepository.findByUserIdAndLectureId(userId, lecture.getId())
                    .ifPresentOrElse(
                            ReviewSchedule::completeReview,
                            () -> reviewScheduleRepository.save(ReviewSchedule.builder()
                                    .user(user)
                                    .lecture(lecture)
                                    .nextReviewDate(java.time.LocalDate.now().plusDays(1))
                                    .build())
                    );
        } catch (Exception e) {
            log.warn("복습 스케줄 업데이트 실패: {}", e.getMessage());
        }
    }

    private String extractJsonArray(String response) {
        response = response.trim();
        int start = response.indexOf('[');
        int end = response.lastIndexOf(']');
        return (start != -1 && end != -1) ? response.substring(start, end + 1) : response;
    }

    private String extractJson(String response) {
        response = response.trim();
        int start = response.indexOf('{');
        int end = response.lastIndexOf('}');
        return (start != -1 && end != -1) ? response.substring(start, end + 1) : response;
    }
}
