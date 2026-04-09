package com.lecturemind.backend.dto.response;

import com.lecturemind.backend.domain.Role;
import com.lecturemind.backend.domain.User;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class SignupResponse {
    private Long id;
    private String email;
    private String name;
    private Role role;
    private LocalDateTime createdAt;

    public static SignupResponse from(User user) {
        return SignupResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .role(user.getRole())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
