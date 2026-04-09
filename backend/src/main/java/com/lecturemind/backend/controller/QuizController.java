package com.lecturemind.backend.controller;

import com.lecturemind.backend.common.dto.PageResponse;
import com.lecturemind.backend.dto.request.QuizGenerateRequest;
import com.lecturemind.backend.dto.request.QuizSubmitRequest;
import com.lecturemind.backend.dto.response.QuizResultResponse;
import com.lecturemind.backend.dto.response.QuizSetResponse;
import com.lecturemind.backend.service.QuizService;
import com.lecturemind.backend.util.SecurityUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/quizzes")
@RequiredArgsConstructor
public class QuizController {

    private final QuizService quizService;

    @PostMapping("/generate")
    public ResponseEntity<QuizSetResponse> generate(@Valid @RequestBody QuizGenerateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(quizService.generate(SecurityUtil.getCurrentUserId(), request));
    }

    @PostMapping("/{quizSetId}/submit")
    public ResponseEntity<QuizResultResponse> submit(
            @PathVariable Long quizSetId,
            @Valid @RequestBody QuizSubmitRequest request) {
        return ResponseEntity.ok(quizService.submit(SecurityUtil.getCurrentUserId(), quizSetId, request));
    }

    @GetMapping("/history")
    public ResponseEntity<PageResponse<QuizResultResponse>> getHistory(
            @RequestParam(required = false) Long lectureId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PageRequest pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "submittedAt"));
        return ResponseEntity.ok(quizService.getHistory(SecurityUtil.getCurrentUserId(), lectureId, pageable));
    }
}
