package dev.angelcorzo.nivo.api.security.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotEmpty;
import lombok.Builder;

@Builder(toBuilder = true)
public record UserCredentialsDTO(@Email String email, @NotEmpty String password) {}
