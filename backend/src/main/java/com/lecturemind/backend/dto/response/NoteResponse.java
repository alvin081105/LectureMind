package com.lecturemind.backend.dto.response;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.lecturemind.backend.domain.Note;
import com.lecturemind.backend.domain.NoteStatus;
import lombok.Builder;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

@Slf4j
@Getter
@Builder
public class NoteResponse {
    private Long noteId;
    private Long lectureId;
    private String title;
    private NoteStatus status;
    private Object sections;   // JSON 그대로 반환
    private Object keywords;
    private LocalDateTime createdAt;

    private static final ObjectMapper objectMapper = new ObjectMapper();

    public static NoteResponse from(Note note) {
        return NoteResponse.builder()
                .noteId(note.getId())
                .lectureId(note.getLecture().getId())
                .title(note.getTitle())
                .status(note.getStatus())
                .sections(parseJson(note.getContent()))
                .keywords(parseJson(note.getKeywords()))
                .createdAt(note.getCreatedAt())
                .build();
    }

    private static Object parseJson(String json) {
        if (json == null) return Collections.emptyList();
        try {
            return objectMapper.readValue(json, new TypeReference<Object>() {});
        } catch (Exception e) {
            log.warn("JSON 파싱 실패: {}", e.getMessage());
            return Collections.emptyList();
        }
    }
}
