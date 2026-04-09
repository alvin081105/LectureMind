package com.lecturemind.backend.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "lectures", indexes = {
        @Index(name = "idx_lectures_user_id", columnList = "user_id"),
        @Index(name = "idx_lectures_status", columnList = "status")
})
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Lecture {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(length = 500)
    private String filePath;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String transcript;

    @Column(length = 20)
    private String duration;

    @Column(length = 20)
    private String fileSize;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private LectureStatus status = LectureStatus.UPLOADING;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public void updateTranscript(String transcript, String duration) {
        this.transcript = transcript;
        this.duration = duration;
        this.status = LectureStatus.COMPLETED;
    }

    public void updateStatus(LectureStatus status) {
        this.status = status;
    }

    public void updateFilePath(String filePath, String fileSize) {
        this.filePath = filePath;
        this.fileSize = fileSize;
    }
}
