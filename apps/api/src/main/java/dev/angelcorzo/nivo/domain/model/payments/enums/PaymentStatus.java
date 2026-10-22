package dev.angelcorzo.nivo.domain.model.payments.enums;

public enum PaymentStatus {
  PENDING_CHECKOUT,
  PENDING_PAYMENT,
  PAID,
  FAILED,
  EXPIRED,
  CANCELED,
  REFUNDED
}
