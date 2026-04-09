package com.lecturemind.backend.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AnalysisGenerateResponse {
    private Long analysisId;
    private Long lectureId;
    private String status;
}
