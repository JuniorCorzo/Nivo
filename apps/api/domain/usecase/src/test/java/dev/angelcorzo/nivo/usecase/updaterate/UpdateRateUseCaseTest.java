package dev.angelcorzo.nivo.usecase.updaterate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import dev.angelcorzo.nivo.model.rates.Rates;
import dev.angelcorzo.nivo.model.rates.enums.TimeUnitsRate;
import dev.angelcorzo.nivo.model.rates.enums.VehicleType;
import dev.angelcorzo.nivo.model.rates.exceptions.RateNotFoundException;
import dev.angelcorzo.nivo.model.rates.gateways.RatesRepository;
import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

@DisplayName("UpdateRateUseCase Tests")
class UpdateRateUseCaseTest {

  private RatesRepository ratesRepository;
  private UpdateRateUseCase useCase;

  @BeforeEach
  void setUp() {
    ratesRepository = mock(RatesRepository.class);
    useCase = new UpdateRateUseCase(ratesRepository);
  }

  @Test
  @DisplayName("Should successfully update existing rate")
  void shouldUpdateRateSuccessfully() {
    UUID rateId = UUID.randomUUID();
    UpdateRateUseCase.UpdateRate command =
        new UpdateRateUseCase.UpdateRate(
            rateId, "New Name", "New Desc", BigDecimal.valueOf(6000), TimeUnitsRate.HOURS, "30", VehicleType.CAR);

    Rates existing =
        Rates.builder()
            .id(rateId)
            .name("Old Name")
            .pricePerUnit(BigDecimal.valueOf(5000))
            .build();

    when(ratesRepository.findById(rateId)).thenReturn(Optional.of(existing));
    when(ratesRepository.save(any(Rates.class))).thenAnswer(i -> i.getArgument(0));

    Rates updated = useCase.execute(command);

    assertThat(updated).isNotNull();
    assertThat(updated.getName()).isEqualTo("New Name");
    assertThat(updated.getPricePerUnit()).isEqualTo(BigDecimal.valueOf(6000));
    verify(ratesRepository).save(any(Rates.class));
  }

  @Test
  @DisplayName("Should throw RateNotFoundException when rate does not exist")
  void shouldThrowWhenRateNotFound() {
    UUID rateId = UUID.randomUUID();
    UpdateRateUseCase.UpdateRate command =
        new UpdateRateUseCase.UpdateRate(
            rateId, "New Name", "New Desc", BigDecimal.valueOf(6000), TimeUnitsRate.HOURS, "30", VehicleType.CAR);

    when(ratesRepository.findById(rateId)).thenReturn(Optional.empty());

    assertThatThrownBy(() -> useCase.execute(command))
        .isInstanceOf(RateNotFoundException.class);
  }
}
