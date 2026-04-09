package com.lecturemind.backend.dto.response;

import com.lecturemind.backend.domain.Lecture;
import com.lecturemind.backend.domain.LectureStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class LectureDetailResponse {
    private Long lectureId;
    private String title;
    private LectureStatus status;
    private String transcript;
    private String duration;
    private String fileSize;
    private LocalDateTime createdAt;
    private boolean hasNote;
    private boolean hasAnalysis;

    public static LectureDetailResponse of(Lecture lecture, boolean hasNote, boolean hasAnalysis) {
        return LectureDetailResponse.builder()
                .lectureId(lecture.getId())
                .title(lecture.getTitle())
                .status(lecture.getStatus())
                .transcript(lecture.getTranscript())
                .duration(lecture.getDuration())
                .fileSize(lecture.getFileSize())
                .createdAt(lecture.getCreatedAt())
                .hasNote(hasNote)
                .hasAnalysis(hasAnalysis)
                .build();
    }
}
