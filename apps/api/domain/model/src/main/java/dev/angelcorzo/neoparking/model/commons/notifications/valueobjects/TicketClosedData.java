package dev.angelcorzo.neoparking.model.commons.notifications.valueobjects;

import dev.angelcorzo.neoparking.model.commons.notifications.NotificationsData;
import lombok.Builder;

@Builder
public record TicketClosedData(
    String userName,
    String ticketNumber,
    String ticketSubject,
    String resolutionSummary,
    String closedAt,
    String ctaUrl,
    String satisfactionUrl,
    String companyName,
    String supportUrl,
    String socialUrl,
    String unsubscribeUrl,
    String companyAddress)
    implements NotificationsData {}
