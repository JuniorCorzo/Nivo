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
        .createdAt(toInstant(row[3]))
        .updatedAt(toInstant(row[4]))
        .deletedAt(toInstant(row[5]))
        .street((String) row[6])
        .city((String) row[7])
        .state((String) row[8])
        .country((String) row[9])
        .zipCode((String) row[10])
        .latitude(toDouble(row[11]))
        .longitude(toDouble(row[12]))
        .slotDistribution((String) row[13])
        .ownerName((String) row[14])
        .totalCapacity(toLong(row[15]))
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
