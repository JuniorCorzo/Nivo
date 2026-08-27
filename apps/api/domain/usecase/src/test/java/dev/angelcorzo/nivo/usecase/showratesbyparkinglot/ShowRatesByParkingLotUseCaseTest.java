package dev.angelcorzo.nivo.usecase.showratesbyparkinglot;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

import dev.angelcorzo.nivo.model.rates.Rates;
import dev.angelcorzo.nivo.model.rates.gateways.RatesRepository;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

@DisplayName("ShowRatesByParkingLotUseCase Tests")
class ShowRatesByParkingLotUseCaseTest {

  private RatesRepository ratesRepository;
  private ShowRatesByParkingLotUseCase useCase;

  @BeforeEach
  void setUp() {
    ratesRepository = mock(RatesRepository.class);
    useCase = new ShowRatesByParkingLotUseCase(ratesRepository);
  }

  @Test
  @DisplayName("Should return rates for parking lot")
  void shouldReturnRatesForParkingLot() {
    UUID parkingId = UUID.randomUUID();
    Rates rate = Rates.builder().id(UUID.randomUUID()).name("Standard").build();

    when(ratesRepository.findAllByParkingLotId(parkingId)).thenReturn(List.of(rate));

    List<Rates> result = useCase.execute(parkingId);

    assertThat(result).hasSize(1);
    assertThat(result.get(0).getName()).isEqualTo("Standard");
    verify(ratesRepository).findAllByParkingLotId(parkingId);
  }
}
