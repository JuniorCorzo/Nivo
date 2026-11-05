package dev.angelcorzo.nivo.infrastructure.adapter.cache.publicapi;

import dev.angelcorzo.nivo.domain.usecase.dashboard.GetPublicParkingAvailabilityUseCase;
import dev.angelcorzo.nivo.domain.usecase.dashboard.dtos.PublicParkingAvailabilityDTO;
import dev.angelcorzo.nivo.infrastructure.adapter.cache.constants.CacheNames;
import java.util.Optional;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

/**
 * Caching service for public availability queries.
 *
 * <p>
 * Keeps the public endpoint REST controller ultra-thin while enforcing public-scoped cache keys.
 */
@Service
@RequiredArgsConstructor
public class PublicAvailabilityCacheService {

  private final GetPublicParkingAvailabilityUseCase availabilityUseCase;

  @Cacheable(value = CacheNames.PUBLIC_AVAILABILITY_KEY, key = "'public:availability:' + #parkingId")
  public Optional<PublicParkingAvailabilityDTO> getAvailability(final UUID parkingId) {
    return this.availabilityUseCase.execute(parkingId);
  }
}
