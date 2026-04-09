package com.lecturemind.backend.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "quiz_results", indexes = {
        @Index(name = "idx_quiz_results_user_id", columnList = "user_id")
})
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class QuizResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quiz_set_id", nullable = false)
    private QuizSet quizSet;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private int totalCount;

    @Column(nullable = false)
    private int correctCount;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String scoreByLevel; // JSON 문자열

    @Column(nullable = false, updatable = false)
    private LocalDateTime submittedAt;

    @PrePersist
    protected void onCreate() {
        this.submittedAt = LocalDateTime.now();
    }
}
