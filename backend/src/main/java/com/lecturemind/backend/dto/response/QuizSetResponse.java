package com.lecturemind.backend.dto.response;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.lecturemind.backend.domain.Quiz;
import com.lecturemind.backend.domain.QuizSet;
import lombok.Builder;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;

import java.util.Collections;
import java.util.List;

@Slf4j
@Getter
@Builder
public class QuizSetResponse {
    private Long quizSetId;
    private Long noteId;
    private List<QuizItem> quizzes;

    @Getter
    @Builder
    public static class QuizItem {
        private Long quizId;
        private String bloomLevel;
        private String type;
        private String question;
        private List<String> options;
        private String correctAnswer;
        private String explanation;

        private static final ObjectMapper objectMapper = new ObjectMapper();

        public static QuizItem from(Quiz quiz) {
            List<String> options = null;
            if (quiz.getOptions() != null) {
                try {
                    options = objectMapper.readValue(quiz.getOptions(), new TypeReference<>() {});
                } catch (Exception e) {
                    log.warn("options 파싱 실패: {}", e.getMessage());
                }
            }
            return QuizItem.builder()
                    .quizId(quiz.getId())
                    .bloomLevel(quiz.getBloomLevel())
                    .type(quiz.getType())
                    .question(quiz.getQuestion())
                    .options(options)
                    .correctAnswer(quiz.getCorrectAnswer())
                    .explanation(quiz.getExplanation())
                    .build();
        }
    }

    public static QuizSetResponse of(QuizSet quizSet, List<Quiz> quizzes) {
        return QuizSetResponse.builder()
                .quizSetId(quizSet.getId())
                .noteId(quizSet.getNote().getId())
                .quizzes(quizzes.stream().map(QuizItem::from).toList())
                .build();
    }
}
