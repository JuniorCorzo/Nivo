package dev.angelcorzo.neoparking.usecase.processpayment.strategies;

import dev.angelcorzo.neoparking.model.commons.result.Result;
import dev.angelcorzo.neoparking.model.parkingtickets.gateways.ParkingTicketsRepository;
import dev.angelcorzo.neoparking.model.payments.Payments;
import dev.angelcorzo.neoparking.model.payments.exceptions.PaymentError;
import dev.angelcorzo.neoparking.model.payments.factories.PaymentFactory;
import dev.angelcorzo.neoparking.model.payments.gateways.PaymentsRepository;
import dev.angelcorzo.neoparking.model.transactions.Transactions;
import dev.angelcorzo.neoparking.model.transactions.enums.TransactionStatus;
import dev.angelcorzo.neoparking.model.transactions.gateways.TransactionsRepository;
import dev.angelcorzo.neoparking.usecase.notifications.PaymentNotifier;
import dev.angelcorzo.neoparking.usecase.notifications.TicketNotifier;
import dev.angelcorzo.neoparking.usecase.processpayment.strategies.commands.PaymentCommand;
import java.math.BigDecimal;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public class EffectivePaymentStrategy implements PaymentStrategy {
  private final PaymentsRepository paymentsRepository;
  private final ParkingTicketsRepository parkingTicketsRepository;
  private final TransactionsRepository transactionsRepository;
  private final PaymentNotifier paymentNotifier;
  private final TicketNotifier ticketNotifier;

  @Override
  public Result<Payments, PaymentError> processPayment(PaymentCommand command) {
    final BigDecimal amountToCharge = command.amounts().getTotal();
    final Payments payment = PaymentFactory.registerEffective(command.ticket(), amountToCharge);

    return this.paymentsRepository
        .processPayment(payment)
        .flatMap(this::handlerSuccess)
        .onSuccess(this::registerTransaction)
        .onSuccess(this::sendNotifications);
  }

  private Result<Payments, PaymentError> handlerSuccess(Payments payment) {
    try {
      this.parkingTicketsRepository.prepareCheckout(
          payment.getParkingTicket().getId(), payment.getAmount());

      this.parkingTicketsRepository.closeTicket(payment.getParkingTicket().getId());

      return Result.success(payment);
    } catch (Exception e) {
      return Result.failure(new PaymentError.DatabaseError(e.getMessage()));
    }
  }

  private void sendNotifications(Payments payment) {
    this.ticketNotifier.notifyTicketClosed(payment.getParkingTicket());
    this.paymentNotifier.notifyPaymentCompleted(payment);
  }

  private void registerTransaction(Payments payment) {
    Transactions transaction =
        Transactions.builder()
            .payment(payment)
            .amount(payment.getAmount())
            .currency("COP")
            .status(TransactionStatus.APPROVED)
            .build();

    this.transactionsRepository.save(transaction);
  }
}
