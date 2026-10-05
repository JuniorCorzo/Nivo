package dev.angelcorzo.nivo.domain.usecase.payment.strategies;

import dev.angelcorzo.nivo.domain.model.commons.result.Result;
import dev.angelcorzo.nivo.domain.model.payments.Payments;
import dev.angelcorzo.nivo.domain.model.payments.exceptions.PaymentError;
import dev.angelcorzo.nivo.domain.usecase.payment.strategies.commands.PaymentCommand;

public interface PaymentStrategy {
  Result<Payments, PaymentError> processPayment(
      PaymentCommand command);
}
