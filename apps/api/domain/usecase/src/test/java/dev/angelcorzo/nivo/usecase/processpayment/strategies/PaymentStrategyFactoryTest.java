package dev.angelcorzo.nivo.usecase.processpayment.strategies;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;

import dev.angelcorzo.nivo.model.parkingtickets.gateways.ParkingTicketsRepository;
import dev.angelcorzo.nivo.model.payments.enums.PaymentsMethods;
import dev.angelcorzo.nivo.model.payments.gateways.PaymentProviderGateway;
import dev.angelcorzo.nivo.model.payments.gateways.PaymentsRepository;
import dev.angelcorzo.nivo.model.transactions.gateways.TransactionsRepository;
import dev.angelcorzo.nivo.usecase.notifications.PaymentNotifier;
import dev.angelcorzo.nivo.usecase.notifications.TicketNotifier;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

@DisplayName("PaymentStrategyFactory Tests")
class PaymentStrategyFactoryTest {

  private PaymentsRepository paymentsRepository;
  private ParkingTicketsRepository parkingTicketsRepository;
  private PaymentProviderGateway paymentProviderGateway;
  private TransactionsRepository transactionsRepository;
  private PaymentNotifier paymentNotifier;
  private TicketNotifier ticketNotifier;

  @BeforeEach
  void setUp() {
    paymentsRepository = mock(PaymentsRepository.class);
    parkingTicketsRepository = mock(ParkingTicketsRepository.class);
    paymentProviderGateway = mock(PaymentProviderGateway.class);
    transactionsRepository = mock(TransactionsRepository.class);
    paymentNotifier = mock(PaymentNotifier.class);
    ticketNotifier = mock(TicketNotifier.class);
  }

  @Test
  @DisplayName("Should return EffectivePaymentStrategy when method is EFFECTIVE")
  void shouldReturnEffectivePaymentStrategy() {
    PaymentStrategy strategy =
        PaymentStrategyFactory.getPaymentStrategy(
            PaymentsMethods.EFFECTIVE,
            paymentsRepository,
            parkingTicketsRepository,
            paymentProviderGateway,
            transactionsRepository,
            paymentNotifier,
            ticketNotifier);

    assertThat(strategy).isNotNull().isInstanceOf(EffectivePaymentStrategy.class);
  }

  @Test
  @DisplayName("Should return PayLinkPaymentStrategy when method is PAY_LINK")
  void shouldReturnPayLinkPaymentStrategy() {
    PaymentStrategy strategy =
        PaymentStrategyFactory.getPaymentStrategy(
            PaymentsMethods.PAY_LINK,
            paymentsRepository,
            parkingTicketsRepository,
            paymentProviderGateway,
            transactionsRepository,
            paymentNotifier,
            ticketNotifier);

    assertThat(strategy).isNotNull().isInstanceOf(PayLinkPaymentStrategy.class);
  }
}
