package com.lecturemind.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.lecturemind.backend.common.dto.PageResponse;
import com.lecturemind.backend.common.exception.DuplicateException;
import com.lecturemind.backend.common.exception.ForbiddenException;
import com.lecturemind.backend.domain.*;
import com.lecturemind.backend.dto.request.NoteGenerateRequest;
import com.lecturemind.backend.dto.response.NoteGenerateResponse;
import com.lecturemind.backend.dto.response.NoteListResponse;
import com.lecturemind.backend.dto.response.NoteResponse;
import com.lecturemind.backend.repository.LectureRepository;
import com.lecturemind.backend.repository.NoteRepository;
import com.lecturemind.backend.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class NoteService {

    private static final String SYSTEM_PROMPT = """
            당신은 교육학 전문가입니다. 아래 강의 트랜스크립트를 블룸 분류 체계(Bloom's Taxonomy)에 따라 구조화된 노트로 변환해주세요.

            규칙:
            1. 각 섹션에 블룸 레벨을 태깅하세요: REMEMBER, UNDERSTAND, APPLY, ANALYZE, EVALUATE, CREATE
            2. 핵심 키워드를 추출하세요
            3. 계층적 트리 구조로 작성하세요
            4. 반드시 아래 JSON 형식으로만 응답하세요 (다른 텍스트 없이 JSON만)

            출력 형식:
            {"title":"강의 제목","sections":[{"title":"섹션 제목","bloomLevel":"REMEMBER","content":"내용","keywords":["키워드"],"children":[]}],"keywords":["전체 키워드"]}
            """;

    private final NoteRepository noteRepository;
    private final LectureRepository lectureRepository;
    private final UserRepository userRepository;
    private final ClaudeApiClient claudeApiClient;
    private final ObjectMapper objectMapper;

    @Transactional
    public NoteGenerateResponse generate(Long userId, NoteGenerateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("사용자를 찾을 수 없습니다."));

        if (user.getRole() != Role.STUDENT) {
            throw new ForbiddenException("학생만 노트를 생성할 수 있습니다.");
        }

        Lecture lecture = lectureRepository.findById(request.getLectureId())
                .orElseThrow(() -> new EntityNotFoundException("강의를 찾을 수 없습니다."));

        if (!lecture.getUser().getId().equals(userId)) {
            throw new ForbiddenException("접근 권한이 없습니다.");
        }

        if (lecture.getStatus() != LectureStatus.COMPLETED) {
            throw new IllegalArgumentException("STT가 완료된 강의만 노트를 생성할 수 있습니다.");
        }

        if (noteRepository.existsByLectureIdAndUserId(lecture.getId(), userId)) {
            throw new DuplicateException("이미 해당 강의의 노트가 존재합니다. 삭제 후 다시 생성해주세요.");
        }

        Note note = Note.builder()
                .lecture(lecture)
                .user(user)
                .title(lecture.getTitle())
                .content("[]")
                .build();
        note = noteRepository.save(note);

        generateAsync(note.getId(), lecture.getTranscript());

        return NoteGenerateResponse.builder()
                .noteId(note.getId())
                .lectureId(lecture.getId())
                .status("GENERATING")
                .build();
    }

    @Async("taskExecutor")
    @Transactional
    public void generateAsync(Long noteId, String transcript) {
        log.info("노트 생성 시작: noteId={}", noteId);
        Note note = noteRepository.findById(noteId)
                .orElseThrow(() -> new EntityNotFoundException("노트를 찾을 수 없습니다."));
        try {
            String response = claudeApiClient.sendMessage(SYSTEM_PROMPT, transcript);
            String cleanJson = extractJson(response);

            JsonNode root = objectMapper.readTree(cleanJson);
            String title = root.has("title") ? root.get("title").asText() : note.getTitle();
            String sectionsJson = objectMapper.writeValueAsString(root.get("sections"));
            String keywordsJson = objectMapper.writeValueAsString(root.get("keywords"));

            note.updateContent(title, sectionsJson, keywordsJson);
            noteRepository.save(note);
            log.info("노트 생성 완료: noteId={}", noteId);

        } catch (Exception e) {
            log.error("노트 생성 실패: noteId={}, error={}", noteId, e.getMessage(), e);
            note.markFailed();
            noteRepository.save(note);
        }
    }

    @Transactional(readOnly = true)
    public NoteStatus getNoteStatus(Long userId, Long noteId) {
        Note note = findOwnNote(userId, noteId);
        return note.getStatus();
    }

    @Transactional(readOnly = true)
    public NoteResponse getNote(Long userId, Long noteId) {
        Note note = findOwnNote(userId, noteId);
        return NoteResponse.from(note);
    }

    @Transactional(readOnly = true)
    public PageResponse<NoteListResponse> getNotes(Long userId, Pageable pageable) {
        return new PageResponse<>(
                noteRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable)
                        .map(NoteListResponse::from)
        );
    }

    @Transactional
    public void deleteNote(Long userId, Long noteId) {
        Note note = findOwnNote(userId, noteId);
        noteRepository.delete(note);
        log.info("노트 삭제 완료: noteId={}", noteId);
    }

    public String exportMarkdown(Long userId, Long noteId) {
        Note note = findOwnNote(userId, noteId);
        StringBuilder sb = new StringBuilder();
        sb.append("# ").append(note.getTitle()).append("\n\n");

        try {
            JsonNode sections = objectMapper.readTree(note.getContent());
            for (JsonNode section : sections) {
                appendSection(sb, section, 2);
            }

            if (note.getKeywords() != null) {
                JsonNode keywords = objectMapper.readTree(note.getKeywords());
                sb.append("\n---\n**키워드**: ");
                for (int i = 0; i < keywords.size(); i++) {
                    if (i > 0) sb.append(", ");
                    sb.append(keywords.get(i).asText());
                }
                sb.append("\n");
            }
        } catch (Exception e) {
            log.warn("노트 Markdown 변환 실패, 원문 반환: {}", e.getMessage());
            sb.append(note.getContent());
        }

        return sb.toString();
    }

    private void appendSection(StringBuilder sb, JsonNode section, int level) {
        String heading = "#".repeat(Math.min(level, 6));
        String title = section.path("title").asText("");
        String bloomLevel = section.path("bloomLevel").asText("");
        String content = section.path("content").asText("");

        sb.append(heading).append(" ").append(title);
        if (!bloomLevel.isEmpty()) sb.append(" `").append(bloomLevel).append("`");
        sb.append("\n\n");

        if (!content.isEmpty()) sb.append(content).append("\n\n");

        JsonNode keywords = section.path("keywords");
        if (keywords.isArray() && keywords.size() > 0) {
            sb.append("**키워드**: ");
            for (int i = 0; i < keywords.size(); i++) {
                if (i > 0) sb.append(", ");
                sb.append(keywords.get(i).asText());
            }
            sb.append("\n\n");
        }

        JsonNode children = section.path("children");
        if (children.isArray()) {
            for (JsonNode child : children) {
                appendSection(sb, child, level + 1);
            }
        }
    }

    private Note findOwnNote(Long userId, Long noteId) {
        Note note = noteRepository.findById(noteId)
                .orElseThrow(() -> new EntityNotFoundException("노트를 찾을 수 없습니다."));
        if (!note.getUser().getId().equals(userId)) {
            throw new ForbiddenException("접근 권한이 없습니다.");
        }
        return note;
    }

    private String extractJson(String response) {
        response = response.trim();
        int start = response.indexOf('{');
        int end = response.lastIndexOf('}');
        if (start != -1 && end != -1) {
            return response.substring(start, end + 1);
        }
        return response;
    }
}
