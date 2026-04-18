package dev.angelcorzo.nivo.jpa.parkinglots.mappers;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import dev.angelcorzo.nivo.jpa.config.MapperStructConfig;
import dev.angelcorzo.nivo.jpa.mappers.BaseMapper;
import dev.angelcorzo.nivo.jpa.mappers.CoordinatesMapper;
import dev.angelcorzo.nivo.jpa.parkinglots.ParkingLotSummaryData;
import dev.angelcorzo.nivo.jpa.parkinglots.ParkingLotsData;
import dev.angelcorzo.nivo.model.parkinglots.Address;
import dev.angelcorzo.nivo.model.parkinglots.Coordinates;
import dev.angelcorzo.nivo.model.parkinglots.ParkingLotListItem;
import dev.angelcorzo.nivo.model.parkinglots.ParkingLots;
import dev.angelcorzo.nivo.model.parkinglots.SlotDistributionEntry;
import java.time.Instant;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.springframework.beans.factory.annotation.Autowired;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Mapper(config = MapperStructConfig.class, uses = CoordinatesMapper.class)
public abstract class ParkingLotsMapper implements BaseMapper<ParkingLots, ParkingLotsData> {

  private static final Logger LOGGER = LoggerFactory.getLogger(ParkingLotsMapper.class);

  @Autowired protected ObjectMapper objectMapper;

  @Mapping(target = "address", expression = "java(toAddress(data))")
  @Mapping(target = "coordinates", expression = "java(toCoordinates(data))")
  @Mapping(target = "createdAt", source = "createdAt")
  @Mapping(target = "updatedAt", source = "updatedAt")
  @Mapping(target = "slotDistribution", source = "slotDistribution")
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

  protected OffsetDateTime map(Instant instant) {
    return instant != null ? instant.atOffset(ZoneOffset.UTC) : null;
  }

  protected List<SlotDistributionEntry> map(String slotDistribution) {
    if (slotDistribution == null || slotDistribution.isBlank()) {
      return List.of();
    }

    try {
      return objectMapper.readValue(slotDistribution, new TypeReference<>() {});
    } catch (JsonProcessingException e) {
      LOGGER.warn("Failed to parse slot distribution JSON: {}", slotDistribution, e);
      return List.of();
    }
  }
}
