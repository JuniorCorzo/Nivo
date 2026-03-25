package dev.angelcorzo.neoparking.model.commons.notifications.valueobjects;

import dev.angelcorzo.neoparking.model.commons.notifications.NotificationsData;
import lombok.Builder;

@Builder
public record UserInvitationAcceptedData(
    String userName,
    String acceptedUserName,
    String organizationName,
    String roleName,
    String acceptedAt,
    String ctaUrl,
    String companyName,
    String supportUrl,
    String socialUrl,
    String unsubscribeUrl,
    String companyAddress)
    implements NotificationsData {}
