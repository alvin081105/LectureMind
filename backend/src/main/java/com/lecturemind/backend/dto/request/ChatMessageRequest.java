package com.lecturemind.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;

@Getter
public class ChatMessageRequest {

    @NotBlank(message = "메시지를 입력해주세요.")
    private String content;
}
