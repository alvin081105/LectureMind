package com.lecturemind.backend.domain;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "quizzes")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Quiz {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quiz_set_id", nullable = false)
    private QuizSet quizSet;

    @Column(nullable = false, length = 20)
    private String bloomLevel; // REMEMBER, UNDERSTAND, APPLY, ANALYZE, EVALUATE, CREATE

    @Column(nullable = false, length = 20)
    private String type; // OX, MULTIPLE_CHOICE, FILL_BLANK, SCENARIO, SHORT_ANSWER

    @Column(columnDefinition = "TEXT", nullable = false)
    private String question;

    @Column(columnDefinition = "TEXT")
    private String options; // JSON 문자열 (null 가능 — 서술형 등)

    @Column(columnDefinition = "TEXT", nullable = false)
    private String correctAnswer;

    @Column(columnDefinition = "TEXT")
    private String explanation;
}
