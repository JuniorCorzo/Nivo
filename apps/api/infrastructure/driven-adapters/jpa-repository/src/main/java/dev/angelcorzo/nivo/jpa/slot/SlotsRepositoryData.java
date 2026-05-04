package dev.angelcorzo.nivo.jpa.slot;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

public interface SlotsRepositoryData extends JpaRepository<SlotsData, UUID> {
  List<SlotsData> findAllByParking_Id(UUID parkingLotId);

  @Modifying
  @Transactional
  @Query(value = "UPDATE slots SET deleted_at = CURRENT_TIMESTAMP WHERE parking_lot_id = :parkingLotId AND deleted_at IS NULL", nativeQuery = true)
  int softDeleteByParkingLotsId(@Param("parkingLotId") UUID parkingLotId);
}
