package dev.angelcorzo.nivo.usecase.processpayment.strategies;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import dev.angelcorzo.nivo.model.commons.result.Result;
import dev.angelcorzo.nivo.model.parkingtickets.ParkingTickets;
import dev.angelcorzo.nivo.model.parkingtickets.gateways.ParkingTicketsRepository;
import dev.angelcorzo.nivo.model.payments.Payments;
import dev.angelcorzo.nivo.model.payments.enums.PaymentStatus;
import dev.angelcorzo.nivo.model.payments.enums.PaymentsMethods;
import dev.angelcorzo.nivo.model.payments.exceptions.PaymentError;
import dev.angelcorzo.nivo.model.payments.gateways.PaymentsRepository;
import dev.angelcorzo.nivo.model.payments.valueobject.check_out.NoSendCheckOut;
import dev.angelcorzo.nivo.model.transactions.Transactions;
import dev.angelcorzo.nivo.model.transactions.enums.TransactionStatus;
import dev.angelcorzo.nivo.model.transactions.gateways.TransactionsRepository;
import dev.angelcorzo.nivo.usecase.calculaterate.dtos.PriceDetailed;
import dev.angelcorzo.nivo.usecase.calculaterate.dtos.PriceLine;
import dev.angelcorzo.nivo.usecase.notifications.PaymentNotifier;
import dev.angelcorzo.nivo.usecase.notifications.TicketNotifier;
import dev.angelcorzo.nivo.usecase.processpayment.strategies.commands.PaymentCommand;
import java.math.BigDecimal;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

@DisplayName("EffectivePaymentStrategy Tests")
class EffectivePaymentStrategyTest {

  private PaymentsRepository paymentsRepository;
  private ParkingTicketsRepository parkingTicketsRepository;
  private TransactionsRepository transactionsRepository;
  private PaymentNotifier paymentNotifier;
  private TicketNotifier ticketNotifier;
  private EffectivePaymentStrategy strategy;

  @BeforeEach
  void setUp() {
    paymentsRepository = mock(PaymentsRepository.class);
    parkingTicketsRepository = mock(ParkingTicketsRepository.class);
    transactionsRepository = mock(TransactionsRepository.class);
    paymentNotifier = mock(PaymentNotifier.class);
    ticketNotifier = mock(TicketNotifier.class);

    strategy =
        new EffectivePaymentStrategy(
            paymentsRepository,
            parkingTicketsRepository,
            transactionsRepository,
            paymentNotifier,
            ticketNotifier);
  }

  private PriceDetailed createSamplePriceDetailed(BigDecimal amount) {
    PriceDetailed price = PriceDetailed.of("Standard Rate");
    price.addLine(new PriceLine("Standard Rate", amount));
    return price;
  }

  @Nested
  @DisplayName("Happy Path")
  class HappyPath {

    @Test
    @DisplayName("Should successfully process effective cash payment, close ticket, register transaction, and notify")
    void shouldProcessEffectivePaymentSuccessfully() {
      // Arrange
      UUID ticketId = UUID.randomUUID();
      BigDecimal amount = BigDecimal.valueOf(20000);
      ParkingTickets ticket = ParkingTickets.builder().id(ticketId).build();
      PriceDetailed price = createSamplePriceDetailed(amount);
      PaymentCommand command =
          PaymentCommand.of(ticket, price, new NoSendCheckOut(ticketId, UUID.randomUUID(), PaymentsMethods.EFFECTIVE));

      Payments savedPayment =
          Payments.builder()
              .id(UUID.randomUUID())
              .parkingTicket(ticket)
              .amount(amount)
              .paymentMethod(PaymentsMethods.EFFECTIVE)
              .status(PaymentStatus.PAID)
              .build();

      when(paymentsRepository.processPayment(any(Payments.class)))
          .thenReturn(Result.success(savedPayment));

      // Act
      Result<Payments, PaymentError> result = strategy.processPayment(command);

      // Assert
      assertThat(result.isSuccess()).isTrue();
      assertThat(result.get()).isEqualTo(savedPayment);

      verify(parkingTicketsRepository)
          .prepareCheckout(eq(ticketId), argThat(a -> a.compareTo(amount) == 0));
      verify(parkingTicketsRepository).closeTicket(ticketId);
      verify(transactionsRepository)
          .save(argThat(t ->
              t.getPayment().equals(savedPayment)
                  && t.getAmount().compareTo(amount) == 0
                  && t.getStatus() == TransactionStatus.APPROVED
                  && "COP".equals(t.getCurrency())));
      verify(ticketNotifier).notifyTicketClosed(ticket);
      verify(paymentNotifier).notifyPaymentCompleted(savedPayment);
    }
  }

  @Nested
  @DisplayName("Error Cases")
  class ErrorCases {

    @Test
    @DisplayName("Should return failure when payments repository fails")
    void shouldReturnFailureWhenPaymentsRepoFails() {
      // Arrange
      UUID ticketId = UUID.randomUUID();
      ParkingTickets ticket = ParkingTickets.builder().id(ticketId).build();
      PaymentCommand command =
          PaymentCommand.of(ticket, createSamplePriceDetailed(BigDecimal.TEN), new NoSendCheckOut(ticketId, UUID.randomUUID(), PaymentsMethods.EFFECTIVE));

      when(paymentsRepository.processPayment(any(Payments.class)))
          .thenReturn(Result.failure(new PaymentError.DatabaseError("DB write error")));

      // Act
      Result<Payments, PaymentError> result = strategy.processPayment(command);

      // Assert
      assertThat(result.isFailure()).isTrue();
      assertThat(result.getError()).isInstanceOf(PaymentError.DatabaseError.class);
      verify(parkingTicketsRepository, never()).closeTicket(any());
      verify(transactionsRepository, never()).save(any());
      verify(paymentNotifier, never()).notifyPaymentCompleted(any());
    }

    @Test
    @DisplayName("Should return DatabaseError when ticket close throws exception")
    void shouldReturnDatabaseErrorWhenTicketCloseThrows() {
      // Arrange
      UUID ticketId = UUID.randomUUID();
      BigDecimal amount = BigDecimal.valueOf(10000);
      ParkingTickets ticket = ParkingTickets.builder().id(ticketId).build();
      PaymentCommand command =
          PaymentCommand.of(ticket, createSamplePriceDetailed(amount), new NoSendCheckOut(ticketId, UUID.randomUUID(), PaymentsMethods.EFFECTIVE));

      Payments savedPayment =
          Payments.builder()
              .id(UUID.randomUUID())
              .parkingTicket(ticket)
              .amount(amount)
              .build();

      when(paymentsRepository.processPayment(any(Payments.class)))
          .thenReturn(Result.success(savedPayment));
      doThrow(new RuntimeException("DB locked"))
          .when(parkingTicketsRepository).closeTicket(ticketId);

      // Act
      Result<Payments, PaymentError> result = strategy.processPayment(command);

      // Assert
      assertThat(result.isFailure()).isTrue();
      assertThat(result.getError()).isInstanceOf(PaymentError.DatabaseError.class);
    }
  }
}
