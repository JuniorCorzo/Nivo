package dev.angelcorzo.nivo.jpa.parkinglots.mappers;

import dev.angelcorzo.nivo.jpa.parkinglots.ParkingLotSummaryData;
import java.sql.Timestamp;
import java.time.Instant;
import java.time.OffsetDateTime;
import java.util.UUID;
import org.springframework.stereotype.Component;

@Component
public class ParkingLotSummaryDataMapper {

  public ParkingLotSummaryData toSummaryData(Object[] row) {
    return ParkingLotSummaryData.builder()
        .id((UUID) row[0])
        .name((String) row[1])
        .currency((String) row[2])
        .occuppationRate(toDouble(row[3]))
        .createdAt(toInstant(row[4]))
        .updatedAt(toInstant(row[5]))
        .deletedAt(toInstant(row[6]))
        .street((String) row[7])
        .city((String) row[8])
        .state((String) row[9])
        .country((String) row[10])
        .zipCode((String) row[11])
        .latitude(toDouble(row[12]))
        .longitude(toDouble(row[13]))
        .slotDistribution((String) row[14])
        .ownerName((String) row[15])
        .totalCapacity(toLong(row[16]))
        .build();
  }

  private Instant toInstant(Object value) {
    return switch (value) {
      case null -> null;
      case Instant instant -> instant;
      case OffsetDateTime offsetDateTime -> offsetDateTime.toInstant();
      case Timestamp timestamp -> timestamp.toInstant();
      default -> throw new IllegalArgumentException(
          "Unsupported timestamp type: " + value.getClass().getName());
    };
  }

  private Double toDouble(Object value) {
    return value != null ? ((Number) value).doubleValue() : null;
  }

  private Long toLong(Object value) {
    return value != null ? ((Number) value).longValue() : 0L;
  }
}
