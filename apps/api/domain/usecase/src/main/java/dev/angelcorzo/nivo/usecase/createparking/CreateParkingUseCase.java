package dev.angelcorzo.nivo.usecase.createparking;

import dev.angelcorzo.nivo.model.parkinglots.ParkingLots;
import dev.angelcorzo.nivo.model.parkinglots.dto.UpsertParkingLotsDTO;
import dev.angelcorzo.nivo.model.parkinglots.gateways.ParkingLotsRepository;
import dev.angelcorzo.nivo.model.tenants.Tenants;
import dev.angelcorzo.nivo.model.tenants.gateways.TenantsRepository;
import dev.angelcorzo.nivo.model.tenants.valueobject.TenantReference;
import dev.angelcorzo.nivo.model.users.enums.Roles;
import dev.angelcorzo.nivo.model.users.exceptions.UserNotExistsInTenantException;
import dev.angelcorzo.nivo.model.users.gateways.UsersRepository;
import dev.angelcorzo.nivo.model.users.valueobject.UserReference;
import java.util.UUID;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public class CreateParkingUseCase {
  private final ParkingLotsRepository parkingLotsRepository;
  private final UsersRepository usersRepository;
  private final TenantsRepository tenantsRepository;

  public ParkingLots created(UpsertParkingLotsDTO parking) {
    UUID ownerId =
        this.tenantsRepository
            .findById(parking.tenantId())
            .map(Tenants::getUsers)
            .map(users -> users.stream().filter(user -> user.role() == Roles.OWNER).toList())
            .map(users -> users.getFirst().id())
            .orElseThrow(UserNotExistsInTenantException::new);

    final ParkingLots parkingLots =
        ParkingLots.builder()
            .name(parking.name())
            .address(parking.address())
            .owner(UserReference.of(usersRepository.getReferenceById(ownerId)))
            .tenant(TenantReference.of(this.tenantsRepository.getReferenceById(parking.tenantId())))
            .timezone(parking.timezone())
            .currency(parking.currency())
            .operatingHours(parking.operatingHours())
            .totalSpots(0)
            .build();

    return this.parkingLotsRepository.save(parkingLots);
  }
}
