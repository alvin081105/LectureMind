package com.lecturemind.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.lecturemind.backend.domain.Analysis;
import com.lecturemind.backend.repository.AnalysisRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class AnalysisAsyncRunner {

    private final AnalysisRepository analysisRepository;
    private final ClaudeApiClient claudeApiClient;
    private final ObjectMapper objectMapper;

    @Async("taskExecutor")
    @Transactional
    public void analyzeAsync(Long analysisId, String transcript, String systemPrompt) {
        log.info("강의 분석 시작: analysisId={}", analysisId);
        Analysis analysis = analysisRepository.findById(analysisId)
                .orElseThrow(() -> new EntityNotFoundException("분석을 찾을 수 없습니다."));
        try {
            String response = claudeApiClient.sendMessage(systemPrompt, transcript);
            String cleanJson = extractJson(response);
            JsonNode root = objectMapper.readTree(cleanJson);

            String summaryJson = objectMapper.writeValueAsString(root.get("summary"));
            String timelineJson = objectMapper.writeValueAsString(root.get("difficultyTimeline"));
            String improvementsJson = objectMapper.writeValueAsString(root.get("improvements"));

            analysis.complete(summaryJson, timelineJson, improvementsJson);
            analysisRepository.save(analysis);
            log.info("강의 분석 완료: analysisId={}", analysisId);
        } catch (Exception e) {
            log.error("강의 분석 실패: analysisId={}, error={}", analysisId, e.getMessage(), e);
            analysis.fail();
            analysisRepository.save(analysis);
        }
    }

    private String extractJson(String response) {
        response = response.trim();
        int start = response.indexOf('{');
        int end = response.lastIndexOf('}');
        return (start != -1 && end != -1) ? response.substring(start, end + 1) : response;
    }
}
