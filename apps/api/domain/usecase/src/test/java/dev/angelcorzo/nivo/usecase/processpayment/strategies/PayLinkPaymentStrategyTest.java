package dev.angelcorzo.nivo.usecase.processpayment.strategies;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import dev.angelcorzo.nivo.model.commons.result.Result;
import dev.angelcorzo.nivo.model.parkingtickets.ParkingTicketNotFound;
import dev.angelcorzo.nivo.model.parkingtickets.ParkingTickets;
import dev.angelcorzo.nivo.model.parkingtickets.gateways.ParkingTicketsRepository;
import dev.angelcorzo.nivo.model.payments.Payments;
import dev.angelcorzo.nivo.model.payments.enums.PaymentStatus;
import dev.angelcorzo.nivo.model.payments.enums.PaymentsMethods;
import dev.angelcorzo.nivo.model.payments.exceptions.PaymentError;
import dev.angelcorzo.nivo.model.payments.gateways.PaymentProviderGateway;
import dev.angelcorzo.nivo.model.payments.gateways.PaymentsRepository;
import dev.angelcorzo.nivo.model.payments.valueobject.ProviderMetadata;
import dev.angelcorzo.nivo.model.payments.valueobject.check_out.CheckOut;
import dev.angelcorzo.nivo.model.payments.valueobject.check_out.NoSendCheckOut;
import dev.angelcorzo.nivo.usecase.calculaterate.dtos.PriceDetailed;
import dev.angelcorzo.nivo.usecase.calculaterate.dtos.PriceLine;
import dev.angelcorzo.nivo.usecase.notifications.PaymentNotifier;
import dev.angelcorzo.nivo.usecase.processpayment.strategies.commands.PaymentCommand;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

@DisplayName("PayLinkPaymentStrategy Tests")
class PayLinkPaymentStrategyTest {

  private PaymentsRepository paymentsRepository;
  private ParkingTicketsRepository parkingTicketsRepository;
  private PaymentProviderGateway paymentProviderGateway;
  private PaymentNotifier paymentNotifier;
  private PayLinkPaymentStrategy strategy;

  @BeforeEach
  void setUp() {
    paymentsRepository = mock(PaymentsRepository.class);
    parkingTicketsRepository = mock(ParkingTicketsRepository.class);
    paymentProviderGateway = mock(PaymentProviderGateway.class);
    paymentNotifier = mock(PaymentNotifier.class);

    strategy =
        new PayLinkPaymentStrategy(
            paymentsRepository,
            parkingTicketsRepository,
            paymentProviderGateway,
            paymentNotifier);
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
    @DisplayName("Should successfully process pay-link payment, update ticket, and notify")
    void shouldProcessPayLinkSuccessfully() {
      // Arrange
      UUID ticketId = UUID.randomUUID();
      UUID tenantId = UUID.randomUUID();
      BigDecimal amount = BigDecimal.valueOf(15000);
      ParkingTickets ticket =
          ParkingTickets.builder()
              .id(ticketId)
              .licensePlate("ABC-123")
              .build();

      CheckOut checkOut = new NoSendCheckOut(ticketId, tenantId, PaymentsMethods.PAY_LINK);
      PriceDetailed price = createSamplePriceDetailed(amount);
      PaymentCommand command = PaymentCommand.of(ticket, price, checkOut);

      Payments initialPayment =
          Payments.builder()
              .id(UUID.randomUUID())
              .parkingTicket(ticket)
              .amount(amount)
              .status(PaymentStatus.PENDING_CHECKOUT)
              .build();

      ProviderMetadata metadata =
          new ProviderMetadata(
              "epayco",
              "ext-pay-123",
              "session-456",
              "https://checkout.epayco.co/123",
              OffsetDateTime.now().plusHours(1),
              "rawResponse");

      Payments updatedPayment =
          initialPayment.toBuilder()
              .status(PaymentStatus.PENDING_PAYMENT)
              .provider("epayco")
              .externalPaymentId("ext-pay-123")
              .checkoutSessionId("session-456")
              .checkoutUrl("https://checkout.epayco.co/123")
              .build();

      when(parkingTicketsRepository.findById(ticketId)).thenReturn(Optional.of(ticket));
      when(paymentsRepository.processPayment(any(Payments.class)))
          .thenReturn(Result.success(initialPayment))
          .thenReturn(Result.success(updatedPayment));
      when(paymentProviderGateway.processPayment(any(), any(), any()))
          .thenReturn(Result.success(metadata));

      // Act
      Result<Payments, PaymentError> result = strategy.processPayment(command);

      // Assert
      assertThat(result.isSuccess()).isTrue();
      assertThat(result.get()).isEqualTo(updatedPayment);

      verify(parkingTicketsRepository)
          .prepareCheckout(eq(ticketId), argThat(a -> a.compareTo(amount) == 0));
      verify(paymentNotifier).notifyPaymentCheckout(updatedPayment, price, "Standard Rate");
    }
  }

