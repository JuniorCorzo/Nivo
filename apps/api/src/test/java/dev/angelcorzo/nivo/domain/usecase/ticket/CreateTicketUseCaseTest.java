package dev.angelcorzo.nivo.domain.usecase.ticket;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import dev.angelcorzo.nivo.domain.model.parkingtickets.ParkingTickets;
import dev.angelcorzo.nivo.domain.model.parkingtickets.gateways.ParkingTicketsRepository;
import dev.angelcorzo.nivo.domain.model.parkingtickets.valueobjects.SlotSnapshot;
import dev.angelcorzo.nivo.domain.model.rates.Rates;
import dev.angelcorzo.nivo.domain.model.rates.gateways.RatesRepository;
import dev.angelcorzo.nivo.domain.model.slots.Slots;
import dev.angelcorzo.nivo.domain.model.slots.enums.SlotStatus;
import dev.angelcorzo.nivo.domain.model.slots.enums.SlotType;
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
import org.junit.jupiter.api.Test;

@DisplayName("CreateTicketUseCase Tests")
class CreateTicketUseCaseTest {

  private ParkingTicketsRepository parkingTicketsRepository;
  private TenantsRepository tenantsRepository;
  private UsersRepository usersRepository;
  private SlotsRepository slotsRepository;
  private RatesRepository ratesRepository;
  private TicketNotifier ticketNotifier;
  private CreateTicketUseCase useCase;

  @BeforeEach
  void setUp() {
    parkingTicketsRepository = mock(ParkingTicketsRepository.class);
    tenantsRepository = mock(TenantsRepository.class);
    usersRepository = mock(UsersRepository.class);
    slotsRepository = mock(SlotsRepository.class);
    ratesRepository = mock(RatesRepository.class);
    ticketNotifier = mock(TicketNotifier.class);

    useCase =
        new CreateTicketUseCase(
            parkingTicketsRepository,
            tenantsRepository,
            usersRepository,
            slotsRepository,
            ratesRepository,
            ticketNotifier);
  }

  @Test
  @DisplayName("Should capture immutable slot snapshot when creating ticket")
  void shouldCaptureImmutableSlotSnapshotWhenCreatingTicket() {
    UUID slotId = UUID.randomUUID();
    UUID tenantId = UUID.randomUUID();
    UUID rateId = UUID.randomUUID();
    String email = "driver@example.com";
    String plate = "ABC-123";

    CheckinVehicleUseCase.CreatedParkingTicket command =
        new CheckinVehicleUseCase.CreatedParkingTicket(
            slotId, tenantId, email, rateId, plate);

    Slots mockSlot =
        Slots.builder()
            .id(slotId)
            .slotNumber("A-01")
            .zone("Zone-1")
            .prefix("A")
            .type(SlotType.CAR)
            .hasCharger(true)
            .isAccessible(true)
            .status(SlotStatus.AVAILABLE)
            .build();

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

    ParkingTickets ticket = useCase.execute(command);

    assertThat(ticket).isNotNull();
    assertThat(ticket.getSlotSnapshot()).isNotNull();
    assertThat(ticket.getSlotSnapshot()).isEqualTo(SlotSnapshot.from(mockSlot));
    assertThat(ticket.getSlotSnapshot().hasCharger()).isTrue();
    assertThat(ticket.getSlotSnapshot().isAccessible()).isTrue();
    assertThat(ticket.getSlotSnapshot().slotNumber()).isEqualTo("A-01");
  }
}
