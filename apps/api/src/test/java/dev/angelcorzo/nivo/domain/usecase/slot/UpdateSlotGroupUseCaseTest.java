package dev.angelcorzo.nivo.domain.usecase.slot;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.*;

import dev.angelcorzo.nivo.domain.model.slots.Slots;
import dev.angelcorzo.nivo.domain.model.slots.enums.SlotStatus;
import dev.angelcorzo.nivo.domain.model.slots.excetions.SlotCannotBeModifiedException;
import dev.angelcorzo.nivo.domain.model.slots.gateways.SlotsRepository;
import java.util.Collections;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

@DisplayName("UpdateSlotGroupUseCase Unit Tests")
class UpdateSlotGroupUseCaseTest {

  private SlotsRepository slotsRepository;
  private BatchPersistSlotsUseCase batchPersistSlotsUseCase;
  private UpdateSlotGroupUseCase useCase;

  @BeforeEach
  void setUp() {
    slotsRepository = mock(SlotsRepository.class);
    batchPersistSlotsUseCase = mock(BatchPersistSlotsUseCase.class);
    useCase = new UpdateSlotGroupUseCase(slotsRepository, batchPersistSlotsUseCase);
  }

  @Test
  @DisplayName("Should rename group when all slots available")
  void shouldRenameGroupWhenAllSlotsAvailable() {
    UUID parkingId = UUID.randomUUID();
    UUID slot1Id = UUID.randomUUID();
    UUID slot2Id = UUID.randomUUID();

    Slots slot1 =
        Slots.builder()
            .id(slot1Id)
            .zone("Zone-1")
            .prefix("A")
            .slotNumber("A-01")
            .status(SlotStatus.AVAILABLE)
            .build();

    Slots slot2 =
        Slots.builder()
            .id(slot2Id)
            .zone("Zone-1")
            .prefix("A")
            .slotNumber("A-02")
            .status(SlotStatus.AVAILABLE)
            .build();

    UpdateSlotGroupUseCase.UpdateSlotGroupCommand command =
        UpdateSlotGroupUseCase.UpdateSlotGroupCommand.builder()
            .parkingId(parkingId)
            .currentZone("Zone-1")
            .currentPrefix("A")
            .newZone("Zone-3")
            .newPrefix("C")
            .build();

    when(slotsRepository.findAllByParkingLotsIdAndZoneAndPrefix(parkingId, "Zone-1", "A"))
        .thenReturn(List.of(slot1, slot2));
    when(batchPersistSlotsUseCase.execute(anyList())).thenAnswer(inv -> inv.getArgument(0));

    List<Slots> result = useCase.execute(command);

    assertThat(result).hasSize(2);
    assertThat(result).allMatch(s -> s.getZone().equals("Zone-3") && s.getPrefix().equals("C"));
    assertThat(result.stream().map(Slots::getSlotNumber).toList())
        .containsExactlyInAnyOrder("C-01", "C-02");
    verify(batchPersistSlotsUseCase).execute(anyList());
    verify(slotsRepository, never()).saveAll(anyList());
  }

  @Test
  @DisplayName("Should return empty list when no slots match group")
  void shouldReturnEmptyListWhenNoSlotsMatchGroup() {
    UUID parkingId = UUID.randomUUID();

    UpdateSlotGroupUseCase.UpdateSlotGroupCommand command =
        UpdateSlotGroupUseCase.UpdateSlotGroupCommand.builder()
            .parkingId(parkingId)
            .currentZone("Zone-1")
            .currentPrefix("A")
            .newZone("Zone-3")
            .newPrefix("C")
            .build();

    when(slotsRepository.findAllByParkingLotsIdAndZoneAndPrefix(parkingId, "Zone-1", "A"))
        .thenReturn(Collections.emptyList());

    List<Slots> result = useCase.execute(command);

    assertThat(result).isEmpty();
    verify(batchPersistSlotsUseCase, never()).execute(anyList());
  }

