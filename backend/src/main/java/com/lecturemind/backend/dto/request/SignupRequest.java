package com.lecturemind.backend.dto.request;

import com.lecturemind.backend.domain.Role;
import jakarta.validation.constraints.*;
import lombok.Getter;

@Getter
public class SignupRequest {

    @NotBlank(message = "이메일을 입력해주세요.")
    @Email(message = "이메일 형식이 올바르지 않습니다.")
    @Size(max = 255, message = "이메일은 255자 이내여야 합니다.")
    private String email;

    @NotBlank(message = "비밀번호를 입력해주세요.")
    @Size(min = 8, max = 20, message = "비밀번호는 8~20자여야 합니다.")
    @Pattern(
        regexp = "^(?=.*[a-zA-Z])(?=.*\\d)(?=.*[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>\\/?]).{8,20}$",
        message = "비밀번호는 영문, 숫자, 특수문자를 각 1개 이상 포함해야 합니다."
    )
    private String password;

    @NotBlank(message = "이름을 입력해주세요.")
    @Size(min = 2, max = 50, message = "이름은 2~50자여야 합니다.")
    private String name;

    @NotNull(message = "역할을 선택해주세요.")
    private Role role;
}
