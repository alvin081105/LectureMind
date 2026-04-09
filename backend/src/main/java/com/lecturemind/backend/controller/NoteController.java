package com.lecturemind.backend.controller;

import com.lecturemind.backend.common.dto.PageResponse;
import com.lecturemind.backend.domain.NoteStatus;
import com.lecturemind.backend.dto.request.NoteGenerateRequest;
import com.lecturemind.backend.dto.response.NoteGenerateResponse;
import com.lecturemind.backend.dto.response.NoteListResponse;
import com.lecturemind.backend.dto.response.NoteResponse;
import com.lecturemind.backend.service.NoteService;
import com.lecturemind.backend.util.SecurityUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

import java.nio.charset.StandardCharsets;

@RestController
@RequestMapping("/api/v1/notes")
@RequiredArgsConstructor
public class NoteController {

    private final NoteService noteService;

    @PostMapping("/generate")
    public ResponseEntity<NoteGenerateResponse> generate(@Valid @RequestBody NoteGenerateRequest request) {
        return ResponseEntity.status(HttpStatus.ACCEPTED)
                .body(noteService.generate(SecurityUtil.getCurrentUserId(), request));
    }

    @GetMapping
    public ResponseEntity<PageResponse<NoteListResponse>> getNotes(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PageRequest pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return ResponseEntity.ok(noteService.getNotes(SecurityUtil.getCurrentUserId(), pageable));
    }

    @GetMapping("/{noteId}/status")
    public ResponseEntity<Map<String, Object>> getNoteStatus(@PathVariable Long noteId) {
        NoteStatus status = noteService.getNoteStatus(SecurityUtil.getCurrentUserId(), noteId);
        return ResponseEntity.ok(Map.of("noteId", noteId, "status", status));
    }

    @GetMapping("/{noteId}")
    public ResponseEntity<NoteResponse> getNote(@PathVariable Long noteId) {
        return ResponseEntity.ok(noteService.getNote(SecurityUtil.getCurrentUserId(), noteId));
    }

    @GetMapping("/{noteId}/export")
    public ResponseEntity<byte[]> export(
            @PathVariable Long noteId,
            @RequestParam(defaultValue = "markdown") String format) {
        String content = noteService.exportMarkdown(SecurityUtil.getCurrentUserId(), noteId);
        byte[] bytes = content.getBytes(StandardCharsets.UTF_8);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentDisposition(ContentDisposition.attachment()
                .filename("note_" + noteId + ".md", StandardCharsets.UTF_8)
                .build());
        headers.set(HttpHeaders.CONTENT_TYPE, "text/markdown; charset=UTF-8");

        return ResponseEntity.ok().headers(headers).body(bytes);
    }

    @DeleteMapping("/{noteId}")
    public ResponseEntity<Void> deleteNote(@PathVariable Long noteId) {
        noteService.deleteNote(SecurityUtil.getCurrentUserId(), noteId);
        return ResponseEntity.noContent().build();
    }
}