  @Test
  @DisplayName("Should fail when any group slot is occupied")
  void shouldFailWhenAnyGroupSlotOccupied() {
    UUID parkingId = UUID.randomUUID();
    UUID slot1Id = UUID.randomUUID();
    UUID slot2Id = UUID.randomUUID();

    Slots availableSlot =
        Slots.builder()
            .id(slot1Id)
            .zone("Zone-1")
            .prefix("A")
            .slotNumber("A-01")
            .status(SlotStatus.AVAILABLE)
            .build();

    Slots occupiedSlot =
        Slots.builder()
            .id(slot2Id)
            .zone("Zone-1")
            .prefix("A")
            .slotNumber("A-02")
            .status(SlotStatus.OCCUPIED)
            .build();

    UpdateSlotGroupUseCase.UpdateSlotGroupCommand command =
        UpdateSlotGroupUseCase.UpdateSlotGroupCommand.builder()
            .parkingId(parkingId)
            .currentZone("Zone-1")
            .currentPrefix("A")
            .newZone("Zone-2")
            .newPrefix("B")
            .build();

    when(slotsRepository.findAllByParkingLotsIdAndZoneAndPrefix(parkingId, "Zone-1", "A"))
        .thenReturn(List.of(availableSlot, occupiedSlot));

    assertThatThrownBy(() -> useCase.execute(command))
        .isInstanceOf(SlotCannotBeModifiedException.class)
        .satisfies(ex -> {
          SlotCannotBeModifiedException slotEx = (SlotCannotBeModifiedException) ex;
          assertThat(slotEx.getConflictingSlotIds()).containsExactly(slot2Id);
        });

    verify(batchPersistSlotsUseCase, never()).execute(anyList());
    verify(slotsRepository, never()).saveAll(anyList());
    verify(slotsRepository, never()).save(any());
  }

  @Test
  @DisplayName("Should recalculate slot number when prefix changes")
  void shouldRecalculateSlotNumberWhenPrefixChanges() {
    UUID parkingId = UUID.randomUUID();
    UUID slot1Id = UUID.randomUUID();
    UUID slot2Id = UUID.randomUUID();
    UUID slot3Id = UUID.randomUUID();

    Slots slot1 =
        Slots.builder()
            .id(slot1Id)
            .zone("Zone-1")
            .prefix("A")
            .slotNumber("A-01")
            .status(SlotStatus.AVAILABLE)
            .build();

    Slots slot2 =
        Slots.builder()
            .id(slot2Id)
            .zone("Zone-1")
            .prefix("A")
            .slotNumber("A02")
            .status(SlotStatus.AVAILABLE)
            .build();

    Slots slot3 =
        Slots.builder()
            .id(slot3Id)
            .zone("Zone-1")
            .prefix("A")
            .slotNumber("03")
            .status(SlotStatus.AVAILABLE)
            .build();

    UpdateSlotGroupUseCase.UpdateSlotGroupCommand command =
        UpdateSlotGroupUseCase.UpdateSlotGroupCommand.builder()
            .parkingId(parkingId)
            .currentZone("Zone-1")
            .currentPrefix("A")
            .newZone("Zone-1")
            .newPrefix("VIP")
            .build();

    when(slotsRepository.findAllByParkingLotsIdAndZoneAndPrefix(parkingId, "Zone-1", "A"))
        .thenReturn(List.of(slot1, slot2, slot3));
    when(batchPersistSlotsUseCase.execute(anyList())).thenAnswer(inv -> inv.getArgument(0));

    List<Slots> result = useCase.execute(command);

    assertThat(result).hasSize(3);
    assertThat(result).allMatch(s -> s.getPrefix().equals("VIP"));
    assertThat(result.get(0).getSlotNumber()).isEqualTo("VIP-01");
    assertThat(result.get(1).getSlotNumber()).isEqualTo("VIP02");
    assertThat(result.get(2).getSlotNumber()).isEqualTo("VIP-03");
    verify(batchPersistSlotsUseCase).execute(anyList());
    verify(slotsRepository, never()).saveAll(anyList());
  }

