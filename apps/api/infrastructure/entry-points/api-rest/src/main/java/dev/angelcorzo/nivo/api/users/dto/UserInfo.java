package dev.angelcorzo.nivo.api.users.dto;

import dev.angelcorzo.nivo.model.users.enums.Roles;
import lombok.Builder;

import java.util.UUID;

@Builder(toBuilder = true)
public record UserInfo(UUID id, String fullName, String email, Roles role, String contactInfo) {}
