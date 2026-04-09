package com.lecturemind.backend.dto.response;

import com.lecturemind.backend.domain.ChatSession;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class ChatSessionResponse {
    private Long sessionId;
    private Long noteId;
    private String lectureTitle;
    private LocalDateTime createdAt;

    public static ChatSessionResponse from(ChatSession session) {
        return ChatSessionResponse.builder()
                .sessionId(session.getId())
                .noteId(session.getNote().getId())
                .lectureTitle(session.getNote().getLecture().getTitle())
                .createdAt(session.getCreatedAt())
                .build();
    }
}
