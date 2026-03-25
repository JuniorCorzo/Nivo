package dev.angelcorzo.neoparking.usecase.notifications;

import dev.angelcorzo.neoparking.model.payments.Payments;
import dev.angelcorzo.neoparking.usecase.calculaterate.dtos.PriceDetailed;

/** Generic collaborator to dispatch payment-related notifications. */
public interface PaymentNotifier {
  void notifyPaymentCheckout(Payments payment, PriceDetailed  priceDetailed, String description);

  void notifyPaymentCompleted(Payments payment);
}
