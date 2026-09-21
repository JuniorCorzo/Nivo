package dev.angelcorzo.nivo.domain.usecase.slot;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.*;

import dev.angelcorzo.nivo.domain.model.authentication.gateway.AuthenticationContextGateway;
import dev.angelcorzo.nivo.domain.model.slots.Slots;
import dev.angelcorzo.nivo.domain.model.slots.enums.SlotStatus;
import dev.angelcorzo.nivo.domain.model.slots.excetions.SlotCannotBeModifiedException;
import dev.angelcorzo.nivo.domain.model.slots.excetions.SlotNotFoundException;
import dev.angelcorzo.nivo.domain.model.slots.gateways.SlotsRepository;
import dev.angelcorzo.nivo.domain.model.tenants.Tenants;
import dev.angelcorzo.nivo.domain.model.tenants.valueobject.TenantReference;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

@DisplayName("UpdateSlotMetadataUseCase Unit Tests")
class UpdateSlotMetadataUseCaseTest {

  private SlotsRepository slotsRepository;
  private AuthenticationContextGateway authenticationContext;
  private BatchPersistSlotsUseCase batchPersistSlotsUseCase;
  private UpdateSlotMetadataUseCase useCase;
  private Tenants tenant;

  @BeforeEach
  void setUp() {
    slotsRepository = mock(SlotsRepository.class);
    authenticationContext = mock(AuthenticationContextGateway.class);
    batchPersistSlotsUseCase = mock(BatchPersistSlotsUseCase.class);
    useCase = new UpdateSlotMetadataUseCase(slotsRepository, authenticationContext, batchPersistSlotsUseCase);

    tenant = Tenants.builder().id(UUID.randomUUID()).companyName("Central Parking").build();
    when(authenticationContext.getCurrentTenant()).thenReturn(tenant);
  }

  @Test
  @DisplayName("Should update metadata when all slots are available")
  void shouldUpdateMetadataWhenAllSlotsAvailable() {
    UUID slot1Id = UUID.randomUUID();
    UUID slot2Id = UUID.randomUUID();

    Slots slot1 =
        Slots.builder()
            .id(slot1Id)
            .tenant(TenantReference.of(tenant))
            .status(SlotStatus.AVAILABLE)
            .hasCharger(false)
            .isAccessible(false)
            .isActive(true)
            .build();

    Slots slot2 =
        Slots.builder()
            .id(slot2Id)
            .tenant(TenantReference.of(tenant))
            .status(SlotStatus.AVAILABLE)
            .hasCharger(false)
            .isAccessible(false)
            .isActive(true)
            .build();

    UpdateSlotMetadataUseCase.UpdateSlotMetadataCommand command =
        UpdateSlotMetadataUseCase.UpdateSlotMetadataCommand.builder()
            .slotIds(List.of(slot1Id, slot2Id))
            .hasCharger(true)
            .isAccessible(true)
            .isActive(false)
            .build();

    when(slotsRepository.findAllByIdInAndTenantId(List.of(slot1Id, slot2Id), tenant.getId()))
        .thenReturn(List.of(slot1, slot2));
    when(batchPersistSlotsUseCase.execute(anyList()))
        .thenAnswer(inv -> inv.getArgument(0));

    List<Slots> updated = useCase.execute(command);

    assertThat(updated).hasSize(2);
    assertThat(updated).allMatch(s -> s.isHasCharger() && s.isAccessible() && !s.isActive());
    verify(batchPersistSlotsUseCase).execute(anyList());
    verify(slotsRepository, never()).saveAll(anyList());
  }

