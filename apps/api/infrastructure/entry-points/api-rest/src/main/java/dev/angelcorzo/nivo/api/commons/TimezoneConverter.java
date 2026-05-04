package dev.angelcorzo.nivo.api.commons;

import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;

public final class TimezoneConverter {

  private static final ZoneId BOGOTA = ZoneId.of("America/Bogota");

  private TimezoneConverter() {}

  public static ZonedDateTime toBogota(OffsetDateTime utc) {
    if (utc == null) return null;
    return utc.atZoneSameInstant(BOGOTA);
  }
}
