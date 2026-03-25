package dev.angelcorzo.neoparking.usecase.processpayment;

import dev.angelcorzo.neoparking.model.parkingtickets.ParkingTickets;
import dev.angelcorzo.neoparking.model.parkingtickets.gateways.ParkingTicketsRepository;
import dev.angelcorzo.neoparking.model.payments.Payments;
import dev.angelcorzo.neoparking.model.payments.exceptions.ProcessPaymentException;
import dev.angelcorzo.neoparking.model.payments.gateways.PaymentProviderGateway;
import dev.angelcorzo.neoparking.model.payments.gateways.PaymentsRepository;
import dev.angelcorzo.neoparking.model.payments.valueobject.check_out.CheckOut;
import dev.angelcorzo.neoparking.model.transactions.gateways.TransactionsRepository;
import dev.angelcorzo.neoparking.usecase.calculaterate.dtos.PriceDetailed;
import dev.angelcorzo.neoparking.usecase.notifications.PaymentNotifier;
import dev.angelcorzo.neoparking.usecase.notifications.TicketNotifier;
import dev.angelcorzo.neoparking.usecase.processpayment.strategies.PaymentStrategyFactory;
import dev.angelcorzo.neoparking.usecase.processpayment.strategies.commands.PaymentCommand;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public class ProcessPaymentUseCase {
  private final PaymentsRepository paymentsRepository;
  private final ParkingTicketsRepository parkingTicketsRepository;
  private final PaymentProviderGateway paymentProviderGateway;
  private final TransactionsRepository transactionsRepository;
  private final PaymentNotifier paymentNotifier;
  private final TicketNotifier ticketNotifier;

  public Payments execute(ParkingTickets ticket, PriceDetailed amounts, CheckOut command) {
    return this.paymentsRepository
        .findByParkingTicketId(ticket.getId())
        .orElseGet(() -> this.processNewPaymentIntent(ticket, amounts, command));
  }

  private Payments processNewPaymentIntent(
      ParkingTickets ticket, PriceDetailed amounts, CheckOut command) {
    return PaymentStrategyFactory.getPaymentStrategy(
            command.paymentMethod(),
            paymentsRepository,
            parkingTicketsRepository,
            paymentProviderGateway,
            transactionsRepository,
            paymentNotifier,
            ticketNotifier)
        .processPayment(PaymentCommand.of(ticket, amounts, command))
        .orElseThrow(ProcessPaymentException::new);
  }
}
