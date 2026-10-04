package dev.angelcorzo.nivo.usecase.deleteparkinglot;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

import dev.angelcorzo.nivo.model.authentication.gateway.AuthenticationContextGateway;
import dev.angelcorzo.nivo.model.parkinglots.ParkingLots;
import dev.angelcorzo.nivo.model.parkinglots.exceptions.ParkingNotExistsException;
import dev.angelcorzo.nivo.model.parkinglots.gateways.ParkingLotsRepository;
import dev.angelcorzo.nivo.model.slots.gateways.SlotsRepository;
import dev.angelcorzo.nivo.model.tenants.valueobject.TenantReference;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

@DisplayName("DeleteParkingLotUseCase Tests")
class DeleteParkingLotUseCaseTest {

  private ParkingLotsRepository parkingLotsRepository;
  private SlotsRepository slotsRepository;
  private AuthenticationContextGateway authenticationContext;
  private DeleteParkingLotUseCase useCase;

  @BeforeEach
  void setUp() {
    parkingLotsRepository = mock(ParkingLotsRepository.class);
    slotsRepository = mock(SlotsRepository.class);
    authenticationContext = mock(AuthenticationContextGateway.class);
    useCase = new DeleteParkingLotUseCase(parkingLotsRepository, slotsRepository, authenticationContext);
  }

  @Test
  @DisplayName("Should delete parking lot and soft-delete its slots when tenant matches")
  void shouldDeleteParkingLotSuccessfully() {
    UUID tenantId = UUID.randomUUID();
    UUID parkingId = UUID.randomUUID();
    ParkingLots parkingLot =
        ParkingLots.builder()
            .id(parkingId)
            .name("Lot A")
            .tenant(TenantReference.builder().id(tenantId).build())
            .build();

    when(parkingLotsRepository.findById(parkingId)).thenReturn(Optional.of(parkingLot));

    useCase.execute(parkingId, tenantId);

    verify(slotsRepository).softDeleteByParkingLotsId(parkingId);
    verify(parkingLotsRepository).delete(parkingLot);
  }

  @Test
  @DisplayName("Should delete parking lot using AuthenticationContextGateway when tenantId is not provided")
  void shouldDeleteUsingAuthenticationContextGateway() {
    UUID tenantId = UUID.randomUUID();
    UUID parkingId = UUID.randomUUID();
    ParkingLots parkingLot =
        ParkingLots.builder()
            .id(parkingId)
            .name("Lot A")
            .tenant(TenantReference.builder().id(tenantId).build())
            .build();

    when(authenticationContext.getCurrentTenantId()).thenReturn(tenantId);
    when(parkingLotsRepository.findById(parkingId)).thenReturn(Optional.of(parkingLot));

    useCase.execute(parkingId);

    verify(slotsRepository).softDeleteByParkingLotsId(parkingId);
    verify(parkingLotsRepository).delete(parkingLot);
  }

  @Test
  @DisplayName("Should throw ParkingNotExistsException when parking lot is not found")
  void shouldThrowWhenNotFound() {
    UUID tenantId = UUID.randomUUID();
    UUID parkingId = UUID.randomUUID();
    when(parkingLotsRepository.findById(parkingId)).thenReturn(Optional.empty());

    assertThatThrownBy(() -> useCase.execute(parkingId, tenantId))
        .isInstanceOf(ParkingNotExistsException.class);

    verify(slotsRepository, never()).softDeleteByParkingLotsId(any());
    verify(parkingLotsRepository, never()).delete(any());
  }

  @Test
  @DisplayName("Should throw ParkingNotExistsException when parking lot belongs to another tenant")
  void shouldThrowWhenTenantDoesNotMatch() {
    UUID tenantA = UUID.randomUUID();
    UUID tenantB = UUID.randomUUID();
    UUID parkingId = UUID.randomUUID();
    ParkingLots parkingLot =
        ParkingLots.builder()
            .id(parkingId)
            .name("Lot Tenant A")
            .tenant(TenantReference.builder().id(tenantA).build())
            .build();

    when(parkingLotsRepository.findById(parkingId)).thenReturn(Optional.of(parkingLot));

    assertThatThrownBy(() -> useCase.execute(parkingId, tenantB))
        .isInstanceOf(ParkingNotExistsException.class);

    verify(slotsRepository, never()).softDeleteByParkingLotsId(any());
    verify(parkingLotsRepository, never()).delete(any());
  }

  @Test
  @DisplayName("Should throw ParkingNotExistsException when parking lot has no tenant reference")
  void shouldThrowWhenTenantIsNull() {
    UUID tenantId = UUID.randomUUID();
    UUID parkingId = UUID.randomUUID();
    ParkingLots parkingLot =
        ParkingLots.builder()
            .id(parkingId)
            .name("Orphan Lot")
            .tenant(null)
            .build();

    when(parkingLotsRepository.findById(parkingId)).thenReturn(Optional.of(parkingLot));

    assertThatThrownBy(() -> useCase.execute(parkingId, tenantId))
        .isInstanceOf(ParkingNotExistsException.class);

    verify(slotsRepository, never()).softDeleteByParkingLotsId(any());
    verify(parkingLotsRepository, never()).delete(any());
  }
}
