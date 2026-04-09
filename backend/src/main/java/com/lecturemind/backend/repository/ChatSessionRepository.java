package com.lecturemind.backend.repository;

import com.lecturemind.backend.domain.ChatSession;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ChatSessionRepository extends JpaRepository<ChatSession, Long> {
    List<ChatSession> findByUserIdOrderByCreatedAtDesc(Long userId);
}
