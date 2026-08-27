package dev.angelcorzo.nivo.usecase.deleterate;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;

import dev.angelcorzo.nivo.model.rates.gateways.RatesRepository;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

@DisplayName("DeleteRateUseCase Tests")
class DeleteRateUseCaseTest {

  private RatesRepository ratesRepository;
  private DeleteRateUseCase useCase;

  @BeforeEach
  void setUp() {
    ratesRepository = mock(RatesRepository.class);
    useCase = new DeleteRateUseCase(ratesRepository);
  }

  @Test
  @DisplayName("Should delete rate by ID")
  void shouldDeleteRateById() {
    UUID rateId = UUID.randomUUID();

    useCase.execute(rateId);

    verify(ratesRepository).deleteById(rateId);
  }
}
