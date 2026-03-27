package dev.angelcorzo.nivo.jpa.parkinglots;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

public interface ParkingLotsRepositoryData extends JpaRepository<ParkingLotsData, UUID> {
  List<ParkingLotsData> findAllByOwnerId(UUID ownerId);

  List<ParkingLotsData> findAllByTenantId(UUID tenantId);

  @Transactional
  @Modifying
  @Query("UPDATE ParkingLotsData p SET p.totalSpots = p.totalSpots + 1 WHERE p.id = ?1")
  void incrementTotalSpots(UUID id);

  @Transactional
  @Modifying
  @Query("UPDATE ParkingLotsData p SET p.totalSpots = p.totalSpots - 1 WHERE p.id = ?1")
  void decrementTotalSpots(UUID id);
}
