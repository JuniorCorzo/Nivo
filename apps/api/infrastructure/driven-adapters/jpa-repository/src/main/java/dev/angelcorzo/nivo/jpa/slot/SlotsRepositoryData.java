package dev.angelcorzo.nivo.jpa.slot;

import java.util.List;
import java.util.UUID;
import jakarta.persistence.Tuple;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

public interface SlotsRepositoryData extends JpaRepository<SlotsData, UUID> {
  List<SlotsData> findAllByParking_Id(@Param("parkingLotId") UUID parkingLotId);

  @Query(value = """
        SELECT s.id AS id, p.name AS parkingName, s.type AS type, s.zone AS zone, s.prefix AS prefix, s.slotNumber AS numberSlot, s.status AS status,
               CASE WHEN SUM(CASE WHEN t.status = dev.angelcorzo.nivo.model.parkingtickets.enums.ParkingTicketStatus.OPEN OR t.status = dev.angelcorzo.nivo.model.parkingtickets.enums.ParkingTicketStatus.LOST THEN 1 ELSE 0 END) > 0 THEN true ELSE false END AS hasTicket,
               CASE WHEN COUNT(t.id) > 0 THEN true ELSE false END AS hasHistory
        FROM SlotsData s
        JOIN s.parking p
        LEFT JOIN s.tickets t
        WHERE s.parking.id = :parkingLotId
        GROUP BY s.id, p.name, s.type, s.zone, s.prefix, s.slotNumber, s.status
      """)
  List<Tuple> findAllSummaryByParking_Id(@Param("parkingLotId") UUID parkingLotId);

  @Modifying
  @Transactional
  @Query(value = "UPDATE slots SET deleted_at = CURRENT_TIMESTAMP WHERE parking_lot_id = :parkingLotId AND deleted_at IS NULL", nativeQuery = true)
  int softDeleteByParkingLotsId(@Param("parkingLotId") UUID parkingLotId);

}
