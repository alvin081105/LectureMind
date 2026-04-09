package com.lecturemind.backend.repository;

import com.lecturemind.backend.domain.Lecture;
import com.lecturemind.backend.domain.LectureStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LectureRepository extends JpaRepository<Lecture, Long> {
    Page<Lecture> findByUserId(Long userId, Pageable pageable);
    Page<Lecture> findByUserIdAndStatus(Long userId, LectureStatus status, Pageable pageable);
    List<Lecture> findByUserIdOrderByCreatedAtDesc(Long userId);
}
