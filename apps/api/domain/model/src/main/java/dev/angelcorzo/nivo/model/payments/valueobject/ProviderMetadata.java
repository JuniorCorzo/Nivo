package dev.angelcorzo.nivo.model.payments.valueobject;

import java.time.OffsetDateTime;
import lombok.Builder;

@Builder(toBuilder = true)
public record ProviderMetadata(
    String provider,
    String externalPaymentId,
    String checkoutSessionId,
    String checkoutUrl,
    OffsetDateTime checkoutExpiresAt,
    Object rawResponse) {
}
