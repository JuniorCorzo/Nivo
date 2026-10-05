package dev.angelcorzo.nivo.domain.model.commons.notifications.valueobjects;

import dev.angelcorzo.nivo.domain.model.commons.notifications.NotificationsData;
import lombok.Builder;

@Builder
public record TicketOpenedData(
    String userName,
    String ticketNumber,
    String ticketSubject,
    String ticketDescription,
    String createdAt,
    String responseEta,
    String ctaUrl,
    String companyName,
    String supportUrl,
    String socialUrl,
    String unsubscribeUrl,
    String companyAddress)
    implements NotificationsData {}
