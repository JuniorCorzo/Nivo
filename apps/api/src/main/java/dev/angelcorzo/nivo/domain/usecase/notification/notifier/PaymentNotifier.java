package dev.angelcorzo.nivo.domain.usecase.notification.notifier;

import dev.angelcorzo.nivo.domain.model.payments.Payments;
import dev.angelcorzo.nivo.domain.usecase.rate.dtos.PriceDetailed;

/** Generic collaborator to dispatch payment-related notifications. */
public interface PaymentNotifier {
  void notifyPaymentCheckout(Payments payment, PriceDetailed  priceDetailed, String description);

  void notifyPaymentCompleted(Payments payment);
}
