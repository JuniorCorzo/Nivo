package dev.angelcorzo.nivo.infrastructure.adapter.cache.publicapi;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

import dev.angelcorzo.nivo.domain.usecase.dashboard.GetPublicParkingAvailabilityUseCase;
import dev.angelcorzo.nivo.domain.usecase.dashboard.dtos.PublicParkingAvailabilityDTO;
import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

@DisplayName("PublicAvailabilityCacheService Unit Tests")
class PublicAvailabilityCacheServiceTest {

  @Test
  @DisplayName("Should delegate getAvailability to use case")
  void shouldDelegateToUseCase() {
    final GetPublicParkingAvailabilityUseCase useCase = mock(GetPublicParkingAvailabilityUseCase.class);
    final PublicAvailabilityCacheService service = new PublicAvailabilityCacheService(useCase);

    final UUID parkingId = UUID.randomUUID();
    final PublicParkingAvailabilityDTO dto = PublicParkingAvailabilityDTO.builder()
      .parkingId(parkingId)
      .parkingName("Central Parking")
      .totalSlots(50)
      .availableSlots(20)
      .occupiedSlots(30)
      .timestamp(OffsetDateTime.now())
      .build();

    when(useCase.execute(parkingId)).thenReturn(Optional.of(dto));

    final Optional<PublicParkingAvailabilityDTO> result = service.getAvailability(parkingId);

    assertThat(result).isPresent().contains(dto);
    verify(useCase).execute(parkingId);
  }
}
