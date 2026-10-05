package dev.angelcorzo.nivo.domain.usecase.rate.engine;

import dev.angelcorzo.nivo.domain.model.commons.exceptions.InvalidDomainException;
import java.time.Duration;
import java.time.OffsetDateTime;

public record StayInterval(
    OffsetDateTime entryTime,
    OffsetDateTime exitTime,
    Duration duration
) {
  public StayInterval {
    if (entryTime == null || exitTime == null) {
      throw new InvalidDomainException("Entry time and exit time cannot be null");
    }
    if (exitTime.isBefore(entryTime)) {
      throw new InvalidDomainException("Exit time cannot be before entry time");
    }
    if (duration == null) {
      duration = Duration.between(entryTime, exitTime);
    }
  }

  public static StayInterval of(OffsetDateTime entryTime, OffsetDateTime exitTime) {
    if (entryTime == null || exitTime == null) {
      throw new InvalidDomainException("Entry time and exit time cannot be null");
    }
    if (exitTime.isBefore(entryTime)) {
      throw new InvalidDomainException("Exit time cannot be before entry time");
    }
    return new StayInterval(entryTime, exitTime, Duration.between(entryTime, exitTime));
  }

  public long toMinutes() {
    return duration.toMinutes();
  }
}
