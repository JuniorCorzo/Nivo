package dev.angelcorzo.nivo.domain.usecase.ticket;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import dev.angelcorzo.nivo.domain.model.parkingtickets.ParkingTickets;
import dev.angelcorzo.nivo.domain.model.parkingtickets.enums.PlateCountry;
import dev.angelcorzo.nivo.domain.model.parkingtickets.exceptions.UnplatedVehiclePhotoRequiredException;
import dev.angelcorzo.nivo.domain.model.parkingtickets.gateways.ParkingTicketsRepository;
import dev.angelcorzo.nivo.domain.model.parkingtickets.gateways.UnplatedTicketSequenceGateway;
import dev.angelcorzo.nivo.domain.model.rates.Rates;
import dev.angelcorzo.nivo.domain.model.rates.gateways.RatesRepository;
import dev.angelcorzo.nivo.domain.model.slots.Slots;
import dev.angelcorzo.nivo.domain.model.slots.enums.SlotStatus;
import dev.angelcorzo.nivo.domain.model.slots.excetions.SlotCannotBeModifiedException;
import dev.angelcorzo.nivo.domain.model.slots.gateways.SlotsRepository;
import dev.angelcorzo.nivo.domain.model.tenants.Tenants;
import dev.angelcorzo.nivo.domain.model.tenants.gateways.TenantsRepository;
import dev.angelcorzo.nivo.domain.model.users.Users;
import dev.angelcorzo.nivo.domain.model.users.gateways.UsersRepository;
import dev.angelcorzo.nivo.domain.usecase.notification.notifier.TicketNotifier;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

@DisplayName("CheckinVehicleUseCase Tests")
class CheckinVehicleUseCaseTest {

    private ParkingTicketsRepository parkingTicketsRepository;
    private TenantsRepository tenantsRepository;
    private UsersRepository usersRepository;
    private SlotsRepository slotsRepository;
    private RatesRepository ratesRepository;
    private TicketNotifier ticketNotifier;
    private UnplatedTicketSequenceGateway unplatedTicketSequenceGateway;
    private CheckinVehicleUseCase useCase;

    @BeforeEach
    void setUp() {
        parkingTicketsRepository = mock(ParkingTicketsRepository.class);
        tenantsRepository = mock(TenantsRepository.class);
        usersRepository = mock(UsersRepository.class);
        slotsRepository = mock(SlotsRepository.class);
        ratesRepository = mock(RatesRepository.class);
        ticketNotifier = mock(TicketNotifier.class);
        unplatedTicketSequenceGateway = mock(UnplatedTicketSequenceGateway.class);

        useCase = new CheckinVehicleUseCase(
                parkingTicketsRepository,
                tenantsRepository,
                usersRepository,
                slotsRepository,
                ratesRepository,
                ticketNotifier,
                unplatedTicketSequenceGateway);
    }

    @Nested
    @DisplayName("Successful Vehicle Check-in Scenarios")
    class HappyPath {

        @Test
        @DisplayName("Should check-in vehicle with registered user, set slot OCCUPIED and notify")
        void shouldCheckInWithRegisteredUser() {
            // Arrange
            final UUID slotId = UUID.randomUUID();
            final UUID tenantId = UUID.randomUUID();
            final UUID rateId = UUID.randomUUID();
            final String email = "driver@example.com";
            final String plate = "ABC123";

            final CheckinVehicleUseCase.CreatedParkingTicket command =
                    new CheckinVehicleUseCase.CreatedParkingTicket(slotId, tenantId, email, rateId, plate);

            final Slots mockSlot = Slots.builder()
                    .id(slotId)
                    .slotNumber("A-1")
                    .status(SlotStatus.AVAILABLE)
                    .build();
            final Tenants mockTenant =
                    Tenants.builder().id(tenantId).companyName("Central Park").build();
            final Rates mockRate = Rates.builder().id(rateId).name("Standard").build();
            final Users mockUser =
                    Users.builder().id(UUID.randomUUID()).email(email).build();

            when(slotsRepository.findById(slotId)).thenReturn(Optional.of(mockSlot));
            when(tenantsRepository.existsById(tenantId)).thenReturn(true);
            when(ratesRepository.existsById(rateId)).thenReturn(true);

            when(slotsRepository.save(any(Slots.class))).thenAnswer(invocation -> invocation.getArgument(0));
            when(tenantsRepository.getReferenceById(tenantId)).thenReturn(mockTenant);
            when(ratesRepository.getReferenceById(rateId)).thenReturn(mockRate);
            when(usersRepository.findByEmail(email)).thenReturn(Optional.of(mockUser));

            when(parkingTicketsRepository.save(any(ParkingTickets.class)))
                    .thenAnswer(invocation -> invocation.getArgument(0));

            // Act
            final ParkingTickets ticket = useCase.execute(command);

            // Assert
            assertThat(ticket).isNotNull();
            assertThat(ticket.getLicensePlate()).isEqualTo("ABC123");
            assertThat(ticket.getPlateCountry()).isEqualTo(PlateCountry.CO);
            assertThat(mockSlot.getStatus()).isEqualTo(SlotStatus.OCCUPIED);
            verify(ticketNotifier, times(1)).notifyTicketOpened(ticket);
        }
    }

