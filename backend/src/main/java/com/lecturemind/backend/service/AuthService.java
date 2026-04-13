package com.lecturemind.backend.service;

import com.lecturemind.backend.common.exception.DuplicateException;
import com.lecturemind.backend.common.exception.UnauthorizedException;
import com.lecturemind.backend.domain.User;
import com.lecturemind.backend.dto.request.ChangePasswordRequest;
import com.lecturemind.backend.dto.request.DeleteAccountRequest;
import com.lecturemind.backend.dto.request.LoginRequest;
import com.lecturemind.backend.dto.request.RefreshRequest;
import com.lecturemind.backend.dto.request.SignupRequest;
import com.lecturemind.backend.dto.request.UpdateProfileRequest;
import com.lecturemind.backend.dto.response.LoginResponse;
import com.lecturemind.backend.dto.response.SignupResponse;
import com.lecturemind.backend.dto.response.TokenResponse;
import com.lecturemind.backend.repository.UserRepository;
import com.lecturemind.backend.util.JwtTokenProvider;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final TokenBlacklistService tokenBlacklistService;

    @Transactional
    public SignupResponse signup(SignupRequest request) {
        log.info("회원가입 시작: {}", request.getEmail());

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateException("이미 사용 중인 이메일입니다.");
        }

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .name(request.getName())
                .role(request.getRole())
                .build();

        User saved = userRepository.save(user);
        log.info("회원가입 완료: userId={}", saved.getId());
        return SignupResponse.from(saved);
    }

    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest request) {
        log.info("로그인 시도: {}", request.getEmail());

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UnauthorizedException("이메일 또는 비밀번호가 올바르지 않습니다."));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new UnauthorizedException("이메일 또는 비밀번호가 올바르지 않습니다.");
        }

        String accessToken = jwtTokenProvider.generateAccessToken(user.getId(), user.getRole().name());
        String refreshToken = jwtTokenProvider.generateRefreshToken(user.getId());

        log.info("로그인 완료: userId={}", user.getId());
        return LoginResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .user(LoginResponse.UserInfo.from(user))
                .build();
    }

    @Transactional(readOnly = true)
    public TokenResponse refresh(RefreshRequest request) {
        String token = request.getRefreshToken();

        if (!jwtTokenProvider.validateToken(token)) {
            throw new UnauthorizedException("Refresh Token이 만료되었거나 유효하지 않습니다.");
        }

        Long userId = jwtTokenProvider.getUserId(token);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("사용자를 찾을 수 없습니다."));

        String newAccessToken = jwtTokenProvider.generateAccessToken(user.getId(), user.getRole().name());
        String newRefreshToken = jwtTokenProvider.generateRefreshToken(user.getId());

        return TokenResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(newRefreshToken)
                .build();
    }

    public void logout(String accessToken) {
        if (jwtTokenProvider.validateToken(accessToken)) {
            long remaining = jwtTokenProvider.getRemainingExpiration(accessToken);
            tokenBlacklistService.blacklist(accessToken, remaining);
            log.info("로그아웃 완료: 토큰 블랙리스트 등록");
        }
    }

    @Transactional(readOnly = true)
    public SignupResponse getMe(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("사용자를 찾을 수 없습니다."));
        return SignupResponse.from(user);
    }

    @Transactional
    public SignupResponse updateProfile(Long userId, UpdateProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("사용자를 찾을 수 없습니다."));
        user.updateName(request.getName());
        return SignupResponse.from(userRepository.save(user));
    }

    @Transactional
    public void changePassword(Long userId, ChangePasswordRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("사용자를 찾을 수 없습니다."));
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new UnauthorizedException("현재 비밀번호가 올바르지 않습니다.");
        }
        user.updatePassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    @Transactional
    public void deleteAccount(Long userId, DeleteAccountRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("사용자를 찾을 수 없습니다."));
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new UnauthorizedException("비밀번호가 올바르지 않습니다.");
        }
        userRepository.delete(user);
    }
}
