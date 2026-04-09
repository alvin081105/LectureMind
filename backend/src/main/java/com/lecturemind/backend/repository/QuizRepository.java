package com.lecturemind.backend.repository;

import com.lecturemind.backend.domain.Quiz;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface QuizRepository extends JpaRepository<Quiz, Long> {
    List<Quiz> findByQuizSetId(Long quizSetId);
}