    @Nested
    @DisplayName("Unplated Vehicles & Venezuelan Plates")
    class UnplatedAndVenezuelanVehicles {

        @Test
        @DisplayName("Should check-in unplated motorcycle, generate synthetic SP- code and store photo and phone")
        void shouldCheckInUnplatedMotorcycle() {
            // Arrange
            final UUID slotId = UUID.randomUUID();
            final UUID tenantId = UUID.randomUUID();
            final UUID rateId = UUID.randomUUID();
            final String photoUrl = "https://storage.nivo.dev/photos/bike-123.jpg";
            final String phoneNumber = "+573001234567";

            final CheckinVehicleUseCase.CreatedParkingTicket command =
                    CheckinVehicleUseCase.CreatedParkingTicket.builder()
                            .slotId(slotId)
                            .tenantId(tenantId)
                            .rateId(rateId)
                            .plate(null)
                            .plateCountry(PlateCountry.UNPLATED)
                            .photoUrl(photoUrl)
                            .phoneNumber(phoneNumber)
                            .build();

            final Slots mockSlot = Slots.builder()
                    .id(slotId)
                    .slotNumber("M-01")
                    .status(SlotStatus.AVAILABLE)
                    .build();
            final Tenants mockTenant =
                    Tenants.builder().id(tenantId).companyName("Central Park").build();
            final Rates mockRate =
                    Rates.builder().id(rateId).name("Moto Tariff").build();

            when(slotsRepository.findById(slotId)).thenReturn(Optional.of(mockSlot));
            when(tenantsRepository.existsById(tenantId)).thenReturn(true);
            when(ratesRepository.existsById(rateId)).thenReturn(true);
            when(slotsRepository.save(any(Slots.class))).thenAnswer(invocation -> invocation.getArgument(0));
            when(tenantsRepository.getReferenceById(tenantId)).thenReturn(mockTenant);
            when(ratesRepository.getReferenceById(rateId)).thenReturn(mockRate);
            when(unplatedTicketSequenceGateway.nextTicketCode(any())).thenReturn("SP-1001");
            when(parkingTicketsRepository.save(any(ParkingTickets.class)))
                    .thenAnswer(invocation -> invocation.getArgument(0));

            // Act
            final ParkingTickets ticket = useCase.execute(command);

            // Assert
            assertThat(ticket).isNotNull();
            assertThat(ticket.getLicensePlate()).isEqualTo("SP-1001");
            assertThat(ticket.getPlateCountry()).isEqualTo(PlateCountry.UNPLATED);
            assertThat(ticket.getPhotoUrl()).isEqualTo(photoUrl);
            assertThat(ticket.getPhoneNumber()).isEqualTo(phoneNumber);
            assertThat(mockSlot.getStatus()).isEqualTo(SlotStatus.OCCUPIED);
            verify(unplatedTicketSequenceGateway, times(1)).nextTicketCode(any());
        }

