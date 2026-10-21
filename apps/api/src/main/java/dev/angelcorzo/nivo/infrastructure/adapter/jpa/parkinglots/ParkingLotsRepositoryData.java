package dev.angelcorzo.nivo.infrastructure.adapter.jpa.parkinglots;

import jakarta.persistence.Tuple;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ParkingLotsRepositoryData extends JpaRepository<ParkingLotsData, UUID> {
  List<ParkingLotsData> findAllByOwnerId(UUID ownerId);

  @Query(value = "SELECT * FROM nivo.v_parking_lot_summaries WHERE tenant_id = :tenantId", nativeQuery = true)
  List<Tuple> findAllByTenantId(@Param("tenantId") UUID tenantId);
}
