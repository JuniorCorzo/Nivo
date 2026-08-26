package dev.angelcorzo.nivo.jpa.rates;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

import dev.angelcorzo.nivo.jpa.rates.mapper.RatesMapper;
import dev.angelcorzo.nivo.model.rates.Rates;
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

    when(repository.findAllByParking_Id(parkingId)).thenReturn(List.of(data));
    when(mapper.toEntity(data)).thenReturn(entity);

    List<Rates> result = adapter.findAllByParkingLotId(parkingId);

    assertThat(result).hasSize(1);
    verify(repository).findAllByParking_Id(parkingId);
  }

  @Test
  @DisplayName("Should delete rate by ID")
  void shouldDeleteById() {
    UUID id = UUID.randomUUID();

    adapter.deleteById(id);

    verify(repository).deleteById(id);
  }
}
