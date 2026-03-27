package dev.angelcorzo.nivo.usecase.processpayment;

import dev.angelcorzo.nivo.model.parkingtickets.ParkingTickets;
import dev.angelcorzo.nivo.model.parkingtickets.gateways.ParkingTicketsRepository;
import dev.angelcorzo.nivo.model.payments.Payments;
import dev.angelcorzo.nivo.model.payments.exceptions.ProcessPaymentException;
import dev.angelcorzo.nivo.model.payments.gateways.PaymentProviderGateway;
import dev.angelcorzo.nivo.model.payments.gateways.PaymentsRepository;
import dev.angelcorzo.nivo.model.payments.valueobject.check_out.CheckOut;
import dev.angelcorzo.nivo.model.transactions.gateways.TransactionsRepository;
import dev.angelcorzo.nivo.usecase.calculaterate.dtos.PriceDetailed;
import dev.angelcorzo.nivo.usecase.notifications.PaymentNotifier;
import dev.angelcorzo.nivo.usecase.notifications.TicketNotifier;
import dev.angelcorzo.nivo.usecase.processpayment.strategies.PaymentStrategyFactory;
import dev.angelcorzo.nivo.usecase.processpayment.strategies.commands.PaymentCommand;
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
