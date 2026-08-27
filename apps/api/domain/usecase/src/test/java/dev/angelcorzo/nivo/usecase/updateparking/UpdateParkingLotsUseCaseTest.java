package dev.angelcorzo.nivo.usecase.updateparking;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import dev.angelcorzo.nivo.model.authentication.gateway.AuthenticationContextGateway;
import dev.angelcorzo.nivo.model.parkinglots.Address;
import dev.angelcorzo.nivo.model.parkinglots.Coordinates;
import dev.angelcorzo.nivo.model.parkinglots.OperatingHours;
import dev.angelcorzo.nivo.model.parkinglots.ParkingLots;
import dev.angelcorzo.nivo.model.parkinglots.dto.UpsertParkingLotsDTO;
import dev.angelcorzo.nivo.model.parkinglots.exceptions.ParkingNotExistsException;
import dev.angelcorzo.nivo.model.parkinglots.gateways.ParkingLotsRepository;
import dev.angelcorzo.nivo.usecase.batchupsertslots.BatchUpsertSlotsUseCase;
import java.time.OffsetTime;
import java.util.Collections;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

@DisplayName("UpdateParkingLotsUseCase Tests")
class UpdateParkingLotsUseCaseTest {

  private ParkingLotsRepository parkingLotsRepository;
  private BatchUpsertSlotsUseCase batchUpsertSlotsUseCase;
  private AuthenticationContextGateway authenticationContext;
  private UpdateParkingLotsUseCase useCase;

  @BeforeEach
  void setUp() {
    parkingLotsRepository = mock(ParkingLotsRepository.class);
    batchUpsertSlotsUseCase = mock(BatchUpsertSlotsUseCase.class);
    authenticationContext = mock(AuthenticationContextGateway.class);
    useCase = new UpdateParkingLotsUseCase(parkingLotsRepository, batchUpsertSlotsUseCase, authenticationContext);
  }

  @Test
  @DisplayName("Should update parking lot successfully")
  void shouldUpdateParkingLotSuccessfully() {
    UUID parkingId = UUID.randomUUID();
    Address address = Address.builder().street("New Address 456").city("Bogotá").build();
    Coordinates coordinates = Coordinates.builder().latitude(4.60).longitude(-74.08).build();
    OperatingHours hours = OperatingHours.builder().openTime(OffsetTime.now()).closeTime(OffsetTime.now()).build();
    UpsertParkingLotsDTO command =
        new UpsertParkingLotsDTO(
            parkingId, "Updated Lot", address, coordinates, "America/Bogota", "COP", hours, Collections.emptyList());

    ParkingLots existing =
        ParkingLots.builder()
            .id(parkingId)
            .name("Old Lot")
            .build();

    when(parkingLotsRepository.existsById(parkingId)).thenReturn(true);
    when(parkingLotsRepository.findById(parkingId)).thenReturn(Optional.of(existing));
    when(parkingLotsRepository.save(any(ParkingLots.class))).thenAnswer(i -> i.getArgument(0));

    ParkingLots result = useCase.update(command);

    assertThat(result).isNotNull();
    assertThat(result.getName()).isEqualTo("Updated Lot");
    assertThat(result.getAddress()).isEqualTo(address);
    verify(parkingLotsRepository).save(any(ParkingLots.class));
  }

  @Test
  @DisplayName("Should throw ParkingNotExistsException when parking lot does not exist")
  void shouldThrowWhenParkingLotNotFound() {
    UUID parkingId = UUID.randomUUID();
    Address address = Address.builder().street("New Address 456").city("Bogotá").build();
    Coordinates coordinates = Coordinates.builder().latitude(4.60).longitude(-74.08).build();
    OperatingHours hours = OperatingHours.builder().openTime(OffsetTime.now()).closeTime(OffsetTime.now()).build();
    UpsertParkingLotsDTO command =
        new UpsertParkingLotsDTO(
            parkingId, "Updated Lot", address, coordinates, "America/Bogota", "COP", hours, Collections.emptyList());

    when(parkingLotsRepository.existsById(parkingId)).thenReturn(false);

    assertThatThrownBy(() -> useCase.update(command))
        .isInstanceOf(ParkingNotExistsException.class);
  }
}
