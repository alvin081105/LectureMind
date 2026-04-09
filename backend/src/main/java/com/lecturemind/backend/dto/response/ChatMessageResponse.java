package com.lecturemind.backend.dto.response;

import com.lecturemind.backend.domain.ChatMessage;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class ChatMessageResponse {
    private Long messageId;
    private String role;
    private String content;
    private String bloomLevel;
    private String suggestion;
    private LocalDateTime createdAt;

    public static ChatMessageResponse from(ChatMessage message) {
        return ChatMessageResponse.builder()
                .messageId(message.getId())
                .role(message.getRole())
                .content(message.getContent())
                .bloomLevel(message.getBloomLevel())
                .createdAt(message.getCreatedAt())
                .build();
    }
}
