package com.lecturemind.backend.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "analyses",
        uniqueConstraints = @UniqueConstraint(columnNames = {"lecture_id", "user_id"}))
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Analysis {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lecture_id", nullable = false)
    private Lecture lecture;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(columnDefinition = "TEXT")
    private String summary; // JSON 문자열

    @Column(columnDefinition = "TEXT")
    private String difficultyTimeline; // JSON 문자열

    @Column(columnDefinition = "TEXT")
    private String improvements; // JSON 문자열

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private AnalysisStatus status = AnalysisStatus.ANALYZING;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public void complete(String summary, String difficultyTimeline, String improvements) {
        this.summary = summary;
        this.difficultyTimeline = difficultyTimeline;
        this.improvements = improvements;
        this.status = AnalysisStatus.COMPLETED;
    }

    public void fail() {
        this.status = AnalysisStatus.FAILED;
    }
}
