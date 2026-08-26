package dev.angelcorzo.nivo.usecase.deleteslotgroup;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

import dev.angelcorzo.nivo.model.parkinglots.exceptions.ParkingNotExistsException;
import dev.angelcorzo.nivo.model.parkinglots.gateways.ParkingLotsRepository;
import dev.angelcorzo.nivo.model.slots.Slots;
import dev.angelcorzo.nivo.model.slots.enums.SlotType;
import dev.angelcorzo.nivo.model.slots.gateways.SlotsRepository;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

@DisplayName("DeleteSlotGroupUseCase Tests")
class DeleteSlotGroupUseCaseTest {

  private SlotsRepository slotsRepository;
  private ParkingLotsRepository parkingLotsRepository;
  private DeleteSlotGroupUseCase useCase;

  @BeforeEach
  void setUp() {
    slotsRepository = mock(SlotsRepository.class);
    parkingLotsRepository = mock(ParkingLotsRepository.class);
    useCase = new DeleteSlotGroupUseCase(slotsRepository, parkingLotsRepository);
  }

  @Test
  @DisplayName("Should delete matching slots in group")
  void shouldDeleteMatchingSlots() {
    UUID parkingId = UUID.randomUUID();
    UUID slot1Id = UUID.randomUUID();
    UUID slot2Id = UUID.randomUUID();

    DeleteSlotGroupUseCase.DeleteSlotGroupCommand command =
        new DeleteSlotGroupUseCase.DeleteSlotGroupCommand(parkingId, SlotType.CAR, "A", "Zone-1");

    Slots matchingSlot =
        Slots.builder()
            .id(slot1Id)
            .type(SlotType.CAR)
            .prefix("A")
            .zone("Zone-1")
            .build();

    Slots nonMatchingSlot =
        Slots.builder()
            .id(slot2Id)
            .type(SlotType.MOTORCYCLE)
            .prefix("B")
            .zone("Zone-2")
            .build();

    when(parkingLotsRepository.existsById(parkingId)).thenReturn(true);
    when(slotsRepository.findAllByParkingLotsId(parkingId)).thenReturn(List.of(matchingSlot, nonMatchingSlot));

    useCase.execute(command);

    verify(slotsRepository).deleteById(slot1Id);
    verify(slotsRepository, never()).deleteById(slot2Id);
  }

  @Test
  @DisplayName("Should throw ParkingNotExistsException when parking does not exist")
  void shouldThrowWhenParkingNotExists() {
    UUID parkingId = UUID.randomUUID();
    DeleteSlotGroupUseCase.DeleteSlotGroupCommand command =
        new DeleteSlotGroupUseCase.DeleteSlotGroupCommand(parkingId, SlotType.CAR, "A", "Zone-1");

    when(parkingLotsRepository.existsById(parkingId)).thenReturn(false);

    assertThatThrownBy(() -> useCase.execute(command))
        .isInstanceOf(ParkingNotExistsException.class);
  }
}
