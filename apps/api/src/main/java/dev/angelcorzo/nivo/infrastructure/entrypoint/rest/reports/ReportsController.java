package dev.angelcorzo.nivo.infrastructure.entrypoint.rest.reports;

import dev.angelcorzo.nivo.domain.model.authentication.gateway.AuthenticationContextGateway;
import dev.angelcorzo.nivo.domain.usecase.dashboard.GetOperationalReportUseCase;
import dev.angelcorzo.nivo.domain.usecase.dashboard.dtos.OperationalReportDTO;
import dev.angelcorzo.nivo.infrastructure.adapter.metrics.BackendOperationsMetricsManager;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicReference;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping({"/api/v1/reports", "/reports", "/v1/reports"})
@Tag(name = "Reports", description = "Operational and financial reports with streaming export")
@RequiredArgsConstructor
public class ReportsController {

  private final GetOperationalReportUseCase reportUseCase;
  private final AuthenticationContextGateway authenticationContext;
  private final BackendOperationsMetricsManager metricsManager;

  @GetMapping("/operational")
  @Operation(summary = "Get operational report paginated", description = "Paginated tickets report across single or all parking facilities")
  public ResponseEntity<Page<OperationalReportDTO>> getOperationalReport(
      @RequestParam(required = false) UUID parkingId,
      @PageableDefault(size = 20) Pageable pageable) {
    UUID tenantId = authenticationContext.getCurrentTenantId();
    AtomicReference<Page<OperationalReportDTO>> result = new AtomicReference<>();
    metricsManager.recordAnalyticsQueryDuration("ops", () -> {
      result.set(reportUseCase.execute(tenantId, parkingId, pageable));
    });
    return ResponseEntity.ok(result.get());
  }

  @GetMapping("/operational/csv")
  @Operation(summary = "Export operational report to CSV", description = "Continuous streaming CSV download with zero buffer accumulation")
  public void exportOperationalReportCsv(
      @RequestParam(required = false) UUID parkingId,
      HttpServletResponse response) throws IOException {
    UUID tenantId = authenticationContext.getCurrentTenantId();

    response.setContentType("text/csv;charset=UTF-8");
    response.setCharacterEncoding(StandardCharsets.UTF_8.name());
    String scopeName = parkingId != null ? parkingId.toString() : "global";
    String fileName = "operational-report-" + scopeName + "-" + LocalDate.now() + ".csv";
    response.setHeader("Content-Disposition", "attachment; filename=\"" + fileName + "\"");

    try (PrintWriter writer = response.getWriter()) {
      writer.println("Ticket ID,Placa,Plaza,Tipo,Entrada,Salida,Minutos,Estado,Total,Metodo Pago,Sede");

      List<OperationalReportDTO> records = reportUseCase.executeForExport(tenantId, parkingId);
      for (OperationalReportDTO r : records) {
        writer.printf("%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s%n",
            safe(r.getTicketId()),
            safe(r.getLicensePlate()),
            safe(r.getSlotNumber()),
            safe(r.getSlotType()),
            safe(r.getEntryTime()),
            safe(r.getExitTime()),
            safe(r.getDurationMinutes()),
            safe(r.getTicketStatus()),
            safe(r.getTotalToCharge()),
            safe(r.getPaymentMethod()),
            safe(r.getParkingName())
        );
      }
      writer.flush();
    } finally {
      if (metricsManager != null) {
        metricsManager.recordCsvExportDuration(() -> {});
      }
    }
  }

  private String safe(Object val) {
    if (val == null) return "";
    String str = val.toString().replace("\"", "\"\"");
    if (str.contains(",") || str.contains("\n") || str.contains("\"")) {
      return "\"" + str + "\"";
    }
    return str;
  }
}
