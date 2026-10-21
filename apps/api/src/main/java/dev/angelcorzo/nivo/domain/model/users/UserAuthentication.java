package dev.angelcorzo.nivo.domain.model.users;

import dev.angelcorzo.nivo.domain.model.users.enums.Roles;
import java.util.UUID;
import lombok.Builder;

@Builder
public record UserAuthentication(UUID userId, UUID tenantId, Roles role) {}
