package dev.angelcorzo.nivo.model.payments.valueobject.check_out;

import dev.angelcorzo.nivo.model.payments.enums.PaymentsMethods;

import java.util.UUID;

public sealed interface CheckOut permits EmailCheckOut, SMSCheckOut, NoSendCheckOut {
  UUID ticketId();

  UUID tenantId();

  PaymentsMethods paymentMethod();
}