  @Test
  @DisplayName("Should test UpdateSlotGroupCommand resolution methods")
  void shouldTestCommandResolutionMethods() {
    UpdateSlotGroupUseCase.UpdateSlotGroupCommand cmdWithNew =
        UpdateSlotGroupUseCase.UpdateSlotGroupCommand.builder()
            .currentZone("Z1")
            .currentPrefix("P1")
            .newZone("Z2")
            .newPrefix("P2")
            .build();

    assertThat(cmdWithNew.resolveTargetZone()).isEqualTo("Z2");
    assertThat(cmdWithNew.resolveTargetPrefix()).isEqualTo("P2");
    assertThat(cmdWithNew.isPrefixChanged()).isTrue();

    UpdateSlotGroupUseCase.UpdateSlotGroupCommand cmdWithoutNew =
        UpdateSlotGroupUseCase.UpdateSlotGroupCommand.builder()
            .currentZone("Z1")
            .currentPrefix("P1")
            .build();

    assertThat(cmdWithoutNew.resolveTargetZone()).isEqualTo("Z1");
    assertThat(cmdWithoutNew.resolveTargetPrefix()).isEqualTo("P1");
    assertThat(cmdWithoutNew.isPrefixChanged()).isFalse();

    UpdateSlotGroupUseCase.UpdateSlotGroupCommand cmdSamePrefix =
        UpdateSlotGroupUseCase.UpdateSlotGroupCommand.builder()
            .currentZone("Z1")
            .currentPrefix("P1")
            .newZone("Z2")
            .newPrefix("P1")
            .build();

    assertThat(cmdSamePrefix.resolveTargetZone()).isEqualTo("Z2");
    assertThat(cmdSamePrefix.resolveTargetPrefix()).isEqualTo("P1");
    assertThat(cmdSamePrefix.isPrefixChanged()).isFalse();

    UpdateSlotGroupUseCase.UpdateSlotGroupCommand cmdEmptyNew =
        UpdateSlotGroupUseCase.UpdateSlotGroupCommand.builder()
            .currentZone("Z1")
            .currentPrefix("P1")
            .newZone("")
            .newPrefix("")
            .build();

    assertThat(cmdEmptyNew.resolveTargetZone()).isNull();
    assertThat(cmdEmptyNew.resolveTargetPrefix()).isNull();
    assertThat(cmdEmptyNew.isPrefixChanged()).isTrue();

    UpdateSlotGroupUseCase.UpdateSlotGroupCommand cmdBothEmpty =
        UpdateSlotGroupUseCase.UpdateSlotGroupCommand.builder()
            .currentZone("")
            .currentPrefix("")
            .newZone("")
            .newPrefix("")
            .build();

    assertThat(cmdBothEmpty.isPrefixChanged()).isFalse();

    UpdateSlotGroupUseCase.UpdateSlotGroupCommand cmdNullCurrentEmptyNew =
        UpdateSlotGroupUseCase.UpdateSlotGroupCommand.builder()
            .currentZone(null)
            .currentPrefix(null)
            .newZone("")
            .newPrefix("")
            .build();

    assertThat(cmdNullCurrentEmptyNew.isPrefixChanged()).isFalse();
  }

  @Test
  @DisplayName("Should update group when current prefix and zone are null or empty")
  void shouldUpdateGroupWhenCurrentPrefixAndZoneAreNullOrEmpty() {
    UUID parkingId = UUID.randomUUID();
    UUID slotId = UUID.randomUUID();

    Slots slot =
        Slots.builder()
            .id(slotId)
            .zone(null)
            .prefix(null)
            .slotNumber("01")
            .status(SlotStatus.AVAILABLE)
            .build();

    UpdateSlotGroupUseCase.UpdateSlotGroupCommand command =
        UpdateSlotGroupUseCase.UpdateSlotGroupCommand.builder()
            .parkingId(parkingId)
            .currentZone(null)
            .currentPrefix(null)
            .newZone("Zone-B")
            .newPrefix("B")
            .build();

    when(slotsRepository.findAllByParkingLotsIdAndZoneAndPrefix(parkingId, null, null))
        .thenReturn(List.of(slot));
    when(batchPersistSlotsUseCase.execute(anyList())).thenAnswer(inv -> inv.getArgument(0));

    List<Slots> result = useCase.execute(command);

    assertThat(result).hasSize(1);
    assertThat(result.get(0).getZone()).isEqualTo("Zone-B");
    assertThat(result.get(0).getPrefix()).isEqualTo("B");
    assertThat(result.get(0).getSlotNumber()).isEqualTo("B-01");
  }

  @Test
  @DisplayName("Should remove prefix and zone when new values are empty")
  void shouldRemovePrefixAndZoneWhenNewValuesAreEmpty() {
    UUID parkingId = UUID.randomUUID();
    UUID slotId = UUID.randomUUID();

    Slots slot =
        Slots.builder()
            .id(slotId)
            .zone("Zone-A")
            .prefix("A")
            .slotNumber("A-01")
            .status(SlotStatus.AVAILABLE)
            .build();

    UpdateSlotGroupUseCase.UpdateSlotGroupCommand command =
        UpdateSlotGroupUseCase.UpdateSlotGroupCommand.builder()
            .parkingId(parkingId)
            .currentZone("Zone-A")
            .currentPrefix("A")
            .newZone("")
            .newPrefix("")
            .build();

    when(slotsRepository.findAllByParkingLotsIdAndZoneAndPrefix(parkingId, "Zone-A", "A"))
        .thenReturn(List.of(slot));
    when(batchPersistSlotsUseCase.execute(anyList())).thenAnswer(inv -> inv.getArgument(0));

    List<Slots> result = useCase.execute(command);

    assertThat(result).hasSize(1);
    assertThat(result.get(0).getZone()).isNull();
    assertThat(result.get(0).getPrefix()).isNull();
    assertThat(result.get(0).getSlotNumber()).isEqualTo("01");
  }
}
