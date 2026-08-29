package dev.angelcorzo.nivo.usecase.checkinvehiclewithoureservation;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import dev.angelcorzo.nivo.model.parkingtickets.ParkingTickets;
import dev.angelcorzo.nivo.model.parkingtickets.gateways.ParkingTicketsRepository;
import dev.angelcorzo.nivo.model.rates.Rates;
import dev.angelcorzo.nivo.model.rates.exceptions.RateNotFoundException;
import dev.angelcorzo.nivo.model.rates.gateways.RatesRepository;
import dev.angelcorzo.nivo.model.slots.Slots;
import dev.angelcorzo.nivo.model.slots.enums.SlotStatus;
import dev.angelcorzo.nivo.model.slots.excetions.SlotNotFoundException;
import dev.angelcorzo.nivo.model.slots.gateways.SlotsRepository;
import dev.angelcorzo.nivo.model.tenants.Tenants;
import dev.angelcorzo.nivo.model.tenants.exceptions.TenantNotExistsException;
import dev.angelcorzo.nivo.model.tenants.gateways.TenantsRepository;
import dev.angelcorzo.nivo.model.users.Users;
import dev.angelcorzo.nivo.model.users.gateways.UsersRepository;
import dev.angelcorzo.nivo.usecase.notifications.TicketNotifier;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

@DisplayName("CheckInVehicleWithoutReservationUseCase Tests")
class CheckInVehicleWithoutReservationUseCaseTest {

  private ParkingTicketsRepository parkingTicketsRepository;
  private TenantsRepository tenantsRepository;
  private UsersRepository usersRepository;
  private SlotsRepository slotsRepository;
  private RatesRepository ratesRepository;
  private TicketNotifier ticketNotifier;
  private CheckInVehicleWithoutReservationUseCase useCase;

  @BeforeEach
  void setUp() {
    parkingTicketsRepository = mock(ParkingTicketsRepository.class);
    tenantsRepository = mock(TenantsRepository.class);
    usersRepository = mock(UsersRepository.class);
    slotsRepository = mock(SlotsRepository.class);
    ratesRepository = mock(RatesRepository.class);
    ticketNotifier = mock(TicketNotifier.class);

    useCase =
        new CheckInVehicleWithoutReservationUseCase(
            parkingTicketsRepository,
            tenantsRepository,
            usersRepository,
            slotsRepository,
            ratesRepository,
            ticketNotifier);
  }

  @Nested
  @DisplayName("Happy Path")
  class HappyPath {

    @Test
    @DisplayName("Should check-in vehicle with registered user, set slot OCCUPIED and notify")
    void shouldCheckInWithRegisteredUser() {
      // Arrange
      UUID slotId = UUID.randomUUID();
      UUID tenantId = UUID.randomUUID();
      UUID rateId = UUID.randomUUID();
      String email = "driver@example.com";
      String plate = "ABC-123";

      CheckInVehicleWithoutReservationUseCase.CreatedParkingTicket command =
          new CheckInVehicleWithoutReservationUseCase.CreatedParkingTicket(
              slotId, tenantId, email, rateId, plate);

      Slots mockSlot =
          Slots.builder().id(slotId).slotNumber("A-1").status(SlotStatus.AVAILABLE).build();
      Tenants mockTenant = Tenants.builder().id(tenantId).companyName("Central Park").build();
      Rates mockRate = Rates.builder().id(rateId).name("Standard").build();
      Users mockUser = Users.builder().id(UUID.randomUUID()).email(email).build();

      when(slotsRepository.findById(slotId)).thenReturn(Optional.of(mockSlot));
      when(tenantsRepository.existsById(tenantId)).thenReturn(true);
      when(ratesRepository.existsById(rateId)).thenReturn(true);

      when(slotsRepository.save(any(Slots.class)))
          .thenAnswer(invocation -> invocation.getArgument(0));
      when(tenantsRepository.getReferenceById(tenantId)).thenReturn(mockTenant);
      when(ratesRepository.getReferenceById(rateId)).thenReturn(mockRate);
      when(usersRepository.findByEmail(email)).thenReturn(Optional.of(mockUser));

      when(parkingTicketsRepository.save(any(ParkingTickets.class)))
          .thenAnswer(invocation -> invocation.getArgument(0));

      // Act
      ParkingTickets ticket = useCase.execute(command);

      // Assert
      assertThat(ticket).isNotNull();
      assertThat(ticket.getLicensePlate()).isEqualTo(plate);
      assertThat(ticket.getEntryTime()).isNotNull();
      assertThat(mockSlot.getStatus()).isEqualTo(SlotStatus.OCCUPIED);
      assertThat(ticket.getSlot().status()).isEqualTo(SlotStatus.OCCUPIED);
      verify(slotsRepository).findById(slotId);
      verify(slotsRepository).save(mockSlot);
      verify(ticketNotifier).notifyTicketOpened(ticket);
      verify(parkingTicketsRepository).save(any(ParkingTickets.class));
    }

