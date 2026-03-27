package dev.angelcorzo.nivo.model.commons.notifications.valueobjects;

import dev.angelcorzo.nivo.model.commons.notifications.NotificationsData;
import lombok.Builder;

@Builder
public record PaymentCompletedData(
    String userName,
    String paymentReference,
    String paymentAmount,
    String paymentCurrency,
    String paymentMethod,
    String paymentDate,
    String description,
    String invoiceUrl,
    String ctaUrl,
    String companyName,
    String supportUrl,
    String socialUrl,
    String unsubscribeUrl,
    String companyAddress)
    implements NotificationsData {}
