package dev.angelcorzo.nivo.jpa.parkingtickets;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

import dev.angelcorzo.nivo.jpa.parkingtickets.mappers.ParkingTicketMapper;
import dev.angelcorzo.nivo.jpa.slot.SlotsData;
import dev.angelcorzo.nivo.model.parkingtickets.ParkingTickets;
import dev.angelcorzo.nivo.model.parkingtickets.enums.ParkingTicketStatus;
import dev.angelcorzo.nivo.model.slots.enums.SlotStatus;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

@DisplayName("ParkingTicketsAdapter Unit Tests")
class ParkingTicketsAdapterTest {

  private ParkingTicketsRepositoryData repository;
  private ParkingTicketMapper mapper;
  private ParkingTicketsAdapter adapter;

  @BeforeEach
  void setUp() {
    repository = mock(ParkingTicketsRepositoryData.class);
    mapper = mock(ParkingTicketMapper.class);
    adapter = new ParkingTicketsAdapter(repository, mapper);
  }

  @Test
  @DisplayName("Should find parking ticket by tenant ID and ID")
  void shouldFindByTenantIdAndId() {
    UUID tenantId = UUID.randomUUID();
    UUID ticketId = UUID.randomUUID();
    ParkingTicketsData data = new ParkingTicketsData();
    ParkingTickets entity = ParkingTickets.builder().id(ticketId).build();

    when(repository.findByTenant_IdAndId(tenantId, ticketId)).thenReturn(Optional.of(data));
    when(mapper.toEntity(data)).thenReturn(entity);

    Optional<ParkingTickets> result = adapter.findByTenantIdAndId(tenantId, ticketId);

    assertThat(result).isPresent();
    assertThat(result.get().getId()).isEqualTo(ticketId);
  }

  @Test
  @DisplayName("Should prepare checkout and return updated ticket")
  void shouldPrepareCheckout() {
    UUID ticketId = UUID.randomUUID();
    BigDecimal amount = BigDecimal.valueOf(15000);
    ParkingTicketsData data = new ParkingTicketsData();
    ParkingTickets entity = ParkingTickets.builder().id(ticketId).build();

    when(repository.findById(ticketId)).thenReturn(Optional.of(data));
    when(mapper.toEntity(data)).thenReturn(entity);

    ParkingTickets result = adapter.prepareCheckout(ticketId, amount);

    assertThat(result).isNotNull();
    verify(repository).prepareCheckout(ticketId, amount);
  }

  @Test
  @DisplayName("Should change ticket status")
  void shouldChangeStatus() {
    UUID ticketId = UUID.randomUUID();
    ParkingTicketsData data = new ParkingTicketsData();
    ParkingTickets entity = ParkingTickets.builder().id(ticketId).status(ParkingTicketStatus.CLOSED).build();

    when(repository.findById(ticketId)).thenReturn(Optional.of(data));
    when(mapper.toEntity(data)).thenReturn(entity);

    ParkingTickets result = adapter.changeStatus(ticketId, ParkingTicketStatus.CLOSED);

    assertThat(result).isNotNull();
    verify(repository).changeStatus(ticketId, ParkingTicketStatus.CLOSED);
  }

  @Test
  @DisplayName("Should close ticket")
  void shouldCloseTicket() {
    UUID ticketId = UUID.randomUUID();
    ParkingTicketsData data = new ParkingTicketsData();
    SlotsData slotData = new SlotsData();
    slotData.setStatus(SlotStatus.OCCUPIED);
    data.setSlot(slotData);

    ParkingTickets entity = ParkingTickets.builder().id(ticketId).status(ParkingTicketStatus.CLOSED).build();

    when(repository.findById(ticketId)).thenReturn(Optional.of(data));
    when(repository.save(data)).thenReturn(data);
    when(mapper.toEntity(data)).thenReturn(entity);

    ParkingTickets result = adapter.closeTicket(ticketId);

    assertThat(result).isNotNull();
    assertThat(data.getStatus()).isEqualTo(ParkingTicketStatus.CLOSED);
    assertThat(data.getClosedAt()).isNotNull();
    assertThat(slotData.getStatus()).isEqualTo(SlotStatus.AVAILABLE);
    verify(repository).save(data);
  }

  @Test
  @DisplayName("Should return null when closing non-existing ticket")
  void shouldReturnNullWhenClosingNonExistingTicket() {
    UUID ticketId = UUID.randomUUID();

    when(repository.findById(ticketId)).thenReturn(Optional.empty());

    ParkingTickets result = adapter.closeTicket(ticketId);

    assertThat(result).isNull();
    verify(repository, never()).save(any());
  }

  @Test
  @DisplayName("Should find all tickets by parking lot ID")
  void shouldFindAllByParkingLotId() {
    UUID parkingLotId = UUID.randomUUID();
    ParkingTicketsData data = new ParkingTicketsData();
    ParkingTickets entity = ParkingTickets.builder().id(UUID.randomUUID()).build();

    when(repository.findAllBySlot_Parking_Id(parkingLotId)).thenReturn(List.of(data));
    when(mapper.toEntity(data)).thenReturn(entity);

    List<ParkingTickets> result = adapter.findAllByParkingLotId(parkingLotId);

    assertThat(result).hasSize(1).containsExactly(entity);
    verify(repository).findAllBySlot_Parking_Id(parkingLotId);
  }

  @Test
  @DisplayName("Should find active ticket by slot ID")
  void shouldFindActiveBySlotId() {
    UUID slotId = UUID.randomUUID();
    ParkingTicketsData data = new ParkingTicketsData();
    ParkingTickets entity = ParkingTickets.builder().id(UUID.randomUUID()).status(ParkingTicketStatus.OPEN).build();

    when(repository.findActiveBySlotId(slotId)).thenReturn(Optional.of(data));
    when(mapper.toEntity(data)).thenReturn(entity);

    Optional<ParkingTickets> result = adapter.findActiveBySlotId(slotId);

    assertThat(result).isPresent();
    assertThat(result.get().getId()).isEqualTo(entity.getId());
    verify(repository).findActiveBySlotId(slotId);
  }
}
