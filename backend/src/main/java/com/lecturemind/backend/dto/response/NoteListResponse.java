package com.lecturemind.backend.dto.response;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.lecturemind.backend.domain.Note;
import com.lecturemind.backend.domain.NoteStatus;
import lombok.Builder;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Getter
@Builder
public class NoteListResponse {
    private Long noteId;
    private Long lectureId;
    private String title;
    private NoteStatus status;
    private int keywordCount;
    private LocalDateTime createdAt;

    private static final ObjectMapper objectMapper = new ObjectMapper();

    public static NoteListResponse from(Note note) {
        int keywordCount = 0;
        try {
            if (note.getKeywords() != null) {
                List<?> keywords = objectMapper.readValue(note.getKeywords(), new TypeReference<List<?>>() {});
                keywordCount = keywords.size();
            }
        } catch (Exception e) {
            // 파싱 실패 시 0 유지
        }

        return NoteListResponse.builder()
                .noteId(note.getId())
                .lectureId(note.getLecture().getId())
                .title(note.getTitle())
                .status(note.getStatus())
                .keywordCount(keywordCount)
                .createdAt(note.getCreatedAt())
                .build();
    }
}
