package com.lecturemind.backend.dto.response;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.lecturemind.backend.domain.Analysis;
import com.lecturemind.backend.domain.AnalysisStatus;
import lombok.Builder;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Map;

@Slf4j
@Getter
@Builder
public class AnalysisResponse {
    private Long analysisId;
    private Long lectureId;
    private AnalysisStatus status;
    private Object summary;             // JSON 그대로 반환
    private Object difficultyTimeline;
    private Object improvements;
    private LocalDateTime createdAt;

    private static final ObjectMapper objectMapper = new ObjectMapper();

    public static AnalysisResponse from(Analysis analysis) {
        return AnalysisResponse.builder()
                .analysisId(analysis.getId())
                .lectureId(analysis.getLecture().getId())
                .status(analysis.getStatus())
                .summary(parseJson(analysis.getSummary()))
                .difficultyTimeline(parseJson(analysis.getDifficultyTimeline()))
                .improvements(parseJson(analysis.getImprovements()))
                .createdAt(analysis.getCreatedAt())
                .build();
    }

    private static Object parseJson(String json) {
        if (json == null) return Collections.emptyMap();
        try {
            return objectMapper.readValue(json, new TypeReference<Object>() {});
        } catch (Exception e) {
            log.warn("JSON 파싱 실패: {}", e.getMessage());
            return Collections.emptyMap();
        }
    }
}
