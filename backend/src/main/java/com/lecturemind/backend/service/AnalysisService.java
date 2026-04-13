package com.lecturemind.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.lecturemind.backend.common.dto.PageResponse;
import com.lecturemind.backend.common.exception.DuplicateException;
import com.lecturemind.backend.common.exception.ForbiddenException;
import com.lecturemind.backend.domain.*;
import com.lecturemind.backend.dto.request.AnalysisGenerateRequest;
import com.lecturemind.backend.dto.response.AnalysisGenerateResponse;
import com.lecturemind.backend.dto.response.AnalysisListResponse;
import com.lecturemind.backend.dto.response.AnalysisResponse;
import com.lecturemind.backend.repository.AnalysisRepository;
import com.lecturemind.backend.repository.LectureRepository;
import com.lecturemind.backend.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.core.type.TypeReference;
import com.lowagie.text.*;
import com.lowagie.text.Font;
import com.lowagie.text.pdf.BaseFont;
import com.lowagie.text.pdf.PdfWriter;

import java.awt.*;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class AnalysisService {

    private static final String SYSTEM_PROMPT = """
            당신은 교육 품질 분석 전문가입니다. 아래 강의 트랜스크립트를 분석하여 교수자에게 피드백을 제공해주세요.

            분석 항목:
            1. 강의 요약 (주제, 핵심 내용)
            2. 블룸 분류 체계 분포 (각 레벨 비율, 합계 1.0)
            3. 난이도 타임라인 (시간대별 난이도 0-10)
            4. 문제 구간:
               - DIFFICULTY_SPIKE: 난이도가 급격히 상승하는 구간
               - MISSING_PREREQUISITE: 전제 지식 없이 사용된 용어/개념
               - INSUFFICIENT_EXPLANATION: 핵심 개념 대비 설명이 부족한 구간
            5. 구체적 개선 제안 (priority: HIGH/MEDIUM/LOW)

            반드시 아래 JSON 형식으로만 응답하세요 (다른 텍스트 없이 JSON만).

            출력 형식:
            {"summary":{"topic":"","duration":"","conceptCount":0,"bloomDistribution":{"REMEMBER":0.0,"UNDERSTAND":0.0,"APPLY":0.0,"ANALYZE":0.0,"EVALUATE":0.0,"CREATE":0.0}},"difficultyTimeline":[{"time":"00:00","difficulty":0.0,"issueType":null}],"improvements":[{"id":"1","targetSection":"","startTime":"","endTime":"","issueType":"DIFFICULTY_SPIKE","issue":"","suggestion":"","priority":"HIGH"}]}
            """;

    private final AnalysisRepository analysisRepository;
    private final LectureRepository lectureRepository;
    private final UserRepository userRepository;
    private final ClaudeApiClient claudeApiClient;
    private final ObjectMapper objectMapper;

    @Transactional
    public AnalysisGenerateResponse generate(Long userId, AnalysisGenerateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("사용자를 찾을 수 없습니다."));
        if (user.getRole() != Role.PROFESSOR) {
            throw new ForbiddenException("교수만 강의 분석을 요청할 수 있습니다.");
        }

        Lecture lecture = lectureRepository.findById(request.getLectureId())
                .orElseThrow(() -> new EntityNotFoundException("강의를 찾을 수 없습니다."));
        if (!lecture.getUser().getId().equals(userId)) {
            throw new ForbiddenException("접근 권한이 없습니다.");
        }
        if (lecture.getStatus() != LectureStatus.COMPLETED) {
            throw new IllegalArgumentException("STT가 완료된 강의만 분석할 수 있습니다.");
        }
        if (analysisRepository.existsByLectureIdAndUserId(lecture.getId(), userId)) {
            throw new DuplicateException("이미 해당 강의의 분석이 존재합니다.");
        }

        Analysis analysis = analysisRepository.save(Analysis.builder()
                .lecture(lecture)
                .user(user)
                .build());

        analyzeAsync(analysis.getId(), lecture.getTranscript());

        log.info("강의 분석 요청 완료: analysisId={}", analysis.getId());
        return AnalysisGenerateResponse.builder()
                .analysisId(analysis.getId())
                .lectureId(lecture.getId())
                .status("ANALYZING")
                .build();
    }

    @Async("taskExecutor")
    @Transactional
    public void analyzeAsync(Long analysisId, String transcript) {
        log.info("강의 분석 시작: analysisId={}", analysisId);
        Analysis analysis = analysisRepository.findById(analysisId)
                .orElseThrow(() -> new EntityNotFoundException("분석을 찾을 수 없습니다."));
        try {
            String response = claudeApiClient.sendMessage(SYSTEM_PROMPT, transcript);
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

    @Transactional(readOnly = true)
    public AnalysisResponse getAnalysis(Long userId, Long analysisId) {
        Analysis analysis = findOwnAnalysis(userId, analysisId);
        return AnalysisResponse.from(analysis);
    }

    @Transactional(readOnly = true)
    public PageResponse<AnalysisListResponse> getAnalysisList(Long userId, Pageable pageable) {
        return new PageResponse<>(
                analysisRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable)
                        .map(AnalysisListResponse::from)
        );
    }

    public byte[] exportPdf(Long userId, Long analysisId) {
        Analysis analysis = findOwnAnalysis(userId, analysisId);
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4, 50, 50, 60, 60);
            PdfWriter.getInstance(document, baos);
            document.open();

            // 한글 폰트 설정 (NanumGothic 없으면 Helvetica 폴백)
            Font titleFont;
            Font headingFont;
            Font bodyFont;
            try (InputStream fontStream = getClass().getResourceAsStream("/fonts/NanumGothic.ttf")) {
                if (fontStream != null) {
                    BaseFont bf = BaseFont.createFont("/fonts/NanumGothic.ttf", BaseFont.IDENTITY_H, BaseFont.EMBEDDED);
                    titleFont   = new Font(bf, 18, Font.BOLD);
                    headingFont = new Font(bf, 13, Font.BOLD);
                    bodyFont    = new Font(bf, 10, Font.NORMAL);
                } else {
                    titleFont   = new Font(Font.HELVETICA, 18, Font.BOLD);
                    headingFont = new Font(Font.HELVETICA, 13, Font.BOLD);
                    bodyFont    = new Font(Font.HELVETICA, 10, Font.NORMAL);
                }
            }

            // 제목
            Paragraph title = new Paragraph("LectureMind 강의 분석 리포트", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingAfter(20);
            document.add(title);

            // 강의 정보
            document.add(new Paragraph("강의: " + analysis.getLecture().getTitle(), headingFont));
            document.add(new Paragraph("상태: " + analysis.getStatus(), bodyFont));
            document.add(new Paragraph("생성일: " + analysis.getCreatedAt(), bodyFont));
            document.add(Chunk.NEWLINE);

            // 요약
            if (analysis.getSummary() != null) {
                document.add(new Paragraph("강의 요약", headingFont));
                try {
                    Map<String, Object> summary = objectMapper.readValue(
                            analysis.getSummary(), new TypeReference<>() {});
                    summary.forEach((k, v) ->
                            addParagraphSafe(document, "  " + k + ": " + v, bodyFont));
                } catch (Exception e) {
                    document.add(new Paragraph(analysis.getSummary(), bodyFont));
                }
                document.add(Chunk.NEWLINE);
            }

            // 난이도 타임라인
            if (analysis.getDifficultyTimeline() != null) {
                document.add(new Paragraph("난이도 타임라인", headingFont));
                try {
                    List<Map<String, Object>> timeline = objectMapper.readValue(
                            analysis.getDifficultyTimeline(), new TypeReference<>() {});
                    for (Map<String, Object> item : timeline) {
                        String line = String.format("  [%s ~ %s] 난이도: %s  %s",
                                item.get("startTime"), item.get("endTime"),
                                item.get("difficultyScore"), item.getOrDefault("description", ""));
                        document.add(new Paragraph(line, bodyFont));
                    }
                } catch (Exception e) {
                    document.add(new Paragraph(analysis.getDifficultyTimeline(), bodyFont));
                }
                document.add(Chunk.NEWLINE);
            }

            // 개선 제안
            if (analysis.getImprovements() != null) {
                document.add(new Paragraph("개선 제안", headingFont));
                try {
                    List<Map<String, Object>> improvements = objectMapper.readValue(
                            analysis.getImprovements(), new TypeReference<>() {});
                    for (Map<String, Object> item : improvements) {
                        String priority = String.valueOf(item.getOrDefault("priority", ""));
                        Font itemFont = "HIGH".equals(priority)
                                ? new Font(bodyFont.getBaseFont(), 10, Font.BOLD, Color.RED)
                                : bodyFont;
                        document.add(new Paragraph(
                                "  [" + priority + "] " + item.getOrDefault("issue", ""), itemFont));
                        document.add(new Paragraph(
                                "  → " + item.getOrDefault("suggestion", ""), bodyFont));
                    }
                } catch (Exception e) {
                    document.add(new Paragraph(analysis.getImprovements(), bodyFont));
                }
            }

            document.close();
            return baos.toByteArray();
        } catch (Exception e) {
            log.error("PDF 생성 실패: analysisId={}, error={}", analysisId, e.getMessage(), e);
            throw new RuntimeException("PDF 생성에 실패했습니다.", e);
        }
    }

    private void addParagraphSafe(Document document, String text, Font font) {
        try {
            document.add(new Paragraph(text, font));
        } catch (DocumentException e) {
            log.warn("PDF 단락 추가 실패: {}", e.getMessage());
        }
    }

    private Analysis findOwnAnalysis(Long userId, Long analysisId) {
        Analysis analysis = analysisRepository.findById(analysisId)
                .orElseThrow(() -> new EntityNotFoundException("분석 결과를 찾을 수 없습니다."));
        if (!analysis.getUser().getId().equals(userId)) {
            throw new ForbiddenException("접근 권한이 없습니다.");
        }
        return analysis;
    }

    private String extractJson(String response) {
        response = response.trim();
        int start = response.indexOf('{');
        int end = response.lastIndexOf('}');
        return (start != -1 && end != -1) ? response.substring(start, end + 1) : response;
    }
}
