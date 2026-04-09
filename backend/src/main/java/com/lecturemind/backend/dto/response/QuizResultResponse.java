package com.lecturemind.backend.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Getter
@Builder
public class QuizResultResponse {
    private Long quizSetId;
    private int totalCount;
    private int correctCount;
    private double scorePercent;
    private Map<String, LevelScore> scoreByLevel;
    private List<QuizResultItem> results;
    private List<String> weakLevels;
    private LocalDateTime submittedAt;

    @Getter
    @Builder
    public static class LevelScore {
        private int total;
        private int correct;
    }

    @Getter
    @Builder
    public static class QuizResultItem {
        private Long quizId;
        private boolean isCorrect;
        private String userAnswer;
        private String correctAnswer;
        private String explanation;
        private String feedback; // 서술형 채점 피드백
    }
}
