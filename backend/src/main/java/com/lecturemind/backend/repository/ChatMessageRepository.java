package com.lecturemind.backend.repository;

import com.lecturemind.backend.domain.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    List<ChatMessage> findBySessionIdOrderByCreatedAtAsc(Long sessionId);
    int countBySessionId(Long sessionId);
}
