package dev.angelcorzo.nivo.jpa.parkinglots.mappers;

import static org.assertj.core.api.Assertions.assertThat;

import dev.angelcorzo.nivo.jpa.parkinglots.ParkingLotSummaryData;
import java.math.BigDecimal;
import java.sql.Timestamp;
import java.time.Instant;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.UUID;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class ParkingLotSummaryDataMapperTest {

  private final ParkingLotSummaryDataMapper mapper = new ParkingLotSummaryDataMapper();

  @Test
  @DisplayName("Should map native row values into summary data")
  void shouldMapNativeRowToSummaryData() {
    UUID parkingLotId = UUID.randomUUID();
    Instant createdAt = Instant.parse("2026-04-18T00:00:00Z");
    OffsetDateTime updatedAt = OffsetDateTime.of(2026, 4, 18, 1, 0, 0, 0, ZoneOffset.UTC);
    Timestamp deletedAt = Timestamp.from(Instant.parse("2026-04-18T02:00:00Z"));

    Object[] row = {
      parkingLotId,
      "Parking Central",
      "COP",
      createdAt,
      updatedAt,
      deletedAt,
      "Calle 10",
      "Cúcuta",
      "Norte de Santander",
      "Colombia",
      "540001",
      BigDecimal.valueOf(7.89391),
      BigDecimal.valueOf(-72.50782),
      "[{\"type\":\"CAR\",\"count\":10}]",
      "Juan Pérez",
      BigDecimal.valueOf(10)
    };

    ParkingLotSummaryData result = mapper.toSummaryData(row);

    assertThat(result.id()).isEqualTo(parkingLotId);
    assertThat(result.name()).isEqualTo("Parking Central");
    assertThat(result.currency()).isEqualTo("COP");
    assertThat(result.createdAt()).isEqualTo(createdAt);
    assertThat(result.updatedAt()).isEqualTo(updatedAt.toInstant());
    assertThat(result.deletedAt()).isEqualTo(deletedAt.toInstant());
    assertThat(result.street()).isEqualTo("Calle 10");
    assertThat(result.city()).isEqualTo("Cúcuta");
    assertThat(result.state()).isEqualTo("Norte de Santander");
    assertThat(result.country()).isEqualTo("Colombia");
    assertThat(result.zipCode()).isEqualTo("540001");
    assertThat(result.latitude()).isEqualTo(7.89391);
    assertThat(result.longitude()).isEqualTo(-72.50782);
    assertThat(result.slotDistribution()).isEqualTo("[{\"type\":\"CAR\",\"count\":10}]");
    assertThat(result.ownerName()).isEqualTo("Juan Pérez");
    assertThat(result.totalCapacity()).isEqualTo(10L);
  }
}
