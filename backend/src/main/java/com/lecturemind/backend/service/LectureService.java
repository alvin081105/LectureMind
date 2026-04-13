package com.lecturemind.backend.service;

import com.lecturemind.backend.common.dto.PageResponse;
import com.lecturemind.backend.common.exception.ForbiddenException;
import com.lecturemind.backend.domain.Lecture;
import com.lecturemind.backend.domain.LectureStatus;
import com.lecturemind.backend.domain.User;
import com.lecturemind.backend.dto.response.LectureDetailResponse;
import com.lecturemind.backend.dto.response.LectureResponse;
import com.lecturemind.backend.dto.response.LectureStatusResponse;
import com.lecturemind.backend.repository.AnalysisRepository;
import com.lecturemind.backend.repository.LectureRepository;
import com.lecturemind.backend.repository.NoteRepository;
import com.lecturemind.backend.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class LectureService {

    private static final List<String> ALLOWED_EXTENSIONS = Arrays.asList("mp3", "wav", "mp4", "m4a", "webm");
    private static final long MAX_FILE_SIZE = 500L * 1024 * 1024; // 500MB

    private final LectureRepository lectureRepository;
    private final NoteRepository noteRepository;
    private final AnalysisRepository analysisRepository;
    private final UserRepository userRepository;
    private final WhisperService whisperService;

    @Value("${file.upload-dir}")
    private String uploadDir;

    @Transactional
    public LectureResponse upload(Long userId, MultipartFile file, String title) throws IOException {
        log.info("강의 업로드 시작: userId={}, title={}", userId, title);

        validateFile(file);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("사용자를 찾을 수 없습니다."));

        Lecture lecture = Lecture.builder()
                .user(user)
                .title(title)
                .status(LectureStatus.UPLOADING)
                .build();
        lecture = lectureRepository.save(lecture);

        String filePath = saveFile(file, userId, lecture.getId());
        String fileSize = formatFileSize(file.getSize());

        lecture.updateFilePath(filePath, fileSize);
        lecture.updateStatus(LectureStatus.PROCESSING);
        lectureRepository.save(lecture);

        whisperService.transcribe(lecture.getId());

        log.info("강의 업로드 완료, STT 시작: lectureId={}", lecture.getId());
        return LectureResponse.from(lecture);
    }

    @Transactional(readOnly = true)
    public PageResponse<LectureResponse> getLectures(Long userId, LectureStatus status, Pageable pageable) {
        Page<Lecture> lectures = (status != null)
                ? lectureRepository.findByUserIdAndStatus(userId, status, pageable)
                : lectureRepository.findByUserId(userId, pageable);

        return new PageResponse<>(lectures.map(LectureResponse::from));
    }

    @Transactional(readOnly = true)
    public LectureDetailResponse getLecture(Long userId, Long lectureId) {
        Lecture lecture = findOwnLecture(userId, lectureId);
        boolean hasNote = noteRepository.existsByLectureIdAndUserId(lectureId, userId);
        boolean hasAnalysis = analysisRepository.existsByLectureIdAndUserId(lectureId, userId);
        return LectureDetailResponse.of(lecture, hasNote, hasAnalysis);
    }

    @Transactional(readOnly = true)
    public LectureStatusResponse getStatus(Long userId, Long lectureId) {
        Lecture lecture = findOwnLecture(userId, lectureId);

        int progress = switch (lecture.getStatus()) {
            case UPLOADING -> 10;
            case PROCESSING -> 50;
            case COMPLETED -> 100;
            case FAILED -> 0;
        };

        return LectureStatusResponse.builder()
                .lectureId(lecture.getId())
                .status(lecture.getStatus())
                .progress(progress)
                .estimatedRemainingSeconds(lecture.getStatus() == LectureStatus.PROCESSING ? 180 : null)
                .build();
    }

    @Transactional
    public void deleteLecture(Long userId, Long lectureId) {
        Lecture lecture = findOwnLecture(userId, lectureId);

        if (lecture.getFilePath() != null) {
            new File(lecture.getFilePath()).delete();
        }

        lectureRepository.delete(lecture);
        log.info("강의 삭제 완료: lectureId={}", lectureId);
    }

    private Lecture findOwnLecture(Long userId, Long lectureId) {
        Lecture lecture = lectureRepository.findById(lectureId)
                .orElseThrow(() -> new EntityNotFoundException("강의를 찾을 수 없습니다."));
        if (!lecture.getUser().getId().equals(userId)) {
            throw new ForbiddenException("접근 권한이 없습니다.");
        }
        return lecture;
    }

    private void validateFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("파일이 비어있습니다.");
        }
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("파일 크기는 500MB를 초과할 수 없습니다.");
        }
        String extension = getExtension(file.getOriginalFilename());
        if (!ALLOWED_EXTENSIONS.contains(extension.toLowerCase())) {
            throw new IllegalArgumentException("지원하지 않는 파일 형식입니다. (허용: mp3, wav, mp4, m4a, webm)");
        }
    }

    private String saveFile(MultipartFile file, Long userId, Long lectureId) throws IOException {
        Path dir = Paths.get(uploadDir, String.valueOf(userId), String.valueOf(lectureId)).toAbsolutePath();
        Files.createDirectories(dir);

        String extension = getExtension(file.getOriginalFilename());
        String filename = UUID.randomUUID() + "." + extension;
        Path filePath = dir.resolve(filename);
        Files.copy(file.getInputStream(), filePath);

        return filePath.toString();
    }

    private String getExtension(String filename) {
        if (filename == null || !filename.contains(".")) return "";
        return filename.substring(filename.lastIndexOf('.') + 1);
    }

    private String formatFileSize(long bytes) {
        if (bytes < 1024 * 1024) return String.format("%.1fKB", bytes / 1024.0);
        return String.format("%.1fMB", bytes / (1024.0 * 1024));
    }
}
