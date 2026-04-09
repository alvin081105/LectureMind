package com.lecturemind.backend.repository;

import com.lecturemind.backend.domain.QuizSet;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface QuizSetRepository extends JpaRepository<QuizSet, Long> {
    List<QuizSet> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<QuizSet> findByNoteId(Long noteId);
}
