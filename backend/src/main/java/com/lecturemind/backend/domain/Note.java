package com.lecturemind.backend.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "notes",
        uniqueConstraints = @UniqueConstraint(columnNames = {"lecture_id", "user_id"}),
        indexes = {
                @Index(name = "idx_notes_user_id", columnList = "user_id"),
                @Index(name = "idx_notes_lecture_id", columnList = "lecture_id")
        })
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Note {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lecture_id", nullable = false)
    private Lecture lecture;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(length = 255)
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content; // JSON 문자열

    @Column(columnDefinition = "TEXT")
    private String keywords; // JSON 문자열

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private NoteStatus status = NoteStatus.GENERATING;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public void updateContent(String title, String content, String keywords) {
        this.title = title;
        this.content = content;
        this.keywords = keywords;
        this.status = NoteStatus.COMPLETED;
    }

    public void markFailed() {
        this.status = NoteStatus.FAILED;
    }
}
