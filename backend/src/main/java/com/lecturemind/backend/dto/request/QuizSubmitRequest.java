package com.lecturemind.backend.dto.request;

import jakarta.validation.constraints.NotEmpty;
import lombok.Getter;

import java.util.List;

@Getter
public class QuizSubmitRequest {

    @NotEmpty(message = "답안을 입력해주세요.")
    private List<Answer> answers;

    @Getter
    public static class Answer {
        private Long quizId;
        private String userAnswer;
    }
}
