package com.lecturemind.backend.repository;

import com.lecturemind.backend.domain.Analysis;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AnalysisRepository extends JpaRepository<Analysis, Long> {
    Optional<Analysis> findByLectureIdAndUserId(Long lectureId, Long userId);
    Page<Analysis> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
    boolean existsByLectureIdAndUserId(Long lectureId, Long userId);
}