        @Test
        @DisplayName("Should throw UnplatedVehiclePhotoRequiredException when photo is missing for unplated vehicle")
        void shouldThrowExceptionWhenUnplatedVehicleHasNoPhoto() {
            // Arrange
            final UUID slotId = UUID.randomUUID();
            final UUID tenantId = UUID.randomUUID();
            final UUID rateId = UUID.randomUUID();

            final CheckinVehicleUseCase.CreatedParkingTicket command =
                    CheckinVehicleUseCase.CreatedParkingTicket.builder()
                            .slotId(slotId)
                            .tenantId(tenantId)
                            .rateId(rateId)
                            .plateCountry(PlateCountry.UNPLATED)
                            .photoUrl(null)
                            .build();

            final Slots mockSlot = Slots.builder()
                    .id(slotId)
                    .slotNumber("M-01")
                    .status(SlotStatus.AVAILABLE)
                    .build();

            when(slotsRepository.findById(slotId)).thenReturn(Optional.of(mockSlot));
            when(tenantsRepository.existsById(tenantId)).thenReturn(true);
            when(ratesRepository.existsById(rateId)).thenReturn(true);

            // Act & Assert
            assertThatThrownBy(() -> useCase.execute(command))
                    .isInstanceOf(UnplatedVehiclePhotoRequiredException.class);
            verify(parkingTicketsRepository, never()).save(any());
        }

        @Test
        @DisplayName("Should check-in vehicle with Venezuelan license plate")
        void shouldCheckInVenezuelanPlate() {
            // Arrange
            final UUID slotId = UUID.randomUUID();
            final UUID tenantId = UUID.randomUUID();
            final UUID rateId = UUID.randomUUID();
            final String plate = "AB123CD";

            final CheckinVehicleUseCase.CreatedParkingTicket command =
                    CheckinVehicleUseCase.CreatedParkingTicket.builder()
                            .slotId(slotId)
                            .tenantId(tenantId)
                            .rateId(rateId)
                            .plate(plate)
                            .plateCountry(PlateCountry.VE)
                            .build();

            final Slots mockSlot = Slots.builder()
                    .id(slotId)
                    .slotNumber("V-01")
                    .status(SlotStatus.AVAILABLE)
                    .build();
            final Tenants mockTenant =
                    Tenants.builder().id(tenantId).companyName("Central Park").build();
            final Rates mockRate = Rates.builder().id(rateId).name("Standard").build();

            when(slotsRepository.findById(slotId)).thenReturn(Optional.of(mockSlot));
            when(tenantsRepository.existsById(tenantId)).thenReturn(true);
            when(ratesRepository.existsById(rateId)).thenReturn(true);
            when(slotsRepository.save(any(Slots.class))).thenAnswer(invocation -> invocation.getArgument(0));
            when(tenantsRepository.getReferenceById(tenantId)).thenReturn(mockTenant);
            when(ratesRepository.getReferenceById(rateId)).thenReturn(mockRate);
            when(parkingTicketsRepository.save(any(ParkingTickets.class)))
                    .thenAnswer(invocation -> invocation.getArgument(0));

            // Act
            final ParkingTickets ticket = useCase.execute(command);

            // Assert
            assertThat(ticket).isNotNull();
            assertThat(ticket.getLicensePlate()).isEqualTo("AB123CD");
            assertThat(ticket.getPlateCountry()).isEqualTo(PlateCountry.VE);
            verify(unplatedTicketSequenceGateway, never()).nextTicketCode(any());
        }
    }

    @Nested
    @DisplayName("Slot Availability Validation")
    class SlotAvailabilityValidation {

        @Test
        @DisplayName("Should throw SlotCannotBeModifiedException when slot is not available")
        void shouldThrowSlotCannotBeModifiedExceptionWhenSlotNotAvailable() {
            // Arrange
            final UUID slotId = UUID.randomUUID();
            final UUID tenantId = UUID.randomUUID();
            final UUID rateId = UUID.randomUUID();
            final CheckinVehicleUseCase.CreatedParkingTicket command = new CheckinVehicleUseCase.CreatedParkingTicket(
                    slotId, tenantId, "driver@example.com", rateId, "ABC123");

            final Slots mockSlot = Slots.builder()
                    .id(slotId)
                    .slotNumber("A-1")
                    .status(SlotStatus.OCCUPIED)
                    .build();

            when(slotsRepository.findById(slotId)).thenReturn(Optional.of(mockSlot));

            // Act & Assert
            assertThatThrownBy(() -> useCase.execute(command))
                    .isInstanceOf(SlotCannotBeModifiedException.class)
                    .hasMessageContaining("Slot cannot be used for check-in because it is not available: " + slotId);

            verify(parkingTicketsRepository, never()).save(any());
            verify(slotsRepository, never()).save(any());
        }
    }
}
