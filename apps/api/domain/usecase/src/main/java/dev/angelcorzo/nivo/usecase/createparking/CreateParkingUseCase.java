package dev.angelcorzo.nivo.usecase.createparking;

import dev.angelcorzo.nivo.model.authentication.gateway.AuthenticationContextGateway;
import dev.angelcorzo.nivo.model.parkinglots.ParkingLots;
import dev.angelcorzo.nivo.model.parkinglots.dto.UpsertParkingLotsDTO;
import dev.angelcorzo.nivo.model.parkinglots.gateways.ParkingLotsRepository;
import dev.angelcorzo.nivo.model.slots.Slots;
import dev.angelcorzo.nivo.model.slots.mappers.SlotMapper;
import dev.angelcorzo.nivo.model.slots.valueobject.CreatedSlots;
import dev.angelcorzo.nivo.model.tenants.Tenants;
import dev.angelcorzo.nivo.model.tenants.exceptions.NoOwnerInTenantException;
import dev.angelcorzo.nivo.model.tenants.valueobject.TenantReference;
import dev.angelcorzo.nivo.model.users.Users;
import dev.angelcorzo.nivo.model.users.enums.Roles;
import dev.angelcorzo.nivo.model.users.gateways.UsersRepository;
import dev.angelcorzo.nivo.model.users.valueobject.UserReference;
import dev.angelcorzo.nivo.usecase.batchpersistslots.BatchPersistSlotsUseCase;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public class CreateParkingUseCase {
  private final BatchPersistSlotsUseCase batchCreateSlotsUseCase;
  private final ParkingLotsRepository parkingLotsRepository;
  private final UsersRepository usersRepository;
  private final AuthenticationContextGateway authenticationContext;

  private ParkingLots getBuildParkingLots(UpsertParkingLotsDTO parking, UUID ownerId) {
    Users userReferenceById = usersRepository.getReferenceById(ownerId);
    Tenants currentTenant = this.authenticationContext.getCurrentTenant();

    return ParkingLots.builder()
        .name(parking.name())
        .address(parking.address())
        .coordinates(parking.coordinates())
        .owner(UserReference.of(userReferenceById))
        .tenant(TenantReference.of(currentTenant))
        .timezone(parking.timezone())
        .currency(parking.currency())
        .operatingHours(parking.operatingHours())
        .build();
  }

  private UUID getOwnerId() {
    Tenants currentTenant = this.authenticationContext.getCurrentTenant();

    return currentTenant.getUsers().stream()
        .filter(user -> user.role().equals(Roles.OWNER))
        .map(UserReference::id)
        .findFirst()
        .orElseThrow(() -> new NoOwnerInTenantException(currentTenant.getId()));
  }

  private void createdSlots(
      List<CreatedSlots> slotsToCreate, ParkingLots parkingLots) {

    final List<Slots> slots =
        SlotMapper.toEntities(
            slotsToCreate, this.authenticationContext.getCurrentTenant(), parkingLots);

    this.batchCreateSlotsUseCase.execute(slots);
  }

  public ParkingLots execute(UpsertParkingLotsDTO parking) {
    UUID ownerId = getOwnerId();
    ParkingLots parkingLots = getBuildParkingLots(parking, ownerId);
    parkingLots = this.parkingLotsRepository.save(parkingLots);

    List<CreatedSlots> slots = parking.slots();
    if (slots != null && !slots.isEmpty()) {
      this.createdSlots(slots, parkingLots);
    }

    return parkingLots;
  }
}
