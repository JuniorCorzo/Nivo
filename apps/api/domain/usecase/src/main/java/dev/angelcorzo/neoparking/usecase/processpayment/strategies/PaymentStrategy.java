package dev.angelcorzo.neoparking.usecase.processpayment.strategies;

import dev.angelcorzo.neoparking.model.commons.result.Result;
import dev.angelcorzo.neoparking.model.payments.Payments;
import dev.angelcorzo.neoparking.model.payments.exceptions.PaymentError;
import dev.angelcorzo.neoparking.usecase.processpayment.strategies.commands.PaymentCommand;

public interface PaymentStrategy {
  Result<Payments, PaymentError> processPayment(
      PaymentCommand command);
}
