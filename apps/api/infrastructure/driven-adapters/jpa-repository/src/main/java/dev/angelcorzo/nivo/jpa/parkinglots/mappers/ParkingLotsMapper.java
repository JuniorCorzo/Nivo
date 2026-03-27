package dev.angelcorzo.nivo.jpa.parkinglots.mappers;

import dev.angelcorzo.nivo.jpa.config.MapperStructConfig;
import dev.angelcorzo.nivo.jpa.mappers.BaseMapper;
import dev.angelcorzo.nivo.jpa.parkinglots.ParkingLotsData;
import dev.angelcorzo.nivo.model.parkinglots.ParkingLots;
import org.mapstruct.Mapper;

@Mapper(config = MapperStructConfig.class)
public interface ParkingLotsMapper extends BaseMapper<ParkingLots, ParkingLotsData> {}
