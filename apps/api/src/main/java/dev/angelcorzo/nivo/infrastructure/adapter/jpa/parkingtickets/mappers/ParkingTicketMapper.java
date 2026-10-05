package dev.angelcorzo.nivo.infrastructure.adapter.jpa.parkingtickets.mappers;

import dev.angelcorzo.nivo.infrastructure.adapter.jpa.config.MapperStructConfig;
import dev.angelcorzo.nivo.infrastructure.adapter.jpa.mappers.BaseMapper;
import dev.angelcorzo.nivo.infrastructure.adapter.jpa.parkingtickets.ParkingTicketsData;
import dev.angelcorzo.nivo.domain.model.parkingtickets.ParkingTickets;
import org.mapstruct.Mapper;

@Mapper(config = MapperStructConfig.class)
public interface ParkingTicketMapper extends BaseMapper<ParkingTickets, ParkingTicketsData> {}
