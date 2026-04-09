package com.lecturemind.backend.controller;

import com.lecturemind.backend.dto.request.ChatMessageRequest;
import com.lecturemind.backend.dto.request.ChatSessionRequest;
import com.lecturemind.backend.dto.response.ChatMessageResponse;
import com.lecturemind.backend.dto.response.ChatSessionResponse;
import com.lecturemind.backend.service.ChatService;
import com.lecturemind.backend.util.SecurityUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    @PostMapping("/sessions")
    public ResponseEntity<ChatSessionResponse> createSession(@Valid @RequestBody ChatSessionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(chatService.createSession(SecurityUtil.getCurrentUserId(), request));
    }

    @GetMapping("/sessions")
    public ResponseEntity<List<ChatSessionResponse>> getSessions() {
        return ResponseEntity.ok(chatService.getSessions(SecurityUtil.getCurrentUserId()));
    }

    @GetMapping("/sessions/{sessionId}/messages")
    public ResponseEntity<List<ChatMessageResponse>> getMessages(@PathVariable Long sessionId) {
        return ResponseEntity.ok(chatService.getMessages(SecurityUtil.getCurrentUserId(), sessionId));
    }

    @PostMapping("/sessions/{sessionId}/messages")
    public ResponseEntity<ChatMessageResponse> sendMessage(
            @PathVariable Long sessionId,
            @Valid @RequestBody ChatMessageRequest request) {
        return ResponseEntity.ok(chatService.sendMessage(SecurityUtil.getCurrentUserId(), sessionId, request));
    }
}
