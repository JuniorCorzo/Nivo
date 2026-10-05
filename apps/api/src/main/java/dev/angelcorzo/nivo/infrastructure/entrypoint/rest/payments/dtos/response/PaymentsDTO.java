package dev.angelcorzo.nivo.infrastructure.entrypoint.rest.payments.dtos.response;

import dev.angelcorzo.nivo.domain.model.payments.enums.PaymentStatus;
import dev.angelcorzo.nivo.domain.model.payments.enums.PaymentsMethods;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;
import lombok.Builder;

@Builder
public record PaymentsDTO(
    UUID id,
    UUID tenantId,
    UUID userId,
    UUID parkingTicketId,
    BigDecimal amount,
    OffsetDateTime paymentDate,
    PaymentsMethods paymentMethod,
    PaymentStatus status,
    String provider,
    String externalPaymentId,
    String checkoutSessionId,
    String checkoutUrl,
    OffsetDateTime checkoutExpiresAt,
    OffsetDateTime createdAt,
    OffsetDateTime updatedAt) {}
