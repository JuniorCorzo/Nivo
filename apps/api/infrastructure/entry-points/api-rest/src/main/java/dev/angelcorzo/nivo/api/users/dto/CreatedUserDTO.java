package dev.angelcorzo.nivo.api.users.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotEmpty;
import lombok.Builder;

@Builder
public record CreatedUserDTO(
        @NotEmpty
        String fullName,
        @NotEmpty
        @Email
        String email,
        @NotEmpty
        String password,
        @NotEmpty
        String contactInfo
) {}
