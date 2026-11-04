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

@DisplayName("RatesRepositoryAdapter Pure JPA Unit Tests")
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
    final UUID parkingId = UUID.randomUUID();
    final RateData data = new RateData();
    final Rates entity = Rates.builder().id(UUID.randomUUID()).build();

    when(repository.findAllActiveByParkingId(parkingId)).thenReturn(List.of(data));
    when(mapper.toEntity(data)).thenReturn(entity);

    final List<Rates> result = adapter.findAllByParkingLotId(parkingId);

    assertThat(result).hasSize(1).containsExactly(entity);
    verify(repository).findAllActiveByParkingId(parkingId);
  }

  @Test
  @DisplayName("Should get reference by ID")
  void shouldGetReferenceById() {
    final UUID id = UUID.randomUUID();
    final RateData data = new RateData();
    final Rates entity = Rates.builder().id(id).build();

    when(repository.getReferenceById(id)).thenReturn(data);
    when(mapper.toEntity(data)).thenReturn(entity);

    final Rates result = adapter.getReferenceById(id);

    assertThat(result).isEqualTo(entity);
    verify(repository).getReferenceById(id);
  }

  @Test
  @DisplayName("Should check existence by ID")
  void shouldCheckExistsById() {
    final UUID id = UUID.randomUUID();
    when(repository.existsById(id)).thenReturn(true);

    assertThat(adapter.existsById(id)).isTrue();
    verify(repository).existsById(id);
  }

  @Test
  @DisplayName("Should delete by ID")
  void shouldDeleteById() {
    final UUID id = UUID.randomUUID();

    adapter.deleteById(id);

    verify(repository).deleteById(id);
  }

  @Test
  @DisplayName("Should check active tickets")
  void shouldCheckActiveTickets() {
    final UUID rateId = UUID.randomUUID();
    when(repository.hasActiveTickets(rateId)).thenReturn(true);

    assertThat(adapter.hasActiveTickets(rateId)).isTrue();
    verify(repository).hasActiveTickets(rateId);
  }
}
