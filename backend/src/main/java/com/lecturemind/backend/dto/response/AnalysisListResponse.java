package com.lecturemind.backend.dto.response;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.lecturemind.backend.domain.Analysis;
import com.lecturemind.backend.domain.AnalysisStatus;
import lombok.Builder;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Slf4j
@Getter
@Builder
public class AnalysisListResponse {
    private Long analysisId;
    private Long lectureId;
    private String lectureTitle;
    private AnalysisStatus status;
    private int issueCount;
    private int highPriorityCount;
    private LocalDateTime createdAt;

    private static final ObjectMapper objectMapper = new ObjectMapper();

    public static AnalysisListResponse from(Analysis analysis) {
        int issueCount = 0;
        int highPriorityCount = 0;

        try {
            if (analysis.getImprovements() != null) {
                List<Map<String, Object>> improvements = objectMapper.readValue(
                        analysis.getImprovements(), new TypeReference<>() {});
                issueCount = improvements.size();
                highPriorityCount = (int) improvements.stream()
                        .filter(i -> "HIGH".equals(i.get("priority")))
                        .count();
            }
        } catch (Exception e) {
            log.warn("improvements 파싱 실패: {}", e.getMessage());
        }

        return AnalysisListResponse.builder()
                .analysisId(analysis.getId())
                .lectureId(analysis.getLecture().getId())
                .lectureTitle(analysis.getLecture().getTitle())
                .status(analysis.getStatus())
                .issueCount(issueCount)
                .highPriorityCount(highPriorityCount)
                .createdAt(analysis.getCreatedAt())
                .build();
    }
}
