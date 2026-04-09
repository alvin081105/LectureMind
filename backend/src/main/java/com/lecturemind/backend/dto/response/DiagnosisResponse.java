package com.lecturemind.backend.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.util.List;
import java.util.Map;

@Getter
@Builder
public class DiagnosisResponse {
    private Long lectureId;
    private String lectureTitle;
    private double overallScore;
    private Map<String, Double> levelScores;
    private List<String> weakLevels;
    private List<String> strongLevels;
    private String recommendation;
    private int totalQuizzesTaken;
    private int totalQuestionsAnswered;
}
