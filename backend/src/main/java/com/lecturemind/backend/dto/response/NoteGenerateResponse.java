package com.lecturemind.backend.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class NoteGenerateResponse {
    private Long noteId;
    private Long lectureId;
    private String status;
}
