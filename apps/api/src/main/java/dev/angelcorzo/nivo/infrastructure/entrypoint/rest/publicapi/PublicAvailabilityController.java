package dev.angelcorzo.nivo.infrastructure.entrypoint.rest.publicapi;

import dev.angelcorzo.nivo.domain.usecase.dashboard.GetPublicParkingAvailabilityUseCase;
import dev.angelcorzo.nivo.domain.usecase.dashboard.dtos.PublicParkingAvailabilityDTO;
import dev.angelcorzo.nivo.infrastructure.adapter.metrics.BackendOperationsMetricsManager;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;
import lombok.RequiredArgsConstructor;
import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping({"/api/v1/public/parkings", "/public/parkings"})
@Tag(
    name = "Public Availability",
    description = "Public parking availability API with rate limiting and caching")
@RequiredArgsConstructor
public class PublicAvailabilityController {

  private final GetPublicParkingAvailabilityUseCase availabilityUseCase;
  private final BackendOperationsMetricsManager metricsManager;

  private final Map<UUID, CachedAvailability> cache = new ConcurrentHashMap<>();

  @GetMapping("/{parkingId}/availability")
  @Operation(
      summary = "Get parking availability",
      description = "Public endpoint returning sanitized slot availability")
  public ResponseEntity<PublicParkingAvailabilityDTO> getAvailability(
      @PathVariable UUID parkingId) {
    long now = System.currentTimeMillis();
    CachedAvailability cached = cache.get(parkingId);
    if (cached != null && (now - cached.cachedAt()) < 30_000L) {
      metricsManager.recordAvailabilityCacheHit();
      metricsManager.recordPublicAvailabilityRequest(200);
      return ResponseEntity.ok()
          .cacheControl(CacheControl.maxAge(30, TimeUnit.SECONDS).cachePublic())
          .body(cached.dto());
    }

    metricsManager.recordAvailabilityCacheMiss();
    var availabilityOpt = availabilityUseCase.execute(parkingId);
    if (availabilityOpt.isEmpty()) {
      metricsManager.recordPublicAvailabilityRequest(404);
      return ResponseEntity.notFound().build();
    }

    PublicParkingAvailabilityDTO dto = availabilityOpt.get();
    cache.put(parkingId, new CachedAvailability(dto, now));
    metricsManager.recordPublicAvailabilityRequest(200);

    return ResponseEntity.ok()
        .cacheControl(CacheControl.maxAge(30, TimeUnit.SECONDS).cachePublic())
        .body(dto);
  }

  private record CachedAvailability(PublicParkingAvailabilityDTO dto, long cachedAt) {}
}
