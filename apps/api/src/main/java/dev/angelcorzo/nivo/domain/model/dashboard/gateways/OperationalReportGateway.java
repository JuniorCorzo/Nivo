package dev.angelcorzo.nivo.domain.model.dashboard.gateways;

import dev.angelcorzo.nivo.domain.model.dashboard.OperationalReportModel;
import dev.angelcorzo.nivo.domain.model.dashboard.PageResult;
import java.util.List;
import java.util.UUID;

public interface OperationalReportGateway {
  PageResult<OperationalReportModel> findOperationalReports(
      UUID tenantId, UUID parkingLotId, int page, int size);
  List<OperationalReportModel> findAllForExport(UUID tenantId, UUID parkingLotId);
}
