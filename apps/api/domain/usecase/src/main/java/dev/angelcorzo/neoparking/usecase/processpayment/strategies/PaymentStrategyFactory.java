package dev.angelcorzo.neoparking.usecase.processpayment.strategies;

import dev.angelcorzo.neoparking.model.parkingtickets.gateways.ParkingTicketsRepository;
import dev.angelcorzo.neoparking.model.payments.enums.PaymentsMethods;
import dev.angelcorzo.neoparking.model.payments.gateways.PaymentProviderGateway;
import dev.angelcorzo.neoparking.model.payments.gateways.PaymentsRepository;
import dev.angelcorzo.neoparking.model.transactions.gateways.TransactionsRepository;
import dev.angelcorzo.neoparking.usecase.notifications.PaymentNotifier;
import dev.angelcorzo.neoparking.usecase.notifications.TicketNotifier;
import lombok.NoArgsConstructor;

@NoArgsConstructor(access = lombok.AccessLevel.PRIVATE)
public class PaymentStrategyFactory {
  public static PaymentStrategy getPaymentStrategy(
      PaymentsMethods method,
      PaymentsRepository paymentsRepository,
      ParkingTicketsRepository parkingTicketsRepository,
      PaymentProviderGateway paymentProviderGateway,
      TransactionsRepository transactionsRepository,
      PaymentNotifier notifier,
      TicketNotifier ticketNotifier) {
    return switch (method) {
      case EFFECTIVE ->
          new EffectivePaymentStrategy(
              paymentsRepository,
              parkingTicketsRepository,
              transactionsRepository,
              notifier,
              ticketNotifier);
      case PAY_LINK ->
          new PayLinkPaymentStrategy(
              paymentsRepository, parkingTicketsRepository, paymentProviderGateway, notifier);
    };
  }
}
