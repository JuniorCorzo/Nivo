package dev.angelcorzo.nivo.infrastructure.adapter.jpa.parkinglots.mappers;

import dev.angelcorzo.nivo.infrastructure.adapter.jpa.parkinglots.ParkingLotSummaryData;
import jakarta.persistence.Tuple;
import java.math.BigDecimal;
import java.sql.Timestamp;
import java.time.Instant;
import java.time.OffsetDateTime;
import java.util.UUID;
import org.springframework.stereotype.Component;

@Component
public class ParkingLotSummaryDataMapper {

  public ParkingLotSummaryData toSummaryData(Tuple row) {
    return ParkingLotSummaryData.builder()
        .id(row.get("id", UUID.class))
        .name(row.get("name", String.class))
        .currency(row.get("currency", String.class))
        .occuppationRate(toDouble(row.get("occuppation_rate")))
        .createdAt(toInstant(row.get("created_at")))
        .updatedAt(toInstant(row.get("updated_at")))
        .deletedAt(toInstant(row.get("deleted_at")))
        .street(row.get("street", String.class))
        .city(row.get("city", String.class))
        .state(row.get("state", String.class))
        .country(row.get("country", String.class))
        .zipCode(row.get("zip_code", String.class))
        .latitude(toDouble(row.get("latitude")))
        .longitude(toDouble(row.get("longitude")))
        .slotDistribution(row.get("slot_distribution", String.class))
        .ownerName(row.get("owner_name", String.class))
        .totalCapacity(toLong(row.get("total_capacity")))
        .openTime(row.get("open_time", String.class))
        .closeTime(row.get("close_time", String.class))
        .gracePeriodMinutes(toInteger(row.get("grace_period_minutes")))
        .gracePeriodPrice(toBigDecimal(row.get("grace_period_price")))
        .ivaRate(toBigDecimal(row.get("iva_rate")))
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

  private Integer toInteger(Object value) {
    return value != null ? ((Number) value).intValue() : null;
  }

  private BigDecimal toBigDecimal(Object value) {
    return switch (value) {
      case null -> null;
      case BigDecimal bd -> bd;
      case Number n -> BigDecimal.valueOf(n.doubleValue());
      default -> new BigDecimal(value.toString());
    };
  }
}
