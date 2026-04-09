package com.lecturemind.backend.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "review_schedules",
        uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "lecture_id"}),
        indexes = {
                @Index(name = "idx_review_schedules_user_id", columnList = "user_id"),
                @Index(name = "idx_review_schedules_next_date", columnList = "next_review_date")
        })
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class ReviewSchedule {

    private static final int[] REVIEW_INTERVALS = {1, 3, 7, 14, 30};

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lecture_id", nullable = false)
    private Lecture lecture;

    private LocalDate lastReviewDate;

    @Column(nullable = false)
    private LocalDate nextReviewDate;

    @Column(nullable = false)
    @Builder.Default
    private int reviewCount = 0;

    @Column(nullable = false)
    @Builder.Default
    private double retentionRate = 100.0;

    public void completeReview() {
        this.lastReviewDate = LocalDate.now();
        this.reviewCount++;
        int interval = reviewCount < REVIEW_INTERVALS.length
                ? REVIEW_INTERVALS[reviewCount - 1]
                : REVIEW_INTERVALS[REVIEW_INTERVALS.length - 1];
        this.nextReviewDate = LocalDate.now().plusDays(interval);
        this.retentionRate = 85.0;
    }
}
