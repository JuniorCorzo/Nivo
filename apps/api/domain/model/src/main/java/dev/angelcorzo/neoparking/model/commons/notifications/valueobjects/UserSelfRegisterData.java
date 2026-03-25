package dev.angelcorzo.neoparking.model.commons.notifications.valueobjects;

import dev.angelcorzo.neoparking.model.commons.notifications.NotificationsData;
import lombok.Builder;

@Builder
public record UserSelfRegisterData(
    String userName,
		String email,
		String ctaUrl,
    String companyName,
    String supportUrl,
    String socialUrl,
    String unsubscribeUrl,
    String companyAddress)
    implements NotificationsData {}
