package dev.angelcorzo.nivo.api.commons;

import static org.junit.jupiter.api.Assertions.*;

import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import org.junit.jupiter.api.Test;

class TimezoneConverterTest {

  @Test
  void convertsUtcToBogota() {
    OffsetDateTime utc = OffsetDateTime.of(2025, 5, 3, 0, 20, 37, 0, ZoneOffset.UTC);
    ZonedDateTime result = TimezoneConverter.toBogota(utc);

    assertEquals(ZoneId.of("America/Bogota"), result.getZone());
    assertEquals(2025, result.getYear());
    assertEquals(5, result.getMonthValue());
    assertEquals(2, result.getDayOfMonth());
    assertEquals(19, result.getHour());
    assertEquals(20, result.getMinute());
    assertEquals(37, result.getSecond());
  }

  @Test
  void returnsNullForNullInput() {
    assertNull(TimezoneConverter.toBogota(null));
  }
}
