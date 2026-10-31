package dev.angelcorzo.nivo.infrastructure.adapter.jpa.rates;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

import dev.angelcorzo.nivo.domain.model.rates.Rates;
import dev.angelcorzo.nivo.infrastructure.adapter.jpa.rates.mapper.RatesMapper;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

@DisplayName("RatesRepositoryAdapter Unit Tests")
class RatesRepositoryAdapterTest {

  private RatesRepositoryData repository;
  private RatesMapper mapper;
  private RatesRepositoryAdapter adapter;

  @BeforeEach
  void setUp() {
    repository = mock(RatesRepositoryData.class);
    mapper = mock(RatesMapper.class);
    adapter = new RatesRepositoryAdapter(repository, mapper);
  }

  @Test
  @DisplayName("Should find all rates by parking lot ID")
  void shouldFindAllByParkingLotId() {
    UUID parkingId = UUID.randomUUID();
    RateData data = new RateData();
    Rates entity = Rates.builder().id(UUID.randomUUID()).build();

    when(repository.findAllActiveByParkingId(parkingId)).thenReturn(List.of(data));
    when(mapper.toEntity(data)).thenReturn(entity);

    List<Rates> result = adapter.findAllByParkingLotId(parkingId);

    assertThat(result).hasSize(1);
    verify(repository).findAllActiveByParkingId(parkingId);
  }

  @Test
  @DisplayName("Should check if rate has active tickets")
  void shouldCheckHasActiveTickets() {
    UUID rateId = UUID.randomUUID();
    when(repository.hasActiveTickets(rateId)).thenReturn(true);

    boolean result = adapter.hasActiveTickets(rateId);

    assertThat(result).isTrue();
    verify(repository).hasActiveTickets(rateId);
  }

  @Test
  @DisplayName("Should delete rate by ID")
  void shouldDeleteById() {
    UUID id = UUID.randomUUID();

    adapter.deleteById(id);

    verify(repository).deleteById(id);
  }
}
