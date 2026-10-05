package dev.angelcorzo.nivo.domain.model.payments.valueobject;

import dev.angelcorzo.nivo.domain.model.payments.enums.PaymentStatus;
import dev.angelcorzo.nivo.domain.model.payments.enums.PaymentsMethods;
import java.math.BigDecimal;
import java.util.UUID;
import lombok.Builder;

@Builder
public record RegisterPayment(
    UUID id,
    BigDecimal amount,
    PaymentsMethods paymentMethod,
    PaymentStatus status,
    ProviderMetadata providerMetadata) {
  public static class RegisterPaymentBuilder {
    RegisterPaymentBuilder() {
      status = PaymentStatus.PAID;
    }
  }
}
