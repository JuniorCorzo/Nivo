package dev.angelcorzo.neoparking.api.notificationlogs.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import dev.angelcorzo.neoparking.model.commons.notifications.enums.NotificationEvents;
import dev.angelcorzo.neoparking.model.commons.notifications.enums.NotificationsChannel;
import dev.angelcorzo.neoparking.model.notificationlogs.enums.NotificationLogsStatus;
import dev.angelcorzo.neoparking.model.tenants.valueobject.TenantReference;
import dev.angelcorzo.neoparking.model.users.valueobject.UserReference;
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
