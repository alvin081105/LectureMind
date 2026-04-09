package com.lecturemind.backend.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;

@Getter
public class ChatSessionRequest {

    @NotNull(message = "노트 ID를 입력해주세요.")
    private Long noteId;
}
