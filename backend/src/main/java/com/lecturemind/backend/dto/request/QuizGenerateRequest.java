package com.lecturemind.backend.dto.request;

import jakarta.validation.constraints.*;
import lombok.Getter;

import java.util.List;

@Getter
public class QuizGenerateRequest {

    @NotNull(message = "노트 ID를 입력해주세요.")
    private Long noteId;

    @NotEmpty(message = "블룸 레벨을 하나 이상 선택해주세요.")
    private List<String> bloomLevels;

    @Min(value = 1, message = "최소 1문제 이상이어야 합니다.")
    @Max(value = 30, message = "최대 30문제까지 생성할 수 있습니다.")
    private int count = 10;

    public void setNoteId(Long noteId) { this.noteId = noteId; }
    public void setBloomLevels(List<String> bloomLevels) { this.bloomLevels = bloomLevels; }
    public void setCount(int count) { this.count = count; }
}
