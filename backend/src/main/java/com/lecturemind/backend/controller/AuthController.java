package com.lecturemind.backend.controller;

import com.lecturemind.backend.dto.request.ChangePasswordRequest;
import com.lecturemind.backend.dto.request.DeleteAccountRequest;
import com.lecturemind.backend.dto.request.LoginRequest;
import com.lecturemind.backend.dto.request.RefreshRequest;
import com.lecturemind.backend.dto.request.SignupRequest;
import com.lecturemind.backend.dto.request.UpdateProfileRequest;
import com.lecturemind.backend.dto.response.LoginResponse;
import com.lecturemind.backend.dto.response.SignupResponse;
import com.lecturemind.backend.dto.response.TokenResponse;
import com.lecturemind.backend.service.AuthService;
import com.lecturemind.backend.util.SecurityUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/signup")
    public ResponseEntity<SignupResponse> signup(@Valid @RequestBody SignupRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.signup(request));
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/refresh")
    public ResponseEntity<TokenResponse> refresh(@Valid @RequestBody RefreshRequest request) {
        return ResponseEntity.ok(authService.refresh(request));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@org.springframework.web.bind.annotation.RequestHeader("Authorization") String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            authService.logout(authHeader.substring(7));
        }
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/me")
    public ResponseEntity<SignupResponse> me() {
        return ResponseEntity.ok(authService.getMe(SecurityUtil.getCurrentUserId()));
    }

    @PutMapping("/profile")
    public ResponseEntity<SignupResponse> updateProfile(@Valid @RequestBody UpdateProfileRequest request) {
        return ResponseEntity.ok(authService.updateProfile(SecurityUtil.getCurrentUserId(), request));
    }

    @PutMapping("/password")
    public ResponseEntity<Void> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        authService.changePassword(SecurityUtil.getCurrentUserId(), request);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/account")
    public ResponseEntity<Void> deleteAccount(@Valid @RequestBody DeleteAccountRequest request) {
        authService.deleteAccount(SecurityUtil.getCurrentUserId(), request);
        return ResponseEntity.noContent().build();
    }

}