  @Test
  @DisplayName("Should fail atomically when any slot is occupied, persisting zero changes")
  void shouldFailAtomicallyWhenAnySlotOccupied() {
    UUID availableSlotId = UUID.randomUUID();
    UUID occupiedSlotId = UUID.randomUUID();

    Slots availableSlot =
        Slots.builder()
            .id(availableSlotId)
            .tenant(TenantReference.of(tenant))
            .status(SlotStatus.AVAILABLE)
            .hasCharger(false)
            .build();

    Slots occupiedSlot =
        Slots.builder()
            .id(occupiedSlotId)
            .tenant(TenantReference.of(tenant))
            .status(SlotStatus.OCCUPIED)
            .hasCharger(false)
            .build();

    UpdateSlotMetadataUseCase.UpdateSlotMetadataCommand command =
        UpdateSlotMetadataUseCase.UpdateSlotMetadataCommand.builder()
            .slotIds(List.of(availableSlotId, occupiedSlotId))
            .hasCharger(true)
            .build();

    when(slotsRepository.findAllByIdInAndTenantId(List.of(availableSlotId, occupiedSlotId), tenant.getId()))
        .thenReturn(List.of(availableSlot, occupiedSlot));

    assertThatThrownBy(() -> useCase.execute(command))
        .isInstanceOf(SlotCannotBeModifiedException.class)
        .satisfies(ex -> {
          SlotCannotBeModifiedException slotEx = (SlotCannotBeModifiedException) ex;
          assertThat(slotEx.getConflictingSlotIds()).containsExactly(occupiedSlotId);
        });

    verify(batchPersistSlotsUseCase, never()).execute(anyList());
    verify(slotsRepository, never()).saveAll(anyList());
    verify(slotsRepository, never()).save(any());
  }

  @Test
  @DisplayName("Should preserve existing values when fields are null")
  void shouldPreserveExistingValuesWhenFieldsNull() {
    UUID slotId = UUID.randomUUID();

    Slots slot =
        Slots.builder()
            .id(slotId)
            .tenant(TenantReference.of(tenant))
            .status(SlotStatus.AVAILABLE)
            .hasCharger(true)
            .isAccessible(false)
            .isActive(true)
            .build();

    UpdateSlotMetadataUseCase.UpdateSlotMetadataCommand command =
        UpdateSlotMetadataUseCase.UpdateSlotMetadataCommand.builder()
            .slotIds(List.of(slotId))
            .hasCharger(null)
            .isAccessible(true)
            .isActive(null)
            .build();

    when(slotsRepository.findAllByIdInAndTenantId(List.of(slotId), tenant.getId())).thenReturn(List.of(slot));
    when(batchPersistSlotsUseCase.execute(anyList())).thenAnswer(inv -> inv.getArgument(0));

    List<Slots> updated = useCase.execute(command);

    assertThat(updated).hasSize(1);
    Slots result = updated.get(0);
    assertThat(result.isHasCharger()).isTrue();
    assertThat(result.isAccessible()).isTrue();
    assertThat(result.isActive()).isTrue();
    verify(batchPersistSlotsUseCase).execute(anyList());
    verify(slotsRepository, never()).saveAll(anyList());
  }

  @Test
  @DisplayName("Should throw SlotNotFoundException when slot does not exist")
  void shouldThrowSlotNotFoundWhenSlotDoesNotExist() {
    UUID existingId = UUID.randomUUID();
    UUID missingId = UUID.randomUUID();

    Slots slot =
        Slots.builder()
            .id(existingId)
            .tenant(TenantReference.of(tenant))
            .status(SlotStatus.AVAILABLE)
            .build();

    UpdateSlotMetadataUseCase.UpdateSlotMetadataCommand command =
        UpdateSlotMetadataUseCase.UpdateSlotMetadataCommand.builder()
            .slotIds(List.of(existingId, missingId))
            .hasCharger(true)
            .build();

    when(slotsRepository.findAllByIdInAndTenantId(List.of(existingId, missingId), tenant.getId())).thenReturn(List.of(slot));

    assertThatThrownBy(() -> useCase.execute(command))
        .isInstanceOf(SlotNotFoundException.class);

    verify(batchPersistSlotsUseCase, never()).execute(anyList());
    verify(slotsRepository, never()).saveAll(anyList());
  }
}
