package com.lecturemind.backend.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class ClaudeApiClient {

    private final WebClient.Builder webClientBuilder;

    @Value("${anthropic.api-key}")
    private String apiKey;

    private static final String API_URL = "https://api.anthropic.com/v1/messages";
    private static final String MODEL = "claude-sonnet-4-20250514";
    private static final String API_VERSION = "2023-06-01";

    public String sendMessage(String systemPrompt, String userMessage) {
        log.info("Claude API 호출 시작");

        Map<String, Object> body = Map.of(
                "model", MODEL,
                "max_tokens", 4096,
                "system", systemPrompt,
                "messages", List.of(
                        Map.of("role", "user", "content", userMessage)
                )
        );

        @SuppressWarnings("unchecked")
        Map<String, Object> response = (Map<String, Object>) webClientBuilder.build()
                .post()
                .uri(API_URL)
                .header("x-api-key", apiKey)
                .header("anthropic-version", API_VERSION)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(body)
                .retrieve()
                .bodyToMono(Map.class)
                .block();

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> content = (List<Map<String, Object>>) response.get("content");
        String result = (String) content.get(0).get("text");

        log.info("Claude API 호출 완료");
        return result;
    }
}
