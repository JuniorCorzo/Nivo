package dev.angelcorzo.nivo.domain.usecase.payment.strategies;

import dev.angelcorzo.nivo.domain.model.parkingtickets.gateways.ParkingTicketsRepository;
import dev.angelcorzo.nivo.domain.model.payments.enums.PaymentsMethods;
import dev.angelcorzo.nivo.domain.model.payments.gateways.PaymentProviderGateway;
import dev.angelcorzo.nivo.domain.model.payments.gateways.PaymentsRepository;
import dev.angelcorzo.nivo.domain.model.transactions.gateways.TransactionsRepository;
import dev.angelcorzo.nivo.domain.usecase.notification.notifier.PaymentNotifier;
import dev.angelcorzo.nivo.domain.usecase.notification.notifier.TicketNotifier;
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
