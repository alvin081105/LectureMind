package com.lecturemind.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.lecturemind.backend.domain.Lecture;
import com.lecturemind.backend.domain.LectureStatus;
import com.lecturemind.backend.repository.LectureRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.MediaType;
import org.springframework.http.client.MultipartBodyBuilder;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;

import java.io.File;

@Slf4j
@Service
@RequiredArgsConstructor
public class WhisperService {

    private final LectureRepository lectureRepository;
    private final WebClient.Builder webClientBuilder;
    private final ObjectMapper objectMapper;

    @Value("${openai.api-key}")
    private String openAiApiKey;

    @Async("taskExecutor")
    @Transactional
    public void transcribe(Long lectureId) {
        log.info("STT 시작: lectureId={}", lectureId);

        Lecture lecture = lectureRepository.findById(lectureId)
                .orElseThrow(() -> new EntityNotFoundException("강의를 찾을 수 없습니다."));

        try {
            File audioFile = new File(lecture.getFilePath());
            if (!audioFile.exists()) {
                throw new IllegalStateException("강의 파일을 찾을 수 없습니다: " + lecture.getFilePath());
            }

            MultipartBodyBuilder builder = new MultipartBodyBuilder();
            builder.part("file", new FileSystemResource(audioFile));
            builder.part("model", "whisper-1");
            builder.part("language", "ko");
            builder.part("response_format", "verbose_json");

            String responseBody = webClientBuilder.build()
                    .post()
                    .uri("https://api.openai.com/v1/audio/transcriptions")
                    .header("Authorization", "Bearer " + openAiApiKey)
                    .contentType(MediaType.MULTIPART_FORM_DATA)
                    .body(BodyInserters.fromMultipartData(builder.build()))
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            JsonNode json = objectMapper.readTree(responseBody);
            String transcript = json.path("text").asText();
            String duration = formatDuration(json.path("duration").asDouble(0));

            lecture.updateTranscript(transcript, duration);
            lectureRepository.save(lecture);
            log.info("STT 완료: lectureId={}, duration={}", lectureId, duration);

        } catch (Exception e) {
            log.error("STT 실패: lectureId={}, error={}", lectureId, e.getMessage(), e);
            lecture.updateStatus(LectureStatus.FAILED);
            lectureRepository.save(lecture);
        }
    }

    private String formatDuration(double totalSeconds) {
        int hours = (int) (totalSeconds / 3600);
        int minutes = (int) ((totalSeconds % 3600) / 60);
        int seconds = (int) (totalSeconds % 60);
        if (hours > 0) {
            return String.format("%d:%02d:%02d", hours, minutes, seconds);
        }
        return String.format("%d:%02d", minutes, seconds);
    }
}
