package com.lecturemind.backend.dto.response;

import com.lecturemind.backend.domain.ReviewSchedule;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

@Getter
@Builder
public class ReviewScheduleResponse {
    private Long lectureId;
    private String lectureTitle;
    private LocalDate lastReviewDate;
    private LocalDate nextReviewDate;
    private int reviewCount;
    private double retentionRate;
    private boolean isOverdue;

    public static ReviewScheduleResponse from(ReviewSchedule schedule) {
        return ReviewScheduleResponse.builder()
                .lectureId(schedule.getLecture().getId())
                .lectureTitle(schedule.getLecture().getTitle())
                .lastReviewDate(schedule.getLastReviewDate())
                .nextReviewDate(schedule.getNextReviewDate())
                .reviewCount(schedule.getReviewCount())
                .retentionRate(schedule.getRetentionRate())
                .isOverdue(schedule.getNextReviewDate().isBefore(LocalDate.now()))
                .build();
    }
}
