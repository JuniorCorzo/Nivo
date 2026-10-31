package dev.angelcorzo.nivo.infrastructure.adapter.jpa.rates;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface RatesRepositoryData extends JpaRepository<RateData, UUID> {
  List<RateData> findAllByParking_Id(UUID id);

  @Query("SELECT r FROM RateData r WHERE r.parking.id = :id AND r.deleted_at IS NULL")
  List<RateData> findAllActiveByParkingId(@Param("id") UUID id);

  @Query("SELECT CASE WHEN COUNT(t) > 0 THEN true ELSE false END FROM ParkingTicketsData t WHERE t.rate.id = :rateId AND t.status = 'OPEN'")
  boolean hasActiveTickets(@Param("rateId") UUID rateId);
}
