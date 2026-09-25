package dev.angelcorzo.nivo.infrastructure.entrypoint.rest.dashboard;

import dev.angelcorzo.nivo.domain.model.authentication.gateway.AuthenticationContextGateway;
import dev.angelcorzo.nivo.domain.usecase.dashboard.GetDashboardSummaryUseCase;
import dev.angelcorzo.nivo.domain.usecase.dashboard.GetHourlyOccupancyUseCase;
import dev.angelcorzo.nivo.domain.usecase.dashboard.GetParkingsComparisonUseCase;
import dev.angelcorzo.nivo.domain.usecase.dashboard.dtos.DashboardSummaryDTO;
import dev.angelcorzo.nivo.domain.usecase.dashboard.dtos.HourlyOccupancyDTO;
import dev.angelcorzo.nivo.domain.usecase.dashboard.dtos.ParkingComparisonDTO;
import dev.angelcorzo.nivo.infrastructure.adapter.metrics.BackendOperationsMetricsManager;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicReference;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping({"/api/v1/dashboard", "/dashboard", "/v1/dashboard"})
@Tag(name = "Dashboard", description = "Real-time metrics, summaries and comparative analytics")
@RequiredArgsConstructor
public class DashboardController {

  private final GetDashboardSummaryUseCase summaryUseCase;
  private final GetHourlyOccupancyUseCase hourlyUseCase;
  private final GetParkingsComparisonUseCase comparisonUseCase;
  private final AuthenticationContextGateway authenticationContext;
  private final BackendOperationsMetricsManager metricsManager;

  @GetMapping("/summary")
  @Operation(summary = "Get dashboard summary", description = "Dual-scope summary: single parking if parkingId provided, else consolidated global tenant summary")
  public ResponseEntity<DashboardSummaryDTO> getSummary(@RequestParam(required = false) UUID parkingId) {
    UUID tenantId = authenticationContext.getCurrentTenantId();
    try {
      return ResponseEntity.ok(summaryUseCase.execute(tenantId, parkingId));
    } finally {
      if (metricsManager != null) {
        metricsManager.recordAnalyticsQueryDuration("daily", () -> {});
      }
    }
  }

  @GetMapping("/occupancy-hourly")
  @Operation(summary = "Get hourly occupancy", description = "Time-series occupancy curve for single facility or tenant consolidated scope")
  public ResponseEntity<List<HourlyOccupancyDTO>> getHourlyOccupancy(
      @RequestParam(required = false) UUID parkingId,
      @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime startDate,
      @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime endDate) {
    UUID tenantId = authenticationContext.getCurrentTenantId();
    try {
      return ResponseEntity.ok(hourlyUseCase.execute(tenantId, parkingId, startDate, endDate));
    } finally {
      if (metricsManager != null) {
        metricsManager.recordAnalyticsQueryDuration("hourly", () -> {});
      }
    }
  }

  @GetMapping("/parkings-comparison")
  @Operation(summary = "Get parkings comparison", description = "Ranking comparison across all parking facilities of tenant")
  public ResponseEntity<List<ParkingComparisonDTO>> getParkingsComparison(
      @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
      @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
    UUID tenantId = authenticationContext.getCurrentTenantId();
    try {
      return ResponseEntity.ok(comparisonUseCase.execute(tenantId, startDate, endDate));
    } finally {
      if (metricsManager != null) {
        metricsManager.recordAnalyticsQueryDuration("daily", () -> {});
      }
    }
  }

  @ExceptionHandler(IllegalArgumentException.class)
  public ResponseEntity<String> handleIllegalArgument(IllegalArgumentException ex) {
    return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
  }
}
