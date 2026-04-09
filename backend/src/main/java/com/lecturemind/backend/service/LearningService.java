package com.lecturemind.backend.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.lecturemind.backend.common.exception.ForbiddenException;
import com.lecturemind.backend.domain.*;
import com.lecturemind.backend.dto.request.QuizGenerateRequest;
import com.lecturemind.backend.dto.request.ReviewQuizRequest;
import com.lecturemind.backend.dto.response.DiagnosisResponse;
import com.lecturemind.backend.dto.response.QuizSetResponse;
import com.lecturemind.backend.dto.response.ReviewScheduleResponse;
import com.lecturemind.backend.repository.*;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class LearningService {

    private static final List<String> ALL_LEVELS =
            List.of("REMEMBER", "UNDERSTAND", "APPLY", "ANALYZE", "EVALUATE", "CREATE");

    private final QuizResultRepository quizResultRepository;
    private final ReviewScheduleRepository reviewScheduleRepository;
    private final LectureRepository lectureRepository;
    private final NoteRepository noteRepository;
    private final UserRepository userRepository;
    private final QuizService quizService;
    private final ObjectMapper objectMapper;

    @Transactional(readOnly = true)
    public DiagnosisResponse getDiagnosis(Long userId, Long lectureId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("사용자를 찾을 수 없습니다."));
        if (user.getRole() != Role.STUDENT) {
            throw new ForbiddenException("학생만 이용할 수 있습니다.");
        }

        Lecture lecture = lectureRepository.findById(lectureId)
                .orElseThrow(() -> new EntityNotFoundException("강의를 찾을 수 없습니다."));

        List<QuizResult> results = quizResultRepository.findByUserIdAndLectureId(userId, lectureId);

        Map<String, double[]> levelAcc = new LinkedHashMap<>(); // [totalQ, correctQ]
        ALL_LEVELS.forEach(l -> levelAcc.put(l, new double[2]));

        int totalQuestions = 0;
        for (QuizResult result : results) {
            totalQuestions += result.getTotalCount();
            try {
                Map<String, Map<String, Integer>> scoreByLevel = objectMapper.readValue(
                        result.getScoreByLevel(), new TypeReference<>() {});
                scoreByLevel.forEach((level, counts) -> {
                    if (levelAcc.containsKey(level)) {
                        levelAcc.get(level)[0] += counts.getOrDefault("total", 0);
                        levelAcc.get(level)[1] += counts.getOrDefault("correct", 0);
                    }
                });
            } catch (Exception e) {
                log.warn("scoreByLevel 파싱 실패: {}", e.getMessage());
            }
        }

        Map<String, Double> levelScores = new LinkedHashMap<>();
        levelAcc.forEach((level, counts) -> {
            double score = counts[0] > 0 ? (counts[1] / counts[0]) * 100.0 : 0.0;
            levelScores.put(level, score);
        });

        List<String> weakLevels = levelAcc.entrySet().stream()
                .filter(e -> e.getValue()[0] > 0 && (e.getValue()[1] / e.getValue()[0]) * 100.0 < 60)
                .map(Map.Entry::getKey).toList();

        List<String> strongLevels = levelAcc.entrySet().stream()
                .filter(e -> e.getValue()[0] > 0 && (e.getValue()[1] / e.getValue()[0]) * 100.0 >= 80)
                .map(Map.Entry::getKey).toList();

        double overallScore = totalQuestions > 0
                ? (results.stream().mapToInt(QuizResult::getCorrectCount).sum() * 100.0 / totalQuestions) : 0.0;

        String recommendation = weakLevels.isEmpty()
                ? "전반적으로 잘 이해하고 있습니다! 더 높은 레벨의 문제에 도전해보세요."
                : String.format("%s 수준에서 약한 편입니다. 해당 레벨의 문제를 집중적으로 풀어보세요.",
                        String.join(", ", weakLevels));

        return DiagnosisResponse.builder()
                .lectureId(lectureId)
                .lectureTitle(lecture.getTitle())
                .overallScore(overallScore)
                .levelScores(levelScores)
                .weakLevels(weakLevels)
                .strongLevels(strongLevels)
                .recommendation(recommendation)
                .totalQuizzesTaken(results.size())
                .totalQuestionsAnswered(totalQuestions)
                .build();
    }

    @Transactional
    public QuizSetResponse generateReviewQuiz(Long userId, ReviewQuizRequest request) {
        Note note = noteRepository.findByLectureIdAndUserId(request.getLectureId(), userId)
                .orElseThrow(() -> new EntityNotFoundException("해당 강의의 노트를 찾을 수 없습니다."));

        QuizGenerateRequest quizRequest = new QuizGenerateRequest();
        quizRequest.setNoteId(note.getId());
        quizRequest.setBloomLevels(request.getWeakLevels());
        quizRequest.setCount(request.getCount());

        return quizService.generate(userId, quizRequest);
    }

    @Transactional(readOnly = true)
    public List<ReviewScheduleResponse> getSchedule(Long userId) {
        return reviewScheduleRepository.findByUserId(userId)
                .stream()
                .map(ReviewScheduleResponse::from)
                .toList();
    }

    @Transactional
    public ReviewScheduleResponse completeReview(Long userId, Long lectureId) {
        ReviewSchedule schedule = reviewScheduleRepository.findByUserIdAndLectureId(userId, lectureId)
                .orElseThrow(() -> new EntityNotFoundException("복습 스케줄을 찾을 수 없습니다."));

        schedule.completeReview();
        reviewScheduleRepository.save(schedule);
        log.info("복습 완료: userId={}, lectureId={}", userId, lectureId);
        return ReviewScheduleResponse.from(schedule);
    }
}
