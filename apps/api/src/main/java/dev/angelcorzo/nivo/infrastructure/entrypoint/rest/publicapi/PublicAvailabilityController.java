package dev.angelcorzo.nivo.infrastructure.entrypoint.rest.publicapi;

import dev.angelcorzo.nivo.domain.usecase.dashboard.dtos.PublicParkingAvailabilityDTO;
import dev.angelcorzo.nivo.infrastructure.adapter.cache.publicapi.PublicAvailabilityCacheService;
import dev.angelcorzo.nivo.infrastructure.adapter.metrics.BackendOperationsMetricsManager;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.TimeUnit;
import lombok.RequiredArgsConstructor;
import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Ultra-thin REST controller for public parking availability queries.
 */
@RestController
@RequestMapping("/public/parkings")
@Tag(name = "Public Availability", description = "Public parking availability API with rate limiting and caching")
@RequiredArgsConstructor
public class PublicAvailabilityController {

  private final PublicAvailabilityCacheService availabilityCacheService;
  private final BackendOperationsMetricsManager metricsManager;

  @GetMapping("/{parkingId}/availability")
  @Operation(summary = "Get parking availability", description = "Public endpoint returning sanitized slot availability")
  public ResponseEntity<PublicParkingAvailabilityDTO> getAvailability(@PathVariable final UUID parkingId) {
    final Optional<PublicParkingAvailabilityDTO> dtoOpt = this.availabilityCacheService.getAvailability(parkingId);
    if (dtoOpt.isEmpty()) {
      this.metricsManager.recordPublicAvailabilityRequest(404);
      return ResponseEntity.notFound().build();
    }

    this.metricsManager.recordPublicAvailabilityRequest(200);
    return ResponseEntity.ok()
      .cacheControl(CacheControl.maxAge(30, TimeUnit.SECONDS).cachePublic())
      .body(dtoOpt.get());
  }
}
