package dev.angelcorzo.nivo.model.commons.notifications.valueobjects;

import dev.angelcorzo.nivo.model.commons.notifications.NotificationsData;
import lombok.Builder;

@Builder
public record UserInvitedData(
    String userName,
    String inviterName,
    String organizationName,
    String roleName,
    String ctaUrl,
    String expirationDate,
    String companyName,
    String supportUrl,
    String socialUrl,
    String unsubscribeUrl,
    String companyAddress)
    implements NotificationsData {}
