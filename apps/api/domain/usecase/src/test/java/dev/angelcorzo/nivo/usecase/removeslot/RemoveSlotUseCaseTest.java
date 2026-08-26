package dev.angelcorzo.nivo.usecase.removeslot;

import static org.mockito.Mockito.*;

import dev.angelcorzo.nivo.model.parkinglots.gateways.ParkingLotsRepository;
import dev.angelcorzo.nivo.model.slots.gateways.SlotsRepository;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

@DisplayName("RemoveSlotUseCase Tests")
class RemoveSlotUseCaseTest {

  private SlotsRepository slotsRepository;
  private ParkingLotsRepository parkingLotsRepository;
  private RemoveSlotUseCase useCase;

  @BeforeEach
  void setUp() {
    slotsRepository = mock(SlotsRepository.class);
    parkingLotsRepository = mock(ParkingLotsRepository.class);
    useCase = new RemoveSlotUseCase(slotsRepository, parkingLotsRepository);
  }

  @Test
  @DisplayName("Should delete slot by ID")
  void shouldDeleteSlotById() {
    UUID slotId = UUID.randomUUID();

    useCase.execute(slotId);

    verify(slotsRepository).deleteById(slotId);
  }
}
