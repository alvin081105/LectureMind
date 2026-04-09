package com.lecturemind.backend.repository;

import com.lecturemind.backend.domain.Note;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface NoteRepository extends JpaRepository<Note, Long> {
    Optional<Note> findByLectureIdAndUserId(Long lectureId, Long userId);
    Page<Note> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
    boolean existsByLectureIdAndUserId(Long lectureId, Long userId);
}
