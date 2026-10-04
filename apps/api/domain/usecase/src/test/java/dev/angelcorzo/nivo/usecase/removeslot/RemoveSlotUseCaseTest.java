package dev.angelcorzo.nivo.usecase.removeslot;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

import dev.angelcorzo.nivo.model.authentication.gateway.AuthenticationContextGateway;
import dev.angelcorzo.nivo.model.parkinglots.gateways.ParkingLotsRepository;
import dev.angelcorzo.nivo.model.slots.Slots;
import dev.angelcorzo.nivo.model.slots.excetions.SlotNotFoundException;
import dev.angelcorzo.nivo.model.slots.gateways.SlotsRepository;
import dev.angelcorzo.nivo.model.tenants.valueobject.TenantReference;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

@DisplayName("RemoveSlotUseCase Tests")
class RemoveSlotUseCaseTest {

  private SlotsRepository slotsRepository;
  private ParkingLotsRepository parkingLotsRepository;
  private AuthenticationContextGateway authenticationContext;
  private RemoveSlotUseCase useCase;

  @BeforeEach
  void setUp() {
    slotsRepository = mock(SlotsRepository.class);
    parkingLotsRepository = mock(ParkingLotsRepository.class);
    authenticationContext = mock(AuthenticationContextGateway.class);
    useCase = new RemoveSlotUseCase(slotsRepository, parkingLotsRepository, authenticationContext);
  }

  @Test
  @DisplayName("Should delete slot by ID when tenant matches")
  void shouldDeleteSlotByIdWhenTenantMatches() {
    UUID tenantId = UUID.randomUUID();
    UUID slotId = UUID.randomUUID();
    Slots slot =
        Slots.builder()
            .id(slotId)
            .tenant(TenantReference.builder().id(tenantId).build())
            .build();

    when(slotsRepository.findById(slotId)).thenReturn(Optional.of(slot));

    useCase.execute(slotId, tenantId);

    verify(slotsRepository).deleteById(slotId);
  }

  @Test
  @DisplayName("Should delete slot using AuthenticationContextGateway when tenantId is not passed")
  void shouldDeleteSlotUsingAuthenticationContextGateway() {
    UUID tenantId = UUID.randomUUID();
    UUID slotId = UUID.randomUUID();
    Slots slot =
        Slots.builder()
            .id(slotId)
            .tenant(TenantReference.builder().id(tenantId).build())
            .build();

    when(authenticationContext.getCurrentTenantId()).thenReturn(tenantId);
    when(slotsRepository.findById(slotId)).thenReturn(Optional.of(slot));

    useCase.execute(slotId);

    verify(slotsRepository).deleteById(slotId);
  }

  @Test
  @DisplayName("Should throw SlotNotFoundException when slot does not exist")
  void shouldThrowWhenSlotNotFound() {
    UUID tenantId = UUID.randomUUID();
    UUID slotId = UUID.randomUUID();

    when(slotsRepository.findById(slotId)).thenReturn(Optional.empty());

    assertThatThrownBy(() -> useCase.execute(slotId, tenantId))
        .isInstanceOf(SlotNotFoundException.class);

    verify(slotsRepository, never()).deleteById(any());
  }

  @Test
  @DisplayName("Should throw SlotNotFoundException when slot belongs to another tenant")
  void shouldThrowSlotNotFoundExceptionWhenTenantDoesNotMatch() {
    UUID tenantA = UUID.randomUUID();
    UUID tenantB = UUID.randomUUID();
    UUID slotId = UUID.randomUUID();
    Slots slot =
        Slots.builder()
            .id(slotId)
            .tenant(TenantReference.builder().id(tenantA).build())
            .build();

    when(slotsRepository.findById(slotId)).thenReturn(Optional.of(slot));

    assertThatThrownBy(() -> useCase.execute(slotId, tenantB))
        .isInstanceOf(SlotNotFoundException.class);

    verify(slotsRepository, never()).deleteById(any());
  }

  @Test
  @DisplayName("Should throw SlotNotFoundException when slot has null tenant")
  void shouldThrowSlotNotFoundExceptionWhenTenantIsNull() {
    UUID tenantId = UUID.randomUUID();
    UUID slotId = UUID.randomUUID();
    Slots slot = Slots.builder().id(slotId).tenant(null).build();

    when(slotsRepository.findById(slotId)).thenReturn(Optional.of(slot));

    assertThatThrownBy(() -> useCase.execute(slotId, tenantId))
        .isInstanceOf(SlotNotFoundException.class);

    verify(slotsRepository, never()).deleteById(any());
  }
}
