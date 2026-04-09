package com.lecturemind.backend.controller;

import com.lecturemind.backend.common.dto.PageResponse;
import com.lecturemind.backend.dto.request.AnalysisGenerateRequest;
import com.lecturemind.backend.dto.response.AnalysisGenerateResponse;
import com.lecturemind.backend.dto.response.AnalysisListResponse;
import com.lecturemind.backend.dto.response.AnalysisResponse;
import com.lecturemind.backend.service.AnalysisService;
import com.lecturemind.backend.util.SecurityUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;

@RestController
@RequestMapping("/api/v1/analysis")
@RequiredArgsConstructor
public class AnalysisController {

    private final AnalysisService analysisService;

    @PostMapping("/generate")
    public ResponseEntity<AnalysisGenerateResponse> generate(@Valid @RequestBody AnalysisGenerateRequest request) {
        return ResponseEntity.status(HttpStatus.ACCEPTED)
                .body(analysisService.generate(SecurityUtil.getCurrentUserId(), request));
    }

    @GetMapping
    public ResponseEntity<PageResponse<AnalysisListResponse>> getAnalysisList(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PageRequest pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return ResponseEntity.ok(analysisService.getAnalysisList(SecurityUtil.getCurrentUserId(), pageable));
    }

    @GetMapping("/{analysisId}")
    public ResponseEntity<AnalysisResponse> getAnalysis(@PathVariable Long analysisId) {
        return ResponseEntity.ok(analysisService.getAnalysis(SecurityUtil.getCurrentUserId(), analysisId));
    }

    @GetMapping("/{analysisId}/export")
    public ResponseEntity<byte[]> export(@PathVariable Long analysisId) {
        byte[] content = analysisService.exportPdf(SecurityUtil.getCurrentUserId(), analysisId);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentDisposition(ContentDisposition.attachment()
                .filename("analysis_" + analysisId + ".pdf", StandardCharsets.UTF_8)
                .build());
        headers.set(HttpHeaders.CONTENT_TYPE, "application/pdf");

        return ResponseEntity.ok().headers(headers).body(content);
    }
}
