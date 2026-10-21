package dev.angelcorzo.nivo.infrastructure.entrypoint.rest.userinvitations.dto;

import dev.angelcorzo.nivo.domain.model.tenants.Tenants;
import dev.angelcorzo.nivo.domain.model.userinvitations.UserInvitationStatus;
import dev.angelcorzo.nivo.domain.model.users.Users;
import dev.angelcorzo.nivo.domain.model.users.enums.Roles;
import java.time.OffsetDateTime;
import java.util.UUID;
import lombok.Builder;

@Builder(toBuilder = true)
public record UserInvitationsDTO(
        UUID id,
        Tenants tenant,
        String invitedEmail,
        Roles role,
        UUID token,
        UserInvitationStatus status,
        Users invitedBy,
        OffsetDateTime createdAt,
        OffsetDateTime acceptedAt,
        OffsetDateTime expiredAt) {}
