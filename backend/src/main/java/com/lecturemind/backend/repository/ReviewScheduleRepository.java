package com.lecturemind.backend.repository;

import com.lecturemind.backend.domain.ReviewSchedule;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface ReviewScheduleRepository extends JpaRepository<ReviewSchedule, Long> {
    List<ReviewSchedule> findByUserId(Long userId);
    List<ReviewSchedule> findByUserIdAndNextReviewDateLessThanEqual(Long userId, LocalDate date);
    Optional<ReviewSchedule> findByUserIdAndLectureId(Long userId, Long lectureId);
}
