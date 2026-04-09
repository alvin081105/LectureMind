package com.lecturemind.backend.repository;

import com.lecturemind.backend.domain.QuizResult;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface QuizResultRepository extends JpaRepository<QuizResult, Long> {
    Page<QuizResult> findByUserIdOrderBySubmittedAtDesc(Long userId, Pageable pageable);

    @Query("SELECT qr FROM QuizResult qr WHERE qr.user.id = :userId AND qr.quizSet.note.lecture.id = :lectureId ORDER BY qr.submittedAt DESC")
    List<QuizResult> findByUserIdAndLectureId(@Param("userId") Long userId, @Param("lectureId") Long lectureId);
}
