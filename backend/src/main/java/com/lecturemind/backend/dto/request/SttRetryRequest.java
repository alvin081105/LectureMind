package com.lecturemind.backend.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;

@Getter
public class SttRetryRequest {

    @NotNull(message = "강의 ID를 입력해주세요.")
    private Long lectureId;
}
