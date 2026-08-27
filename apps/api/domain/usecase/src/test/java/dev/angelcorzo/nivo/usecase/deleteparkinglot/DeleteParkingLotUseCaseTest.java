package dev.angelcorzo.nivo.usecase.deleteparkinglot;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

import dev.angelcorzo.nivo.model.parkinglots.ParkingLots;
import dev.angelcorzo.nivo.model.parkinglots.exceptions.ParkingNotExistsException;
import dev.angelcorzo.nivo.model.parkinglots.gateways.ParkingLotsRepository;
import dev.angelcorzo.nivo.model.slots.gateways.SlotsRepository;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

@DisplayName("DeleteParkingLotUseCase Tests")
class DeleteParkingLotUseCaseTest {

  private ParkingLotsRepository parkingLotsRepository;
  private SlotsRepository slotsRepository;
  private DeleteParkingLotUseCase useCase;

  @BeforeEach
  void setUp() {
    parkingLotsRepository = mock(ParkingLotsRepository.class);
    slotsRepository = mock(SlotsRepository.class);
    useCase = new DeleteParkingLotUseCase(parkingLotsRepository, slotsRepository);
  }

  @Test
  @DisplayName("Should delete parking lot and soft-delete its slots")
  void shouldDeleteParkingLotSuccessfully() {
    UUID parkingId = UUID.randomUUID();
    ParkingLots parkingLot = ParkingLots.builder().id(parkingId).name("Lot A").build();

    when(parkingLotsRepository.findById(parkingId)).thenReturn(Optional.of(parkingLot));

    useCase.execute(parkingId);

    verify(slotsRepository).softDeleteByParkingLotsId(parkingId);
    verify(parkingLotsRepository).delete(parkingLot);
  }

  @Test
  @DisplayName("Should throw ParkingNotExistsException when parking lot is not found")
  void shouldThrowWhenNotFound() {
    UUID parkingId = UUID.randomUUID();
    when(parkingLotsRepository.findById(parkingId)).thenReturn(Optional.empty());

    assertThatThrownBy(() -> useCase.execute(parkingId))
        .isInstanceOf(ParkingNotExistsException.class);
  }
}
