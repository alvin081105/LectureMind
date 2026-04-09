package com.lecturemind.backend.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;

import java.util.List;

@Getter
public class ReviewQuizRequest {

    @NotNull(message = "강의 ID를 입력해주세요.")
    private Long lectureId;

    @NotEmpty(message = "약점 레벨을 하나 이상 선택해주세요.")
    private List<String> weakLevels;

    @Min(1) @Max(30)
    private int count = 5;
}
