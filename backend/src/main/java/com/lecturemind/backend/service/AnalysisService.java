package com.lecturemind.backend.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.lecturemind.backend.common.dto.PageResponse;
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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import com.lowagie.text.*;
import com.lowagie.text.Font;
import com.lowagie.text.pdf.BaseFont;
import com.lowagie.text.pdf.PdfWriter;

import java.awt.Color;
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
    private final AnalysisAsyncRunner asyncRunner;
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

        // 기존 분석이 있으면 초기화 후 재분석, 없으면 새로 생성
        Analysis analysis = analysisRepository.findByLectureIdAndUserId(lecture.getId(), userId)
                .map(existing -> { existing.reset(); return analysisRepository.save(existing); })
                .orElseGet(() -> analysisRepository.save(Analysis.builder()
                        .lecture(lecture)
                        .user(user)
                        .build()));

        Long analysisId = analysis.getId();
        String transcript = lecture.getTranscript();

        // 트랜잭션 커밋 후 비동기 분석 시작 (커밋 전 호출 시 async 스레드가 미커밋 데이터를 못 읽는 문제 방지)
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit() {
                asyncRunner.analyzeAsync(analysisId, transcript, SYSTEM_PROMPT);
            }
        });

        log.info("강의 분석 요청 완료: analysisId={}", analysisId);
        return AnalysisGenerateResponse.builder()
                .analysisId(analysisId)
                .lectureId(lecture.getId())
                .status("ANALYZING")
                .build();
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

            // 한글 폰트 (클래스패스 NanumGothic.ttf → 없으면 Helvetica 폴백)
            BaseFont koreanBf = null;
            try (InputStream fs = getClass().getResourceAsStream("/fonts/NanumGothic.ttf")) {
                if (fs != null) {
                    byte[] fontBytes = fs.readAllBytes();
                    koreanBf = BaseFont.createFont("NanumGothic.ttf",
                            BaseFont.IDENTITY_H, BaseFont.EMBEDDED, true, fontBytes, null);
                }
            } catch (Exception e) {
                log.warn("Korean font load failed, using Helvetica: {}", e.getMessage());
            }

            final Font titleFont, headingFont, bodyFont, highFont;
            if (koreanBf != null) {
                titleFont   = new Font(koreanBf, 18, Font.BOLD);
                headingFont = new Font(koreanBf, 13, Font.BOLD);
                bodyFont    = new Font(koreanBf, 10, Font.NORMAL);
                highFont    = new Font(koreanBf, 10, Font.BOLD, Color.RED);
            } else {
                titleFont   = new Font(Font.HELVETICA, 18, Font.BOLD);
                headingFont = new Font(Font.HELVETICA, 13, Font.BOLD);
                bodyFont    = new Font(Font.HELVETICA, 10, Font.NORMAL);
                highFont    = new Font(Font.HELVETICA, 10, Font.BOLD, Color.RED);
            }

            // 제목
            Paragraph title = new Paragraph("LectureMind Analysis Report", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingAfter(20);
            document.add(title);

            // 강의 정보
            document.add(new Paragraph("Lecture: " + analysis.getLecture().getTitle(), headingFont));
            document.add(new Paragraph("Status: " + analysis.getStatus(), bodyFont));
            document.add(new Paragraph("Created: " + analysis.getCreatedAt(), bodyFont));
            document.add(Chunk.NEWLINE);

            // 요약
            if (analysis.getSummary() != null) {
                document.add(new Paragraph("Summary", headingFont));
                try {
                    Map<String, Object> summary = objectMapper.readValue(
                            analysis.getSummary(), new TypeReference<>() {});
                    summary.forEach((k, v) -> addSafe(document, "  " + k + ": " + v, bodyFont));
                } catch (Exception e) {
                    addSafe(document, analysis.getSummary(), bodyFont);
                }
                document.add(Chunk.NEWLINE);
            }

            // 난이도 타임라인 (time/difficulty 필드명, startTime/difficultyScore 폴백)
            if (analysis.getDifficultyTimeline() != null) {
                document.add(new Paragraph("Difficulty Timeline", headingFont));
                try {
                    List<Map<String, Object>> timeline = objectMapper.readValue(
                            analysis.getDifficultyTimeline(), new TypeReference<>() {});
                    for (Map<String, Object> item : timeline) {
                        Object time = item.getOrDefault("time", item.get("startTime"));
                        Object diff = item.getOrDefault("difficulty", item.get("difficultyScore"));
                        Object desc = item.getOrDefault("description", "");
                        addSafe(document, String.format("  [%s] difficulty: %s  %s", time, diff, desc), bodyFont);
                    }
                } catch (Exception e) {
                    addSafe(document, analysis.getDifficultyTimeline(), bodyFont);
                }
                document.add(Chunk.NEWLINE);
            }

            // 개선 제안
            if (analysis.getImprovements() != null) {
                document.add(new Paragraph("Improvement Suggestions", headingFont));
                try {
                    List<Map<String, Object>> improvements = objectMapper.readValue(
                            analysis.getImprovements(), new TypeReference<>() {});
                    for (Map<String, Object> item : improvements) {
                        String priority = String.valueOf(item.getOrDefault("priority", ""));
                        Font itemFont = "HIGH".equals(priority) ? highFont : bodyFont;
                        addSafe(document, "  [" + priority + "] " + item.getOrDefault("issue", ""), itemFont);
                        addSafe(document, "  -> " + item.getOrDefault("suggestion", ""), bodyFont);
                    }
                } catch (Exception e) {
                    addSafe(document, analysis.getImprovements(), bodyFont);
                }
            }

            document.close();
            return baos.toByteArray();
        } catch (Exception e) {
            log.error("PDF 생성 실패: analysisId={}, error={}", analysisId, e.getMessage(), e);
            throw new RuntimeException("PDF 생성에 실패했습니다.", e);
        }
    }

    private void addSafe(Document document, String text, Font font) {
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
}
