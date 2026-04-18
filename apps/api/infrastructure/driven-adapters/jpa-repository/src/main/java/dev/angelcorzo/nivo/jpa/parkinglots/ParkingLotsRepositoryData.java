package dev.angelcorzo.nivo.jpa.parkinglots;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ParkingLotsRepositoryData extends JpaRepository<ParkingLotsData, UUID> {
  List<ParkingLotsData> findAllByOwnerId(UUID ownerId);

  @Query(
      value =
          """
      SELECT
        p.id,
        p.name,
        p.currency,
        p.created_at,
        p.updated_at,
        p.deleted_at,
        (p.location_address).street,
        (p.location_address).city,
        (p.location_address).state,
        (p.location_address).country,
        (p.location_address).zip_code,
       ST_Y(p.coordinates::geometry) AS latitude,
       ST_X(p.coordinates::geometry) AS longitude,
        COALESCE(
          JSON_AGG(
            JSON_BUILD_OBJECT('type', slot_summary.slot_type, 'count', slot_summary.slot_count)
          ) FILTER (WHERE slot_summary.slot_type IS NOT NULL),
          '[]'::json
        ) AS slot_distribution,
        u.full_name AS owner_name,
        COALESCE(SUM(slot_summary.slot_count), 0) AS total_capacity
      FROM
        nivo.parking_lots p
        LEFT JOIN nivo.users u ON u.id = p.owner_id
        LEFT JOIN (
          SELECT
            s.parking_lot_id,
            s.type AS slot_type,
            COUNT(*) AS slot_count
          FROM
            nivo.slots s
          GROUP BY
            s.parking_lot_id,
            s.type
        ) slot_summary ON p.id = slot_summary.parking_lot_id
      WHERE p.tenant_id = :tenantId
      GROUP BY
        p.id,
        p.name,
        p.location_address,
        p.coordinates,
        p.currency,
        p.created_at,
        p.updated_at,
        p.deleted_at,
        u.full_name
      """,
      nativeQuery = true)
  List<Object[]> findAllByTenantId(@Param("tenantId") UUID tenantId);
}
