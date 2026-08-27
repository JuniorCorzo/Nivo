package dev.angelcorzo.nivo.jpa.parkingtickets;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

import dev.angelcorzo.nivo.jpa.parkingtickets.mappers.ParkingTicketMapper;
import dev.angelcorzo.nivo.model.parkingtickets.ParkingTickets;
import dev.angelcorzo.nivo.model.parkingtickets.enums.ParkingTicketStatus;
import java.math.BigDecimal;
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
    ParkingTickets entity = ParkingTickets.builder().id(ticketId).status(ParkingTicketStatus.CLOSED).build();

    when(repository.findById(ticketId)).thenReturn(Optional.of(data));
    when(mapper.toEntity(data)).thenReturn(entity);

    ParkingTickets result = adapter.closeTicket(ticketId);

    assertThat(result).isNotNull();
    verify(repository).closeTicket(ticketId);
  }
}
