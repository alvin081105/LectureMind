package com.lecturemind.backend.controller;

import com.lecturemind.backend.dto.request.ReviewQuizRequest;
import com.lecturemind.backend.dto.response.DiagnosisResponse;
import com.lecturemind.backend.dto.response.QuizSetResponse;
import com.lecturemind.backend.dto.response.ReviewScheduleResponse;
import com.lecturemind.backend.service.LearningService;
import com.lecturemind.backend.util.SecurityUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/learning")
@RequiredArgsConstructor
public class LearningController {

    private final LearningService learningService;

    @GetMapping("/diagnosis/{lectureId}")
    public ResponseEntity<DiagnosisResponse> getDiagnosis(@PathVariable Long lectureId) {
        return ResponseEntity.ok(learningService.getDiagnosis(SecurityUtil.getCurrentUserId(), lectureId));
    }

    @PostMapping("/review-quiz")
    public ResponseEntity<QuizSetResponse> generateReviewQuiz(@Valid @RequestBody ReviewQuizRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(learningService.generateReviewQuiz(SecurityUtil.getCurrentUserId(), request));
    }

    @GetMapping("/schedule")
    public ResponseEntity<List<ReviewScheduleResponse>> getSchedule() {
        return ResponseEntity.ok(learningService.getSchedule(SecurityUtil.getCurrentUserId()));
    }

    @PostMapping("/schedule/{lectureId}/complete")
    public ResponseEntity<ReviewScheduleResponse> completeReview(@PathVariable Long lectureId) {
        return ResponseEntity.ok(learningService.completeReview(SecurityUtil.getCurrentUserId(), lectureId));
    }
}
