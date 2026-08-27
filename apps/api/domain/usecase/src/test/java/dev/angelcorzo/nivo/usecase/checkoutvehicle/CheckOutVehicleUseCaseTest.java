package dev.angelcorzo.nivo.usecase.checkoutvehicle;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

import dev.angelcorzo.nivo.model.parkingtickets.ParkingTickets;
import dev.angelcorzo.nivo.model.parkingtickets.enums.ParkingTicketStatus;
import dev.angelcorzo.nivo.model.parkingtickets.gateways.ParkingTicketsRepository;
import dev.angelcorzo.nivo.model.payments.Payments;
import dev.angelcorzo.nivo.model.payments.enums.PaymentStatus;
import dev.angelcorzo.nivo.model.payments.enums.PaymentsMethods;
import dev.angelcorzo.nivo.model.payments.exceptions.ProcessPaymentException;
import dev.angelcorzo.nivo.model.payments.valueobject.check_out.CheckOut;
import dev.angelcorzo.nivo.model.payments.valueobject.check_out.NoSendCheckOut;
import dev.angelcorzo.nivo.usecase.calculaterate.CalculateRateUseCase;
import dev.angelcorzo.nivo.usecase.calculaterate.dtos.PriceDetailed;
import dev.angelcorzo.nivo.usecase.calculaterate.dtos.PriceLine;
import dev.angelcorzo.nivo.usecase.processpayment.ProcessPaymentUseCase;
import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

@DisplayName("CheckOutVehicleUseCase Tests")
class CheckOutVehicleUseCaseTest {

  private ProcessPaymentUseCase processPayment;
  private CalculateRateUseCase calculateRateUseCase;
  private ParkingTicketsRepository parkingTicketsRepository;
  private CheckOutVehicleUseCase useCase;

  @BeforeEach
  void setUp() {
    processPayment = mock(ProcessPaymentUseCase.class);
    calculateRateUseCase = mock(CalculateRateUseCase.class);
    parkingTicketsRepository = mock(ParkingTicketsRepository.class);

    useCase = new CheckOutVehicleUseCase(processPayment, calculateRateUseCase, parkingTicketsRepository);
  }

  @Nested
  @DisplayName("Happy Path")
  class HappyPath {

    @Test
    @DisplayName("Should successfully checkout vehicle and process payment")
    void shouldCheckOutVehicleSuccessfully() {
      // Arrange
      UUID ticketId = UUID.randomUUID();
      UUID tenantId = UUID.randomUUID();
      CheckOut command = new NoSendCheckOut(ticketId, tenantId, PaymentsMethods.EFFECTIVE);

      ParkingTickets ticket =
          ParkingTickets.builder()
              .id(ticketId)
              .status(ParkingTicketStatus.OPEN)
              .build();

      PriceDetailed price = PriceDetailed.of("Central Parking");
      price.addLine(new PriceLine("Base", BigDecimal.valueOf(10000)));
      price.setIvaRate(BigDecimal.valueOf(0.19));

      Payments payment =
          Payments.builder()
              .id(UUID.randomUUID())
              .status(PaymentStatus.PAID)
              .paymentMethod(PaymentsMethods.EFFECTIVE)
              .build();

      when(parkingTicketsRepository.findById(ticketId)).thenReturn(Optional.of(ticket));
      when(calculateRateUseCase.execute(ticketId)).thenReturn(price);
      when(processPayment.execute(ticket, price, command)).thenReturn(payment);

      // Act
      Payments result = useCase.execute(command);

      // Assert
      assertThat(result).isNotNull();
      assertThat(result.getStatus()).isEqualTo(PaymentStatus.PAID);
      verify(calculateRateUseCase).execute(ticketId);
      verify(processPayment).execute(ticket, price, command);
    }
  }

  @Nested
  @DisplayName("Validation & Error Cases")
  class ErrorCases {

    @Test
    @DisplayName("Should throw ProcessPaymentException when ticket is not found")
    void shouldThrowWhenTicketNotFound() {
      UUID ticketId = UUID.randomUUID();
      UUID tenantId = UUID.randomUUID();
      CheckOut command = new NoSendCheckOut(ticketId, tenantId, PaymentsMethods.EFFECTIVE);

      when(parkingTicketsRepository.findById(ticketId)).thenReturn(Optional.empty());

      assertThatThrownBy(() -> useCase.execute(command))
          .isInstanceOf(ProcessPaymentException.class);
    }

    @Test
    @DisplayName("Should throw ProcessPaymentException with Duplicate error when ticket is already closed")
    void shouldThrowWhenTicketAlreadyClosed() {
      UUID ticketId = UUID.randomUUID();
      UUID tenantId = UUID.randomUUID();
      CheckOut command = new NoSendCheckOut(ticketId, tenantId, PaymentsMethods.EFFECTIVE);

      ParkingTickets ticket =
          ParkingTickets.builder()
              .id(ticketId)
              .status(ParkingTicketStatus.CLOSED)
              .build();

      when(parkingTicketsRepository.findById(ticketId)).thenReturn(Optional.of(ticket));

      assertThatThrownBy(() -> useCase.execute(command))
          .isInstanceOf(ProcessPaymentException.class);
    }
  }
}
