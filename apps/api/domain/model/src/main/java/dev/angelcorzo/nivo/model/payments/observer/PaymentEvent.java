package dev.angelcorzo.nivo.model.payments.observer;

import dev.angelcorzo.nivo.model.payments.enums.PaymentStatus;
import java.util.UUID;

public record PaymentEvent(UUID paymentId, PaymentStatus status) {

  public static PaymentEvent of(UUID paymentId, PaymentStatus status) {
    return new PaymentEvent(paymentId, status);
  }
}
