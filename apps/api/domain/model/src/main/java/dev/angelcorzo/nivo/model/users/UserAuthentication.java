package dev.angelcorzo.nivo.model.users;

import dev.angelcorzo.nivo.model.users.enums.Roles;
import lombok.Builder;

import java.util.UUID;

@Builder
public record UserAuthentication(UUID userId, UUID tenantId, Roles role) {}
