package dev.angelcorzo.nivo.api.notificationlogs.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import dev.angelcorzo.nivo.model.commons.notifications.enums.NotificationEvents;
import dev.angelcorzo.nivo.model.commons.notifications.enums.NotificationsChannel;
import dev.angelcorzo.nivo.model.notificationlogs.enums.NotificationLogsStatus;
import dev.angelcorzo.nivo.model.tenants.valueobject.TenantReference;
import dev.angelcorzo.nivo.model.users.valueobject.UserReference;
import lombok.Builder;

import java.time.OffsetDateTime;
import java.util.UUID;

@JsonInclude(JsonInclude.Include.NON_NULL)
@Builder(toBuilder = true)
public record NotificationLogsDTO(
    UUID id,
    TenantReference tenant,
    UserReference actorUser,
    UserReference recipientUser,
    UUID templateId,
    NotificationEvents eventType,
    NotificationsChannel channel,
    String recipient,
    String subject,
    NotificationLogsStatus status,
    String errorMessage,
    OffsetDateTime sentAt,
    OffsetDateTime createdAt) {}
