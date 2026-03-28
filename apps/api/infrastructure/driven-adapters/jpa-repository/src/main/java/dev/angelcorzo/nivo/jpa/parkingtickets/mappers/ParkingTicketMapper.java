package dev.angelcorzo.nivo.jpa.parkingtickets.mappers;

import dev.angelcorzo.nivo.jpa.config.MapperStructConfig;
import dev.angelcorzo.nivo.jpa.mappers.BaseMapper;
import dev.angelcorzo.nivo.jpa.parkingtickets.ParkingTicketsData;
import dev.angelcorzo.nivo.model.parkingtickets.ParkingTickets;
import org.mapstruct.Mapper;

@Mapper(config = MapperStructConfig.class)
public interface ParkingTicketMapper extends BaseMapper<ParkingTickets, ParkingTicketsData> {}
