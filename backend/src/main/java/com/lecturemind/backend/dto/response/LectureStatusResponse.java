package com.lecturemind.backend.dto.response;

import com.lecturemind.backend.domain.LectureStatus;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class LectureStatusResponse {
    private Long lectureId;
    private LectureStatus status;
    private int progress;
    private Integer estimatedRemainingSeconds;
}
