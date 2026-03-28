package dev.angelcorzo.nivo.usecase.notifications;

import dev.angelcorzo.nivo.model.payments.Payments;
import dev.angelcorzo.nivo.usecase.calculaterate.dtos.PriceDetailed;

/** Generic collaborator to dispatch payment-related notifications. */
public interface PaymentNotifier {
  void notifyPaymentCheckout(Payments payment, PriceDetailed  priceDetailed, String description);

  void notifyPaymentCompleted(Payments payment);
}
