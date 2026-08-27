package dev.angelcorzo.nivo.api.notificationpreferences.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import dev.angelcorzo.nivo.model.commons.notifications.enums.NotificationEvents;
import dev.angelcorzo.nivo.model.commons.notifications.enums.NotificationsChannel;
import dev.angelcorzo.nivo.model.tenants.valueobject.TenantReference;
import dev.angelcorzo.nivo.model.users.valueobject.UserReference;
import io.swagger.v3.oas.annotations.media.Schema;
import java.time.OffsetDateTime;
import java.util.UUID;
import lombok.Builder;

@JsonInclude(JsonInclude.Include.NON_NULL)
@Builder(toBuilder = true)
@Schema(description = "Notification preference settings for a user and tenant")
public record NotificationPreferencesDTO(
    @Schema(description = "Preference record ID", example = "a1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11")
    UUID id,

    @Schema(description = "User reference details")
    UserReference user,

    @Schema(description = "Tenant reference details")
    TenantReference tenant,

    @Schema(description = "Notification event type", example = "TICKET_CREATED")
    NotificationEvents eventType,

    @Schema(description = "Notification delivery channel", example = "EMAIL")
    NotificationsChannel channel,

    @Schema(description = "Whether the preference is enabled", example = "true")
    Boolean isEnabled,

    @Schema(description = "Creation timestamp")
    OffsetDateTime createdAt,

    @Schema(description = "Last update timestamp")
    OffsetDateTime updatedAt) {}

