package dev.angelcorzo.nivo.domain.usecase.slot;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.*;

import dev.angelcorzo.nivo.domain.model.authentication.gateway.AuthenticationContextGateway;
import dev.angelcorzo.nivo.domain.model.slots.Slots;
import dev.angelcorzo.nivo.domain.model.slots.enums.SlotStatus;
import dev.angelcorzo.nivo.domain.model.slots.excetions.SlotCannotBeModifiedException;
import dev.angelcorzo.nivo.domain.model.slots.gateways.SlotsRepository;
import dev.angelcorzo.nivo.domain.model.tenants.Tenants;
import dev.angelcorzo.nivo.domain.model.tenants.valueobject.TenantReference;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

@DisplayName("UpdateSlotGroupUseCase Unit Tests")
class UpdateSlotGroupUseCaseTest {

  private SlotsRepository slotsRepository;
  private AuthenticationContextGateway authenticationContext;
  private UpdateSlotGroupUseCase useCase;
  private Tenants tenant;

  @BeforeEach
  void setUp() {
    slotsRepository = mock(SlotsRepository.class);
    authenticationContext = mock(AuthenticationContextGateway.class);
    useCase = new UpdateSlotGroupUseCase(slotsRepository, authenticationContext);

    tenant = Tenants.builder().id(UUID.randomUUID()).companyName("Central Parking").build();
    when(authenticationContext.getCurrentTenant()).thenReturn(tenant);
  }

  @Test
  @DisplayName("Should rename group when all slots available")
  void shouldRenameGroupWhenAllSlotsAvailable() {
    UUID parkingId = UUID.randomUUID();
    UUID slot1Id = UUID.randomUUID();
    UUID slot2Id = UUID.randomUUID();
    UUID slot3Id = UUID.randomUUID();

    Slots slot1 =
        Slots.builder()
            .id(slot1Id)
            .tenant(TenantReference.of(tenant))
            .zone("Zone-1")
            .prefix("A")
            .slotNumber("A-01")
            .status(SlotStatus.AVAILABLE)
            .build();

    Slots slot2 =
        Slots.builder()
            .id(slot2Id)
            .tenant(TenantReference.of(tenant))
            .zone("Zone-1")
            .prefix("A")
            .slotNumber("A-02")
            .status(SlotStatus.AVAILABLE)
            .build();

    Slots nonMatchingSlot =
        Slots.builder()
            .id(slot3Id)
            .tenant(TenantReference.of(tenant))
            .zone("Zone-2")
            .prefix("B")
            .slotNumber("B-01")
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

    when(slotsRepository.findAllByParkingLotsId(parkingId))
        .thenReturn(List.of(slot1, slot2, nonMatchingSlot));
    when(slotsRepository.saveAll(anyList())).thenAnswer(inv -> inv.getArgument(0));

    List<Slots> result = useCase.execute(command);

    assertThat(result).hasSize(2);
    assertThat(result).allMatch(s -> s.getZone().equals("Zone-3") && s.getPrefix().equals("C"));
    assertThat(result.stream().map(Slots::getSlotNumber).toList())
        .containsExactlyInAnyOrder("C-01", "C-02");
    verify(slotsRepository).saveAll(anyList());
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
            .tenant(TenantReference.of(tenant))
            .zone("Zone-1")
            .prefix("A")
            .slotNumber("A-01")
            .status(SlotStatus.AVAILABLE)
            .build();

    Slots occupiedSlot =
        Slots.builder()
            .id(slot2Id)
            .tenant(TenantReference.of(tenant))
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

    when(slotsRepository.findAllByParkingLotsId(parkingId))
        .thenReturn(List.of(availableSlot, occupiedSlot));

    assertThatThrownBy(() -> useCase.execute(command))
        .isInstanceOf(SlotCannotBeModifiedException.class)
        .satisfies(ex -> {
          SlotCannotBeModifiedException slotEx = (SlotCannotBeModifiedException) ex;
          assertThat(slotEx.getConflictingSlotIds()).containsExactly(slot2Id);
        });

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
            .tenant(TenantReference.of(tenant))
            .zone("Zone-1")
            .prefix("A")
            .slotNumber("A-01")
            .status(SlotStatus.AVAILABLE)
            .build();

    Slots slot2 =
        Slots.builder()
            .id(slot2Id)
            .tenant(TenantReference.of(tenant))
            .zone("Zone-1")
            .prefix("A")
            .slotNumber("A02")
            .status(SlotStatus.AVAILABLE)
            .build();

    Slots slot3 =
        Slots.builder()
            .id(slot3Id)
            .tenant(TenantReference.of(tenant))
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

    when(slotsRepository.findAllByParkingLotsId(parkingId))
        .thenReturn(List.of(slot1, slot2, slot3));
    when(slotsRepository.saveAll(anyList())).thenAnswer(inv -> inv.getArgument(0));

    List<Slots> result = useCase.execute(command);

    assertThat(result).hasSize(3);
    assertThat(result).allMatch(s -> s.getPrefix().equals("VIP"));
    assertThat(result.get(0).getSlotNumber()).isEqualTo("VIP-01");
    assertThat(result.get(1).getSlotNumber()).isEqualTo("VIP02");
    assertThat(result.get(2).getSlotNumber()).isEqualTo("VIP-03");
    verify(slotsRepository).saveAll(anyList());
  }
}
