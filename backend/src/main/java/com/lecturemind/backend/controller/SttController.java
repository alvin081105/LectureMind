package com.lecturemind.backend.controller;

import com.lecturemind.backend.common.exception.ForbiddenException;
import com.lecturemind.backend.domain.Lecture;
import com.lecturemind.backend.domain.LectureStatus;
import com.lecturemind.backend.dto.request.SttRetryRequest;
import com.lecturemind.backend.repository.LectureRepository;
import com.lecturemind.backend.service.WhisperService;
import com.lecturemind.backend.util.SecurityUtil;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/stt")
@RequiredArgsConstructor
public class SttController {

    private final WhisperService whisperService;
    private final LectureRepository lectureRepository;

    @PostMapping("/transcribe")
    public ResponseEntity<Map<String, Object>> transcribe(@Valid @RequestBody SttRetryRequest request) {
        Long userId = SecurityUtil.getCurrentUserId();

        Lecture lecture = lectureRepository.findById(request.getLectureId())
                .orElseThrow(() -> new EntityNotFoundException("강의를 찾을 수 없습니다."));
        if (!lecture.getUser().getId().equals(userId)) {
            throw new ForbiddenException("접근 권한이 없습니다.");
        }
        if (lecture.getStatus() == LectureStatus.PROCESSING) {
            throw new IllegalArgumentException("이미 처리 중인 강의입니다.");
        }

        lecture.updateStatus(LectureStatus.PROCESSING);
        lectureRepository.save(lecture);
        whisperService.transcribe(lecture.getId());

        return ResponseEntity.accepted().body(Map.of(
                "lectureId", lecture.getId(),
                "status", "TRANSCRIBING",
                "estimatedTime", "약 3분"
        ));
    }
}