    @Test
    @DisplayName("Should check-in anonymous vehicle, set slot OCCUPIED without notification")
    void shouldCheckInAnonymousVehicle() {
      // Arrange
      UUID slotId = UUID.randomUUID();
      UUID tenantId = UUID.randomUUID();
      UUID rateId = UUID.randomUUID();
      String plate = "XYZ-789";

      CheckInVehicleWithoutReservationUseCase.CreatedParkingTicket command =
          new CheckInVehicleWithoutReservationUseCase.CreatedParkingTicket(
              slotId, tenantId, null, rateId, plate);

      Slots mockSlot =
          Slots.builder().id(slotId).slotNumber("B-2").status(SlotStatus.AVAILABLE).build();
      Tenants mockTenant = Tenants.builder().id(tenantId).companyName("Central Park").build();
      Rates mockRate = Rates.builder().id(rateId).name("Standard").build();

      when(slotsRepository.findById(slotId)).thenReturn(Optional.of(mockSlot));
      when(tenantsRepository.existsById(tenantId)).thenReturn(true);
      when(ratesRepository.existsById(rateId)).thenReturn(true);

      when(slotsRepository.save(any(Slots.class)))
          .thenAnswer(invocation -> invocation.getArgument(0));
      when(tenantsRepository.getReferenceById(tenantId)).thenReturn(mockTenant);
      when(ratesRepository.getReferenceById(rateId)).thenReturn(mockRate);

      when(parkingTicketsRepository.save(any(ParkingTickets.class)))
          .thenAnswer(invocation -> invocation.getArgument(0));

      // Act
      ParkingTickets ticket = useCase.execute(command);

      // Assert
      assertThat(ticket).isNotNull();
      assertThat(mockSlot.getStatus()).isEqualTo(SlotStatus.OCCUPIED);
      assertThat(ticket.getSlot().status()).isEqualTo(SlotStatus.OCCUPIED);
      verify(slotsRepository).findById(slotId);
      verify(slotsRepository).save(mockSlot);
      verify(ticketNotifier, never()).notifyTicketOpened(any());
      verify(parkingTicketsRepository).save(any(ParkingTickets.class));
    }
  }

  @Nested
  @DisplayName("Validation & Error Cases")
  class ErrorCases {

    @Test
    @DisplayName("Should throw SlotNotFoundException when slot does not exist")
    void shouldThrowWhenSlotNotFound() {
      UUID slotId = UUID.randomUUID();
      CheckInVehicleWithoutReservationUseCase.CreatedParkingTicket command =
          new CheckInVehicleWithoutReservationUseCase.CreatedParkingTicket(
              slotId, UUID.randomUUID(), null, UUID.randomUUID(), "ABC-123");

      when(slotsRepository.findById(slotId)).thenReturn(Optional.empty());

      assertThatThrownBy(() -> useCase.execute(command))
          .isInstanceOf(SlotNotFoundException.class);
      verify(slotsRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should throw TenantNotExistsException when tenant does not exist")
    void shouldThrowWhenTenantNotFound() {
      UUID slotId = UUID.randomUUID();
      UUID tenantId = UUID.randomUUID();
      CheckInVehicleWithoutReservationUseCase.CreatedParkingTicket command =
          new CheckInVehicleWithoutReservationUseCase.CreatedParkingTicket(
              slotId, tenantId, null, UUID.randomUUID(), "ABC-123");

      Slots mockSlot = Slots.builder().id(slotId).slotNumber("A-1").build();
      when(slotsRepository.findById(slotId)).thenReturn(Optional.of(mockSlot));
      when(tenantsRepository.existsById(tenantId)).thenReturn(false);

      assertThatThrownBy(() -> useCase.execute(command))
          .isInstanceOf(TenantNotExistsException.class);
      verify(slotsRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should throw RateNotFoundException when rate does not exist")
    void shouldThrowWhenRateNotFound() {
      UUID slotId = UUID.randomUUID();
      UUID tenantId = UUID.randomUUID();
      UUID rateId = UUID.randomUUID();
      CheckInVehicleWithoutReservationUseCase.CreatedParkingTicket command =
          new CheckInVehicleWithoutReservationUseCase.CreatedParkingTicket(
              slotId, tenantId, null, rateId, "ABC-123");

      Slots mockSlot = Slots.builder().id(slotId).slotNumber("A-1").build();
      when(slotsRepository.findById(slotId)).thenReturn(Optional.of(mockSlot));
      when(tenantsRepository.existsById(tenantId)).thenReturn(true);
      when(ratesRepository.existsById(rateId)).thenReturn(false);

      assertThatThrownBy(() -> useCase.execute(command))
          .isInstanceOf(RateNotFoundException.class);
      verify(slotsRepository, never()).save(any());
    }
  }
}
