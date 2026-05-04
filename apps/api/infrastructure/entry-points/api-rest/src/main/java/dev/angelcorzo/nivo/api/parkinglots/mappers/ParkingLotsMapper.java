package dev.angelcorzo.nivo.api.parkinglots.mappers;

import dev.angelcorzo.nivo.api.commons.config.MapperStructConfig;
import dev.angelcorzo.nivo.api.parkinglots.dto.ParkingLotListItemResponse;
import dev.angelcorzo.nivo.api.parkinglots.dto.ParkingLotsResponse;
import dev.angelcorzo.nivo.api.parkinglots.dto.UpsertParkingLotsRequest;
import dev.angelcorzo.nivo.model.parkinglots.ParkingLotListItem;
import dev.angelcorzo.nivo.model.parkinglots.ParkingLots;
import dev.angelcorzo.nivo.model.parkinglots.dto.UpsertParkingLotsDTO;
import org.mapstruct.Mapper;

@Mapper(config = MapperStructConfig.class)
public interface ParkingLotsMapper {
  UpsertParkingLotsDTO toModel(UpsertParkingLotsRequest dto);

  ParkingLotsResponse toDTO(ParkingLots model);

  ParkingLotListItemResponse toListItemResponse(ParkingLotListItem model);
}
