package com.lecturemind.backend.dto.response;

import com.lecturemind.backend.domain.Role;
import com.lecturemind.backend.domain.User;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class LoginResponse {
    private String accessToken;
    private String refreshToken;
    private UserInfo user;

    @Getter
    @Builder
    public static class UserInfo {
        private Long id;
        private String email;
        private String name;
        private Role role;

        public static UserInfo from(User user) {
            return UserInfo.builder()
                    .id(user.getId())
                    .email(user.getEmail())
                    .name(user.getName())
                    .role(user.getRole())
                    .build();
        }
    }
}