  @Nested
  @DisplayName("Error & Failure Cases")
  class ErrorCases {

    @Test
    @DisplayName("Should throw ParkingTicketNotFound when ticket does not exist in repository")
    void shouldThrowWhenTicketNotFound() {
      // Arrange
      UUID ticketId = UUID.randomUUID();
      ParkingTickets ticket = ParkingTickets.builder().id(ticketId).build();
      PaymentCommand command =
          PaymentCommand.of(ticket, createSamplePriceDetailed(BigDecimal.TEN), new NoSendCheckOut(ticketId, UUID.randomUUID(), PaymentsMethods.PAY_LINK));

      when(parkingTicketsRepository.findById(ticketId)).thenReturn(Optional.empty());

      // Act & Assert
      assertThatThrownBy(() -> strategy.processPayment(command))
          .isInstanceOf(ParkingTicketNotFound.class);

      verify(paymentProviderGateway, never()).processPayment(any(), any(), any());
    }

    @Test
    @DisplayName("Should return failure when initial payment creation in repository fails")
    void shouldReturnFailureWhenInitialPaymentFails() {
      // Arrange
      UUID ticketId = UUID.randomUUID();
      ParkingTickets ticket = ParkingTickets.builder().id(ticketId).build();
      PaymentCommand command =
          PaymentCommand.of(ticket, createSamplePriceDetailed(BigDecimal.TEN), new NoSendCheckOut(ticketId, UUID.randomUUID(), PaymentsMethods.PAY_LINK));

      when(parkingTicketsRepository.findById(ticketId)).thenReturn(Optional.of(ticket));
      when(paymentsRepository.processPayment(any(Payments.class)))
          .thenReturn(Result.failure(new PaymentError.DatabaseError("DB connection failed")));

      // Act
      Result<Payments, PaymentError> result = strategy.processPayment(command);

      // Assert
      assertThat(result.isFailure()).isTrue();
      assertThat(result.getError()).isInstanceOf(PaymentError.DatabaseError.class);
      verify(parkingTicketsRepository, never()).prepareCheckout(any(), any());
      verify(paymentNotifier, never()).notifyPaymentCheckout(any(), any(), any());
    }

    @Test
    @DisplayName("Should return failure when payment provider returns error")
    void shouldReturnFailureWhenProviderFails() {
      // Arrange
      UUID ticketId = UUID.randomUUID();
      ParkingTickets ticket = ParkingTickets.builder().id(ticketId).build();
      PaymentCommand command =
          PaymentCommand.of(ticket, createSamplePriceDetailed(BigDecimal.TEN), new NoSendCheckOut(ticketId, UUID.randomUUID(), PaymentsMethods.PAY_LINK));

      Payments initialPayment = Payments.builder().id(UUID.randomUUID()).parkingTicket(ticket).build();

      when(parkingTicketsRepository.findById(ticketId)).thenReturn(Optional.of(ticket));
      when(paymentsRepository.processPayment(any(Payments.class)))
          .thenReturn(Result.success(initialPayment));
      when(paymentProviderGateway.processPayment(any(), any(), any()))
          .thenReturn(Result.failure(new PaymentError.ProviderServerError("Epayco", "502 Bad Gateway")));

      // Act
      Result<Payments, PaymentError> result = strategy.processPayment(command);

      // Assert
      assertThat(result.isFailure()).isTrue();
      assertThat(result.getError()).isInstanceOf(PaymentError.ProviderServerError.class);
      verify(parkingTicketsRepository, never()).prepareCheckout(any(), any());
      verify(paymentNotifier, never()).notifyPaymentCheckout(any(), any(), any());
    }
  }
}
