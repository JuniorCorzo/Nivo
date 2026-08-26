package dev.angelcorzo.nivo.usecase.createparking;

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
import dev.angelcorzo.nivo.model.parkinglots.gateways.ParkingLotsRepository;
import dev.angelcorzo.nivo.model.tenants.Tenants;
import dev.angelcorzo.nivo.model.tenants.exceptions.NoOwnerInTenantException;
import dev.angelcorzo.nivo.model.users.Users;
import dev.angelcorzo.nivo.model.users.enums.Roles;
import dev.angelcorzo.nivo.model.users.gateways.UsersRepository;
import dev.angelcorzo.nivo.model.users.valueobject.UserReference;
import dev.angelcorzo.nivo.usecase.batchpersistslots.BatchPersistSlotsUseCase;
import java.time.OffsetTime;
import java.util.Collections;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

@DisplayName("CreateParkingUseCase Tests")
class CreateParkingUseCaseTest {

  private BatchPersistSlotsUseCase batchCreateSlotsUseCase;
  private ParkingLotsRepository parkingLotsRepository;
  private UsersRepository usersRepository;
  private AuthenticationContextGateway authenticationContext;
  private CreateParkingUseCase useCase;

  @BeforeEach
  void setUp() {
    batchCreateSlotsUseCase = mock(BatchPersistSlotsUseCase.class);
    parkingLotsRepository = mock(ParkingLotsRepository.class);
    usersRepository = mock(UsersRepository.class);
    authenticationContext = mock(AuthenticationContextGateway.class);

    useCase =
        new CreateParkingUseCase(
            batchCreateSlotsUseCase, parkingLotsRepository, usersRepository, authenticationContext);
  }

  @Test
  @DisplayName("Should create parking lot successfully when owner exists")
  void shouldCreateParkingLotSuccessfully() {
    UUID ownerId = UUID.randomUUID();
    UUID tenantId = UUID.randomUUID();

    UserReference ownerRef =
        new UserReference(ownerId, "Owner User", "owner@nivo.com", Roles.OWNER, "12345");
    Tenants tenant =
        Tenants.builder()
            .id(tenantId)
            .companyName("Nivo Corp")
            .users(List.of(ownerRef))
            .build();

    Users ownerUser = Users.builder().id(ownerId).fullName("Owner User").role(Roles.OWNER).build();
    Address address = Address.builder().street("Downtown 123").city("Bogotá").build();
    Coordinates coordinates = Coordinates.builder().latitude(4.6097).longitude(-74.0817).build();
    OperatingHours hours = OperatingHours.builder().openTime(OffsetTime.now()).closeTime(OffsetTime.now()).build();

    UpsertParkingLotsDTO dto =
        new UpsertParkingLotsDTO(
            null, "Central Lot", address, coordinates, "America/Bogota", "COP", hours, Collections.emptyList());

    when(authenticationContext.getCurrentTenant()).thenReturn(tenant);
    when(usersRepository.getReferenceById(ownerId)).thenReturn(ownerUser);
    when(parkingLotsRepository.save(any(ParkingLots.class)))
        .thenAnswer(i -> i.getArgument(0));

    ParkingLots result = useCase.execute(dto);

    assertThat(result).isNotNull();
    assertThat(result.getName()).isEqualTo("Central Lot");
    assertThat(result.getOwner().id()).isEqualTo(ownerId);
    verify(parkingLotsRepository).save(any(ParkingLots.class));
  }

  @Test
  @DisplayName("Should throw NoOwnerInTenantException when tenant has no owner")
  void shouldThrowWhenNoOwnerInTenant() {
    UUID tenantId = UUID.randomUUID();
    Tenants tenant =
        Tenants.builder()
            .id(tenantId)
            .companyName("Nivo Corp")
            .users(Collections.emptyList())
            .build();

    Address address = Address.builder().street("Downtown 123").city("Bogotá").build();
    Coordinates coordinates = Coordinates.builder().latitude(4.6097).longitude(-74.0817).build();
    OperatingHours hours = OperatingHours.builder().openTime(OffsetTime.now()).closeTime(OffsetTime.now()).build();
    UpsertParkingLotsDTO dto =
        new UpsertParkingLotsDTO(
            null, "Central Lot", address, coordinates, "America/Bogota", "COP", hours, Collections.emptyList());

    when(authenticationContext.getCurrentTenant()).thenReturn(tenant);

    assertThatThrownBy(() -> useCase.execute(dto))
        .isInstanceOf(NoOwnerInTenantException.class);
  }
}
