package com.lecturemind.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;

@Getter
public class RefreshRequest {

    @NotBlank(message = "Refresh Token을 입력해주세요.")
    private String refreshToken;
}
