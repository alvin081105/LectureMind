package com.lecturemind.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.lecturemind.backend.common.exception.ForbiddenException;
import com.lecturemind.backend.domain.*;
import com.lecturemind.backend.dto.request.ChatMessageRequest;
import com.lecturemind.backend.dto.request.ChatSessionRequest;
import com.lecturemind.backend.dto.response.ChatMessageResponse;
import com.lecturemind.backend.dto.response.ChatSessionResponse;
import com.lecturemind.backend.repository.*;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChatService {

    private final ChatSessionRepository chatSessionRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final NoteRepository noteRepository;
    private final UserRepository userRepository;
    private final ClaudeApiClient claudeApiClient;
    private final ObjectMapper objectMapper;

    @Transactional
    public ChatSessionResponse createSession(Long userId, ChatSessionRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("사용자를 찾을 수 없습니다."));
        if (user.getRole() != Role.STUDENT) {
            throw new ForbiddenException("학생만 채팅 튜터를 사용할 수 있습니다.");
        }

        Note note = noteRepository.findById(request.getNoteId())
                .orElseThrow(() -> new EntityNotFoundException("노트를 찾을 수 없습니다."));
        if (!note.getUser().getId().equals(userId)) {
            throw new ForbiddenException("접근 권한이 없습니다.");
        }

        ChatSession session = chatSessionRepository.save(ChatSession.builder()
                .note(note)
                .user(user)
                .build());

        log.info("채팅 세션 생성: sessionId={}", session.getId());
        return ChatSessionResponse.from(session);
    }

    @Transactional(readOnly = true)
    public List<ChatSessionResponse> getSessions(Long userId) {
        return chatSessionRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(ChatSessionResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ChatMessageResponse> getMessages(Long userId, Long sessionId) {
        ChatSession session = findOwnSession(userId, sessionId);
        return chatMessageRepository.findBySessionIdOrderByCreatedAtAsc(session.getId())
                .stream()
                .map(ChatMessageResponse::from)
                .toList();
    }

    @Transactional
    public ChatMessageResponse sendMessage(Long userId, Long sessionId, ChatMessageRequest request) {
        ChatSession session = findOwnSession(userId, sessionId);
        Note note = session.getNote();

        chatMessageRepository.save(ChatMessage.builder()
                .session(session)
                .role("USER")
                .content(request.getContent())
                .build());

        String systemPrompt = buildSystemPrompt(note);
        String aiResponse = claudeApiClient.sendMessage(systemPrompt, request.getContent());

        String content = aiResponse;
        String bloomLevel = null;
        String suggestion = null;

        try {
            String json = extractJson(aiResponse);
            JsonNode node = objectMapper.readTree(json);
            content = node.path("content").asText(aiResponse);
            bloomLevel = node.has("bloomLevel") ? node.get("bloomLevel").asText() : null;
            suggestion = node.has("suggestion") ? node.get("suggestion").asText() : null;
        } catch (Exception e) {
            log.warn("AI 응답 JSON 파싱 실패, 원문 사용: {}", e.getMessage());
        }

        ChatMessage aiMessage = chatMessageRepository.save(ChatMessage.builder()
                .session(session)
                .role("ASSISTANT")
                .content(content)
                .bloomLevel(bloomLevel)
                .build());

        log.info("채팅 응답 완료: sessionId={}", sessionId);
        return ChatMessageResponse.builder()
                .messageId(aiMessage.getId())
                .role(aiMessage.getRole())
                .content(aiMessage.getContent())
                .bloomLevel(aiMessage.getBloomLevel())
                .suggestion(suggestion)
                .createdAt(aiMessage.getCreatedAt())
                .build();
    }

    private ChatSession findOwnSession(Long userId, Long sessionId) {
        ChatSession session = chatSessionRepository.findById(sessionId)
                .orElseThrow(() -> new EntityNotFoundException("채팅 세션을 찾을 수 없습니다."));
        if (!session.getUser().getId().equals(userId)) {
            throw new ForbiddenException("접근 권한이 없습니다.");
        }
        return session;
    }

    private String buildSystemPrompt(Note note) {
        String transcript = note.getLecture().getTranscript() != null
                ? note.getLecture().getTranscript() : "(트랜스크립트 없음)";
        return String.format("""
                당신은 학생의 AI 학습 튜터입니다.

                컨텍스트 - 구조화 노트:
                %s

                컨텍스트 - 원본 트랜스크립트:
                %s

                규칙:
                1. 반드시 위 컨텍스트에 기반하여 답변하세요.
                2. 답변에 해당하는 블룸 레벨을 판단하여 JSON으로 포함하세요.
                3. 더 깊은 학습을 위한 가이드를 제안하세요.
                4. 컨텍스트에 없는 내용이면 "이 강의에서 다루지 않은 내용입니다"라고 안내하세요.

                응답 형식 (JSON만):
                {"content":"답변 내용","bloomLevel":"REMEMBER","suggestion":"학습 가이드"}
                """, note.getContent(), transcript);
    }

    private String extractJson(String response) {
        response = response.trim();
        int start = response.indexOf('{');
        int end = response.lastIndexOf('}');
        return (start != -1 && end != -1) ? response.substring(start, end + 1) : response;
    }
}
