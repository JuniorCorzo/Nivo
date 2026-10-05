package dev.angelcorzo.nivo.infrastructure.entrypoint.rest.parkinglots.mappers;

import dev.angelcorzo.nivo.infrastructure.entrypoint.rest.commons.config.MapperStructConfig;
import dev.angelcorzo.nivo.infrastructure.entrypoint.rest.parkinglots.dto.request.UpsertParkingLotsRequest;
import dev.angelcorzo.nivo.infrastructure.entrypoint.rest.parkinglots.dto.response.ParkingLotListItemResponse;
import dev.angelcorzo.nivo.infrastructure.entrypoint.rest.parkinglots.dto.response.ParkingLotsResponse;
import dev.angelcorzo.nivo.domain.model.parkinglots.ParkingLotListItem;
import dev.angelcorzo.nivo.domain.model.parkinglots.ParkingLotPolicy;
import dev.angelcorzo.nivo.domain.model.parkinglots.ParkingLots;
import dev.angelcorzo.nivo.domain.model.parkinglots.dto.UpsertParkingLotsDTO;
import java.math.BigDecimal;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(config = MapperStructConfig.class)
public interface ParkingLotsMapper {
  @Mapping(target = "policy", expression = "java(toPolicy(dto))")
  UpsertParkingLotsDTO toModel(UpsertParkingLotsRequest dto);

  @Mapping(target = "gracePeriodMinutes", expression = "java(model.getPolicy().gracePeriodMinutes())")
  @Mapping(target = "gracePeriodPrice", expression = "java(model.getPolicy().gracePeriodPrice())")
  @Mapping(target = "ivaRate", expression = "java(model.getPolicy().ivaRate())")
  ParkingLotsResponse toDTO(ParkingLots model);

  @Mapping(target = "gracePeriodMinutes", expression = "java(model.policy() != null ? model.policy().gracePeriodMinutes() : 0)")
  @Mapping(target = "gracePeriodPrice", expression = "java(model.policy() != null ? model.policy().gracePeriodPrice() : java.math.BigDecimal.ZERO)")
  @Mapping(target = "ivaRate", expression = "java(model.policy() != null ? model.policy().ivaRate() : new java.math.BigDecimal(\"0.19\"))")
  ParkingLotListItemResponse toListItemResponse(ParkingLotListItem model);

  default ParkingLotPolicy toPolicy(UpsertParkingLotsRequest dto) {
    if (dto == null) {
      return ParkingLotPolicy.defaults();
    }
    int minutes = dto.gracePeriodMinutes() != null ? dto.gracePeriodMinutes() : 0;
    BigDecimal price = dto.gracePeriodPrice() != null ? dto.gracePeriodPrice() : BigDecimal.ZERO;
    BigDecimal iva = dto.ivaRate() != null ? dto.ivaRate() : new BigDecimal("0.19");
    return new ParkingLotPolicy(minutes, price, iva);
  }
}
