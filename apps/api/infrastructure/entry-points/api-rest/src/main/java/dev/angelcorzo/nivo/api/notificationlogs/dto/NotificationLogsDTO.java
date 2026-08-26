package dev.angelcorzo.nivo.api.notificationlogs.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import dev.angelcorzo.nivo.model.commons.notifications.enums.NotificationEvents;
import dev.angelcorzo.nivo.model.commons.notifications.enums.NotificationsChannel;
import dev.angelcorzo.nivo.model.notificationlogs.enums.NotificationLogsStatus;
import dev.angelcorzo.nivo.model.tenants.valueobject.TenantReference;
import dev.angelcorzo.nivo.model.users.valueobject.UserReference;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;

import java.time.OffsetDateTime;
import java.util.UUID;

@JsonInclude(JsonInclude.Include.NON_NULL)
@Builder(toBuilder = true)
@Schema(description = "Notification delivery audit log record")
public record NotificationLogsDTO(
    @Schema(description = "Notification log ID", example = "b2eebc99-9c0b-4ef8-bb6d-6bb9bd380a22")
    UUID id,

    @Schema(description = "Tenant reference")
    TenantReference tenant,

    @Schema(description = "User who triggered the notification")
    UserReference actorUser,

    @Schema(description = "Recipient user reference")
    UserReference recipientUser,

    @Schema(description = "Template ID used")
    UUID templateId,

    @Schema(description = "Notification event type", example = "TICKET_CREATED")
    NotificationEvents eventType,

    @Schema(description = "Delivery channel", example = "EMAIL")
    NotificationsChannel channel,

    @Schema(description = "Recipient destination (email, phone, etc.)", example = "user@example.com")
    String recipient,

    @Schema(description = "Subject line", example = "Your parking ticket is ready")
    String subject,

    @Schema(description = "Delivery status", example = "SENT")
    NotificationLogsStatus status,

    @Schema(description = "Error message if delivery failed")
    String errorMessage,

    @Schema(description = "Timestamp when notification was sent")
    OffsetDateTime sentAt,

    @Schema(description = "Creation timestamp")
    OffsetDateTime createdAt) {}

