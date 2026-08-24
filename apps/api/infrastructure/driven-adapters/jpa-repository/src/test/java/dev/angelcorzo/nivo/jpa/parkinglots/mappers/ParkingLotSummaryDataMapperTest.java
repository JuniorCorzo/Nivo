package dev.angelcorzo.nivo.jpa.parkinglots.mappers;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import dev.angelcorzo.nivo.jpa.parkinglots.ParkingLotSummaryData;
import jakarta.persistence.Tuple;
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

    Tuple row = mock(Tuple.class);
    when(row.get("id", UUID.class)).thenReturn(parkingLotId);
    when(row.get("name", String.class)).thenReturn("Parking Central");
    when(row.get("currency", String.class)).thenReturn("COP");
    when(row.get("created_at")).thenReturn(createdAt);
    when(row.get("updated_at")).thenReturn(updatedAt);
    when(row.get("deleted_at")).thenReturn(deletedAt);
    when(row.get("street", String.class)).thenReturn("Calle 10");
    when(row.get("city", String.class)).thenReturn("Cúcuta");
    when(row.get("state", String.class)).thenReturn("Norte de Santander");
    when(row.get("country", String.class)).thenReturn("Colombia");
    when(row.get("zip_code", String.class)).thenReturn("540001");
    when(row.get("latitude")).thenReturn(BigDecimal.valueOf(7.89391));
    when(row.get("longitude")).thenReturn(BigDecimal.valueOf(-72.50782));
    when(row.get("slot_distribution", String.class)).thenReturn("[{\"type\":\"CAR\",\"count\":10}]");
    when(row.get("owner_name", String.class)).thenReturn("Juan Pérez");
    when(row.get("total_capacity")).thenReturn(BigDecimal.valueOf(10));

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
