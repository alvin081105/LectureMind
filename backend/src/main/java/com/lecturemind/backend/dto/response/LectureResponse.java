package com.lecturemind.backend.dto.response;

import com.lecturemind.backend.domain.Lecture;
import com.lecturemind.backend.domain.LectureStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class LectureResponse {
    private Long lectureId;
    private String title;
    private LectureStatus status;
    private String duration;
    private String fileSize;
    private LocalDateTime createdAt;

    public static LectureResponse from(Lecture lecture) {
        return LectureResponse.builder()
                .lectureId(lecture.getId())
                .title(lecture.getTitle())
                .status(lecture.getStatus())
                .duration(lecture.getDuration())
                .fileSize(lecture.getFileSize())
                .createdAt(lecture.getCreatedAt())
                .build();
    }
}
