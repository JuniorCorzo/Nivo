package dev.angelcorzo.nivo.usecase.processpayment.strategies;

import dev.angelcorzo.nivo.model.commons.result.Result;
import dev.angelcorzo.nivo.model.payments.Payments;
import dev.angelcorzo.nivo.model.payments.exceptions.PaymentError;
import dev.angelcorzo.nivo.usecase.processpayment.strategies.commands.PaymentCommand;

public interface PaymentStrategy {
  Result<Payments, PaymentError> processPayment(
      PaymentCommand command);
}
