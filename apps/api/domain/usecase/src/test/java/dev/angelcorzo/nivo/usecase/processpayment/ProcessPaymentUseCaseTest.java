package dev.angelcorzo.nivo.usecase.processpayment;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
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
import dev.angelcorzo.nivo.model.payments.exceptions.ProcessPaymentException;
import dev.angelcorzo.nivo.model.payments.gateways.PaymentProviderGateway;
import dev.angelcorzo.nivo.model.payments.gateways.PaymentsRepository;
import dev.angelcorzo.nivo.model.payments.valueobject.check_out.CheckOut;
import dev.angelcorzo.nivo.model.payments.valueobject.check_out.NoSendCheckOut;
import dev.angelcorzo.nivo.model.transactions.gateways.TransactionsRepository;
import dev.angelcorzo.nivo.usecase.calculaterate.dtos.PriceDetailed;
import dev.angelcorzo.nivo.usecase.calculaterate.dtos.PriceLine;
import dev.angelcorzo.nivo.usecase.notifications.PaymentNotifier;
import dev.angelcorzo.nivo.usecase.notifications.TicketNotifier;
import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

@DisplayName("ProcessPaymentUseCase Tests")
class ProcessPaymentUseCaseTest {

  private PaymentsRepository paymentsRepository;
  private ParkingTicketsRepository parkingTicketsRepository;
  private PaymentProviderGateway paymentProviderGateway;
  private TransactionsRepository transactionsRepository;
  private PaymentNotifier paymentNotifier;
  private TicketNotifier ticketNotifier;
  private ProcessPaymentUseCase useCase;

  @BeforeEach
  void setUp() {
    paymentsRepository = mock(PaymentsRepository.class);
    parkingTicketsRepository = mock(ParkingTicketsRepository.class);
    paymentProviderGateway = mock(PaymentProviderGateway.class);
    transactionsRepository = mock(TransactionsRepository.class);
    paymentNotifier = mock(PaymentNotifier.class);
    ticketNotifier = mock(TicketNotifier.class);

    useCase =
        new ProcessPaymentUseCase(
            paymentsRepository,
            parkingTicketsRepository,
            paymentProviderGateway,
            transactionsRepository,
            paymentNotifier,
            ticketNotifier);
  }

  private PriceDetailed createSamplePriceDetailed(BigDecimal amount) {
    PriceDetailed price = PriceDetailed.of("Hourly Rate");
    price.addLine(new PriceLine("Hourly Rate", amount));
    return price;
  }

  @Nested
  @DisplayName("Existing Payment Idempotency")
  class IdempotencyTests {

    @Test
    @DisplayName("Should return existing payment if one already exists for the ticket")
    void shouldReturnExistingPaymentWhenFound() {
      // Arrange
      UUID ticketId = UUID.randomUUID();
      ParkingTickets ticket = ParkingTickets.builder().id(ticketId).build();
      Payments existingPayment =
          Payments.builder()
              .id(UUID.randomUUID())
              .parkingTicket(ticket)
              .amount(BigDecimal.valueOf(10000))
              .status(PaymentStatus.PAID)
              .build();

      when(paymentsRepository.findByParkingTicketId(ticketId))
          .thenReturn(Optional.of(existingPayment));

      CheckOut checkOut = new NoSendCheckOut(ticketId, UUID.randomUUID(), PaymentsMethods.EFFECTIVE);
      PriceDetailed price = createSamplePriceDetailed(BigDecimal.valueOf(10000));

      // Act
      Payments result = useCase.execute(ticket, price, checkOut);

      // Assert
      assertThat(result).isEqualTo(existingPayment);
      verify(paymentsRepository, never()).processPayment(any());
    }
  }

  @Nested
  @DisplayName("New Payment Intent")
  class NewPaymentIntentTests {

    @Test
    @DisplayName("Should process effective cash payment when no existing payment found")
    void shouldProcessEffectivePaymentWhenNoneExists() {
      // Arrange
      UUID ticketId = UUID.randomUUID();
      ParkingTickets ticket = ParkingTickets.builder().id(ticketId).build();
      BigDecimal amount = BigDecimal.valueOf(12000);
      PriceDetailed price = createSamplePriceDetailed(amount);
      CheckOut checkOut = new NoSendCheckOut(ticketId, UUID.randomUUID(), PaymentsMethods.EFFECTIVE);

      Payments processedPayment =
          Payments.builder()
              .id(UUID.randomUUID())
              .parkingTicket(ticket)
              .amount(amount)
              .paymentMethod(PaymentsMethods.EFFECTIVE)
              .status(PaymentStatus.PAID)
              .build();

      when(paymentsRepository.findByParkingTicketId(ticketId)).thenReturn(Optional.empty());
      when(paymentsRepository.processPayment(any(Payments.class)))
          .thenReturn(Result.success(processedPayment));

      // Act
      Payments result = useCase.execute(ticket, price, checkOut);

      // Assert
      assertThat(result).isNotNull();
      assertThat(result.getStatus()).isEqualTo(PaymentStatus.PAID);
      verify(parkingTicketsRepository).closeTicket(ticketId);
    }

    @Test
    @DisplayName("Should throw ProcessPaymentException when payment processing fails")
    void shouldThrowWhenPaymentFails() {
      // Arrange
      UUID ticketId = UUID.randomUUID();
      ParkingTickets ticket = ParkingTickets.builder().id(ticketId).build();
      PriceDetailed price = createSamplePriceDetailed(BigDecimal.TEN);
      CheckOut checkOut = new NoSendCheckOut(ticketId, UUID.randomUUID(), PaymentsMethods.EFFECTIVE);

      when(paymentsRepository.findByParkingTicketId(ticketId)).thenReturn(Optional.empty());
      when(paymentsRepository.processPayment(any(Payments.class)))
          .thenReturn(Result.failure(new PaymentError.DatabaseError("Failure in DB")));

      // Act & Assert
      assertThatThrownBy(() -> useCase.execute(ticket, price, checkOut))
          .isInstanceOf(ProcessPaymentException.class);
    }
  }
}
