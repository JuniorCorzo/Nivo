package dev.angelcorzo.nivo.infrastructure.adapter.jpa.parkingtickets;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

import dev.angelcorzo.nivo.domain.model.parkingtickets.ParkingTickets;
import dev.angelcorzo.nivo.domain.model.parkingtickets.enums.ParkingTicketStatus;
import dev.angelcorzo.nivo.domain.model.slots.enums.SlotStatus;
import dev.angelcorzo.nivo.infrastructure.adapter.jpa.parkingtickets.mappers.ParkingTicketMapper;
import dev.angelcorzo.nivo.infrastructure.adapter.jpa.slot.SlotsData;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

@DisplayName("ParkingTicketsAdapter Pure JPA Unit Tests")
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
    final UUID tenantId = UUID.randomUUID();
    final UUID id = UUID.randomUUID();
    final ParkingTicketsData data = new ParkingTicketsData();
    final ParkingTickets entity = ParkingTickets.builder().id(id).build();

    when(repository.findByTenant_IdAndId(tenantId, id)).thenReturn(Optional.of(data));
    when(mapper.toEntity(data)).thenReturn(entity);

    final Optional<ParkingTickets> result = adapter.findByTenantIdAndId(tenantId, id);

    assertThat(result).isPresent().contains(entity);
    verify(repository).findByTenant_IdAndId(tenantId, id);
  }

  @Test
  @DisplayName("Should close ticket and set slot AVAILABLE")
  void shouldCloseTicket() {
    final UUID ticketId = UUID.randomUUID();
    final ParkingTicketsData ticketData = new ParkingTicketsData();
    final SlotsData slotData = new SlotsData();
    slotData.setStatus(SlotStatus.OCCUPIED);
    ticketData.setSlot(slotData);

    final ParkingTickets closedEntity = ParkingTickets.builder()
      .id(ticketId)
      .status(ParkingTicketStatus.CLOSED)
      .build();

    when(repository.findById(ticketId)).thenReturn(Optional.of(ticketData));
    when(repository.save(ticketData)).thenReturn(ticketData);
    when(mapper.toEntity(ticketData)).thenReturn(closedEntity);

    final ParkingTickets result = adapter.closeTicket(ticketId);

    assertThat(result).isEqualTo(closedEntity);
    assertThat(ticketData.getStatus()).isEqualTo(ParkingTicketStatus.CLOSED);
    assertThat(slotData.getStatus()).isEqualTo(SlotStatus.AVAILABLE);
    verify(repository).save(ticketData);
  }

  @Test
  @DisplayName("Should return null when closing nonexistent ticket")
  void shouldReturnNullWhenTicketNotFound() {
    final UUID ticketId = UUID.randomUUID();
    when(repository.findById(ticketId)).thenReturn(Optional.empty());

    final ParkingTickets result = adapter.closeTicket(ticketId);

    assertThat(result).isNull();
  }

  @Test
  @DisplayName("Should prepare checkout")
  void shouldPrepareCheckout() {
    final UUID ticketId = UUID.randomUUID();
    final BigDecimal amount = new BigDecimal("15000.00");
    final ParkingTicketsData data = new ParkingTicketsData();
    final ParkingTickets entity = ParkingTickets.builder().id(ticketId).build();

    when(repository.findById(ticketId)).thenReturn(Optional.of(data));
    when(mapper.toEntity(data)).thenReturn(entity);

    final ParkingTickets result = adapter.prepareCheckout(ticketId, amount);

    assertThat(result).isEqualTo(entity);
    verify(repository).prepareCheckout(ticketId, amount);
  }

  @Test
  @DisplayName("Should find active ticket by slot ID")
  void shouldFindActiveTicketBySlotId() {
    final UUID slotId = UUID.randomUUID();
    final ParkingTicketsData data = new ParkingTicketsData();
    final ParkingTickets entity = ParkingTickets.builder().id(UUID.randomUUID()).build();

    when(repository.findActiveBySlotId(slotId)).thenReturn(Optional.of(data));
    when(mapper.toEntity(data)).thenReturn(entity);

    final Optional<ParkingTickets> result = adapter.findActiveBySlotId(slotId);

    assertThat(result).isPresent().contains(entity);
    verify(repository).findActiveBySlotId(slotId);
  }

  @Test
  @DisplayName("Should find all tickets by parking lot ID")
  void shouldFindAllByParkingLotId() {
    final UUID parkingLotId = UUID.randomUUID();
    final ParkingTicketsData data = new ParkingTicketsData();
    final ParkingTickets entity = ParkingTickets.builder().id(UUID.randomUUID()).build();

    when(repository.findAllBySlot_Parking_Id(parkingLotId)).thenReturn(List.of(data));
    when(mapper.toEntity(data)).thenReturn(entity);

    final List<ParkingTickets> result = adapter.findAllByParkingLotId(parkingLotId);

    assertThat(result).containsExactly(entity);
    verify(repository).findAllBySlot_Parking_Id(parkingLotId);
  }
}
