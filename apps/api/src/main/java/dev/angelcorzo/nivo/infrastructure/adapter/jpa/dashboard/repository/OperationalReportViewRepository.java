package dev.angelcorzo.nivo.infrastructure.adapter.jpa.dashboard.repository;

import dev.angelcorzo.nivo.infrastructure.adapter.jpa.dashboard.OperationalReportViewEntity;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface OperationalReportViewRepository extends JpaRepository<OperationalReportViewEntity, UUID>, JpaSpecificationExecutor<OperationalReportViewEntity> {
  List<OperationalReportViewEntity> findAllByTenantId(UUID tenantId);
  Page<OperationalReportViewEntity> findAllByTenantId(UUID tenantId, Pageable pageable);
  Page<OperationalReportViewEntity> findAllByTenantIdAndParkingLotId(UUID tenantId, UUID parkingLotId, Pageable pageable);
  List<OperationalReportViewEntity> findAllByTenantIdAndEntryTimeBetweenOrderByEntryTimeDesc(UUID tenantId, OffsetDateTime start, OffsetDateTime end);
  List<OperationalReportViewEntity> findAllByTenantIdAndParkingLotIdAndEntryTimeBetweenOrderByEntryTimeDesc(UUID tenantId, UUID parkingLotId, OffsetDateTime start, OffsetDateTime end);
}
