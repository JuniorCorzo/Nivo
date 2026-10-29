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

  @Query(value = """
      SELECT
          COALESCE(COUNT(s.id) FILTER (WHERE s.status != 'MAINTENANCE'), 0) AS totalCapacity,
          COALESCE(COUNT(s.id) FILTER (WHERE s.status IN ('OCCUPIED', 'RESERVED')), 0) AS occupiedSlots,
          COALESCE(COUNT(s.id) FILTER (WHERE UPPER(s.type) = 'CAR' AND s.status != 'MAINTENANCE'), 0) AS carTotal,
          COALESCE(COUNT(s.id) FILTER (WHERE UPPER(s.type) = 'CAR' AND s.status IN ('OCCUPIED', 'RESERVED')), 0) AS carOccupied,
          COALESCE(COUNT(s.id) FILTER (WHERE UPPER(s.type) IN ('MOTORCYCLE', 'MOTO') AND s.status != 'MAINTENANCE'), 0) AS motoTotal,
          COALESCE(COUNT(s.id) FILTER (WHERE UPPER(s.type) IN ('MOTORCYCLE', 'MOTO') AND s.status IN ('OCCUPIED', 'RESERVED')), 0) AS motoOccupied,
          COALESCE((
              SELECT COUNT(t.id)
              FROM nivo.parking_tickets t
              JOIN nivo.slots st ON st.id = t.slot_id
              WHERE st.parking_lot_id = :parkingId
                AND t.status = 'OPEN'
                AND t.entry_time < (CURRENT_TIMESTAMP - INTERVAL '8 hours')
                AND t.deleted_at IS NULL
          ), 0) AS moraCount,
          COALESCE((
              SELECT SUM(p.amount)
              FROM nivo.payments p
              JOIN nivo.parking_tickets t ON t.id = p.parking_ticket_id
              JOIN nivo.slots st ON st.id = t.slot_id
              WHERE st.parking_lot_id = :parkingId
                AND p.status = 'PAID'
                AND CAST(p.payment_date AS date) = CURRENT_DATE
                AND p.deleted_at IS NULL
          ), 0.00) AS shiftRevenue,
          COALESCE((
              SELECT COUNT(t.id)
              FROM nivo.parking_tickets t
              JOIN nivo.slots st ON st.id = t.slot_id
              WHERE st.parking_lot_id = :parkingId
                AND t.status = 'CLOSED'
                AND CAST(t.entry_time AS date) = CURRENT_DATE
                AND t.deleted_at IS NULL
          ), 0) AS completedTicketsToday,
          COALESCE((
              SELECT COUNT(t.id)
              FROM nivo.parking_tickets t
              JOIN nivo.slots st ON st.id = t.slot_id
              WHERE st.parking_lot_id = :parkingId
                AND CAST(t.entry_time AS date) = CURRENT_DATE
                AND t.deleted_at IS NULL
          ), 0) AS totalTicketsToday,
          COALESCE((
              SELECT ROUND(AVG((EXTRACT(EPOCH FROM t.exit_time) - EXTRACT(EPOCH FROM t.entry_time)) / 60.0)::numeric, 1)
              FROM nivo.parking_tickets t
              JOIN nivo.slots st ON st.id = t.slot_id
              WHERE st.parking_lot_id = :parkingId
                AND t.status = 'CLOSED'
                AND CAST(t.entry_time AS date) = CURRENT_DATE
                AND t.deleted_at IS NULL
          ), 0.0) AS avgStayMinutes
      FROM nivo.slots s
      WHERE s.parking_lot_id = :parkingId
        AND s.deleted_at IS NULL
  """, nativeQuery = true)
  ParkingTelemetryProjection findTelemetryByParkingLotId(@Param("parkingId") UUID parkingId);

  @Query(value = """
      SELECT
          st.slot_number AS slotNumber,
          st.zone AS zone,
          st.prefix AS prefix,
          st.type AS type,
          t.license_plate AS licensePlate
      FROM nivo.slots st
      JOIN nivo.parking_tickets t ON t.slot_id = st.id
      WHERE st.parking_lot_id = :parkingId
        AND t.status = 'OPEN'
        AND st.deleted_at IS NULL
        AND t.deleted_at IS NULL
  """, nativeQuery = true)
  List<OccupiedSlotProjection> findOccupiedSlotsDetailByParkingLotId(@Param("parkingId") UUID parkingId);
}

