package com.lecturemind.backend.controller;

import com.lecturemind.backend.common.dto.PageResponse;
import com.lecturemind.backend.domain.LectureStatus;
import com.lecturemind.backend.dto.response.LectureDetailResponse;
import com.lecturemind.backend.dto.response.LectureResponse;
import com.lecturemind.backend.dto.response.LectureStatusResponse;
import com.lecturemind.backend.service.LectureService;
import com.lecturemind.backend.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/v1/lectures")
@RequiredArgsConstructor
public class LectureController {

    private final LectureService lectureService;

    @PostMapping
    public ResponseEntity<LectureResponse> upload(
            @RequestParam("file") MultipartFile file,
            @RequestParam("title") String title) throws IOException {
        return ResponseEntity.status(HttpStatus.ACCEPTED)
                .body(lectureService.upload(SecurityUtil.getCurrentUserId(), file, title));
    }

    @GetMapping
    public ResponseEntity<PageResponse<LectureResponse>> getLectures(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) LectureStatus status) {
        PageRequest pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return ResponseEntity.ok(lectureService.getLectures(SecurityUtil.getCurrentUserId(), status, pageable));
    }

    @GetMapping("/{lectureId}")
    public ResponseEntity<LectureDetailResponse> getLecture(@PathVariable Long lectureId) {
        return ResponseEntity.ok(lectureService.getLecture(SecurityUtil.getCurrentUserId(), lectureId));
    }

    @GetMapping("/{lectureId}/status")
    public ResponseEntity<LectureStatusResponse> getStatus(@PathVariable Long lectureId) {
        return ResponseEntity.ok(lectureService.getStatus(SecurityUtil.getCurrentUserId(), lectureId));
    }

    @DeleteMapping("/{lectureId}")
    public ResponseEntity<Void> deleteLecture(@PathVariable Long lectureId) throws IOException {
        lectureService.deleteLecture(SecurityUtil.getCurrentUserId(), lectureId);
        return ResponseEntity.noContent().build();
    }
}
