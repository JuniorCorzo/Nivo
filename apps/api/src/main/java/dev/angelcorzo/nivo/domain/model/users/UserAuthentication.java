package dev.angelcorzo.nivo.domain.model.users;

import dev.angelcorzo.nivo.domain.model.users.enums.Roles;
import lombok.Builder;

import java.util.UUID;

@Builder
public record UserAuthentication(UUID userId, UUID tenantId, Roles role) {}
