package dev.angelcorzo.nivo.api.notificationpreferences.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import dev.angelcorzo.nivo.model.commons.notifications.enums.NotificationEvents;
import dev.angelcorzo.nivo.model.commons.notifications.enums.NotificationsChannel;
import dev.angelcorzo.nivo.model.tenants.valueobject.TenantReference;
import dev.angelcorzo.nivo.model.users.valueobject.UserReference;
import java.time.OffsetDateTime;
import java.util.UUID;
import lombok.Builder;

/**
 * Response DTO for a single {@code NotificationPreferences} record.
 *
 * <p>Exposes the complete preference data including the owning user, the scoped tenant, the
 * event/channel combination, and the current {@code isEnabled} flag.
 *
 * <p><strong>Layer:</strong> Infrastructure (Entry Point - REST)
 *
 * @author Angel Corzo
 * @since 1.0.0
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
@Builder(toBuilder = true)
public record NotificationPreferencesDTO(
    UUID id,
    UserReference user,
    TenantReference tenant,
    NotificationEvents eventType,
    NotificationsChannel channel,
    Boolean isEnabled,
    OffsetDateTime createdAt,
    OffsetDateTime updatedAt) {}
