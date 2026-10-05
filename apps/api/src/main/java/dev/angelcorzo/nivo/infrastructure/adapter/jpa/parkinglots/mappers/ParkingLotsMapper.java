package dev.angelcorzo.nivo.infrastructure.adapter.jpa.parkinglots.mappers;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import dev.angelcorzo.nivo.infrastructure.adapter.jpa.config.MapperStructConfig;
import dev.angelcorzo.nivo.infrastructure.adapter.jpa.mappers.BaseMapper;
import dev.angelcorzo.nivo.infrastructure.adapter.jpa.mappers.CoordinatesMapper;
import dev.angelcorzo.nivo.infrastructure.adapter.jpa.parkinglots.ParkingLotSummaryData;
import dev.angelcorzo.nivo.infrastructure.adapter.jpa.parkinglots.ParkingLotsData;
import dev.angelcorzo.nivo.domain.model.parkinglots.Address;
import dev.angelcorzo.nivo.domain.model.parkinglots.Coordinates;
import dev.angelcorzo.nivo.domain.model.parkinglots.OperatingHours;
import dev.angelcorzo.nivo.domain.model.parkinglots.ParkingLotListItem;
import dev.angelcorzo.nivo.domain.model.parkinglots.ParkingLotPolicy;
import dev.angelcorzo.nivo.domain.model.parkinglots.ParkingLots;
import dev.angelcorzo.nivo.domain.model.parkinglots.SlotDistributionEntry;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.OffsetDateTime;
import java.time.OffsetTime;
import java.time.ZoneOffset;
import java.util.List;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Mapper(config = MapperStructConfig.class, uses = CoordinatesMapper.class)
public abstract class ParkingLotsMapper implements BaseMapper<ParkingLots, ParkingLotsData> {

  private static final Logger LOGGER = LoggerFactory.getLogger(ParkingLotsMapper.class);

  private final ObjectMapper objectMapper;

  public ParkingLotsMapper() {
    this.objectMapper = new ObjectMapper();
  }

  public ParkingLotsMapper(ObjectMapper objectMapper) {
    this.objectMapper = objectMapper;
  }

  @Mapping(target = "policy", expression = "java(toPolicy(data))")
  public abstract ParkingLots toEntity(ParkingLotsData data);

  @Mapping(target = "gracePeriodMinutes", expression = "java(entity.getPolicy().gracePeriodMinutes())")
  @Mapping(target = "gracePeriodPrice", expression = "java(entity.getPolicy().gracePeriodPrice())")
  @Mapping(target = "ivaRate", expression = "java(entity.getPolicy().ivaRate())")
  public abstract ParkingLotsData toData(ParkingLots entity);

  protected ParkingLotPolicy toPolicy(ParkingLotsData data) {
    if (data == null)
      return ParkingLotPolicy.defaults();
    return new ParkingLotPolicy(
        data.getGracePeriodMinutes() != null ? data.getGracePeriodMinutes() : 0,
        data.getGracePeriodPrice() != null ? data.getGracePeriodPrice() : BigDecimal.ZERO,
        data.getIvaRate() != null ? data.getIvaRate() : new BigDecimal("0.19"));
  }

  protected ParkingLotPolicy toPolicy(ParkingLotSummaryData data) {
    if (data == null)
      return ParkingLotPolicy.defaults();
    return new ParkingLotPolicy(
        data.gracePeriodMinutes() != null ? data.gracePeriodMinutes() : 0,
        data.gracePeriodPrice() != null ? data.gracePeriodPrice() : BigDecimal.ZERO,
        data.ivaRate() != null ? data.ivaRate() : new BigDecimal("0.19"));
  }

  @Mapping(target = "address", expression = "java(toAddress(data))")
  @Mapping(target = "coordinates", expression = "java(toCoordinates(data))")
  @Mapping(target = "createdAt", source = "createdAt")
  @Mapping(target = "updatedAt", source = "updatedAt")
  @Mapping(target = "slotDistribution", source = "slotDistribution")
  @Mapping(target = "operatingHours", expression = "java(toOperatingHours(data))")
  @Mapping(target = "policy", expression = "java(toPolicy(data))")
  public abstract ParkingLotListItem toListItem(ParkingLotSummaryData data);

  protected Address toAddress(ParkingLotSummaryData data) {
    return Address.builder()
        .street(data.street())
        .city(data.city())
        .state(data.state())
        .country(data.country())
        .zipCode(data.zipCode())
        .build();
  }

  protected Coordinates toCoordinates(ParkingLotSummaryData data) {
    return Coordinates.builder()
        .latitude(data.latitude())
        .longitude(data.longitude())
        .build();
  }

  protected OperatingHours toOperatingHours(ParkingLotSummaryData data) {
    if (data.openTime() == null && data.closeTime() == null) {
      return null;
    }
    return OperatingHours.builder()
        .openTime(parseOffsetTime(data.openTime()))
        .closeTime(parseOffsetTime(data.closeTime()))
        .build();
  }

  private OffsetTime parseOffsetTime(String text) {
    if (text == null || text.isBlank())
      return null;
    // Postgres devuelve offsets como -05 (sin minutos).
    // OffsetTime.parse() espera ISO-8601: -05:00
    String normalized = text.replaceFirst("([+-]\\d{2})$", "$1:00");
    return OffsetTime.parse(normalized);
  }

  protected OffsetDateTime map(Instant instant) {
    return instant != null ? instant.atOffset(ZoneOffset.UTC) : null;
  }

  protected List<SlotDistributionEntry> map(String slotDistribution) {
    if (slotDistribution == null || slotDistribution.isBlank()) {
      return List.of();
    }

    try {
      return objectMapper.readValue(slotDistribution, new TypeReference<>() {
      });
    } catch (JsonProcessingException e) {
      LOGGER.warn("Failed to parse slot distribution JSON: {}", slotDistribution, e);
      return List.of();
    }
  }
}
