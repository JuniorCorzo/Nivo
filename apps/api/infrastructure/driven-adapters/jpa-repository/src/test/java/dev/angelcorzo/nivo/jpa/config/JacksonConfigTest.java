package dev.angelcorzo.nivo.jpa.config;

import static org.junit.jupiter.api.Assertions.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import org.junit.jupiter.api.Test;

class JacksonConfigTest {

  private final ObjectMapper objectMapper = new JacksonConfig().objectMapper();

  @Test
  void serializesOffsetDateTimeAsIso8601() throws Exception {
    OffsetDateTime dt = OffsetDateTime.of(2025, 5, 3, 0, 20, 37, 0, ZoneOffset.UTC);
    String json = objectMapper.writeValueAsString(dt);
    assertEquals("\"2025-05-03T00:20:37Z\"", json);
  }

  @Test
  void doesNotSerializeDatesAsTimestamps() {
    assertFalse(objectMapper.isEnabled(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS));
  }
}
