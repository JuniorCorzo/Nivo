package dev.angelcorzo.nivo.infrastructure.entrypoint.rest.parkingtickets.mapper;

import dev.angelcorzo.nivo.infrastructure.entrypoint.rest.commons.TimezoneConverter;
import dev.angelcorzo.nivo.infrastructure.entrypoint.rest.commons.config.MapperStructConfig;
import dev.angelcorzo.nivo.infrastructure.entrypoint.rest.parkingtickets.dto.CreateTicket;
import dev.angelcorzo.nivo.infrastructure.entrypoint.rest.parkingtickets.dto.ParkingTicketsDTO;
import dev.angelcorzo.nivo.domain.model.parkingtickets.ParkingTickets;
import dev.angelcorzo.nivo.domain.usecase.ticket.CheckinVehicleUseCase;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(config = MapperStructConfig.class, uses = TimezoneConverter.class)
public interface ParkingTicketMapper {
  CheckinVehicleUseCase.CreatedParkingTicket toModel(CreateTicket dto);

  @Mapping(target = "entryTime", expression = "java(dev.angelcorzo.nivo.infrastructure.entrypoint.rest.commons.TimezoneConverter.toBogota(model.getEntryTime()))")
  @Mapping(target = "exitTime", expression = "java(dev.angelcorzo.nivo.infrastructure.entrypoint.rest.commons.TimezoneConverter.toBogota(model.getExitTime()))")
  @Mapping(target = "createdAt", expression = "java(dev.angelcorzo.nivo.infrastructure.entrypoint.rest.commons.TimezoneConverter.toBogota(model.getCreatedAt()))")
  @Mapping(target = "updatedAt", expression = "java(dev.angelcorzo.nivo.infrastructure.entrypoint.rest.commons.TimezoneConverter.toBogota(model.getUpdatedAt()))")
  @Mapping(target = "deletedAt", expression = "java(dev.angelcorzo.nivo.infrastructure.entrypoint.rest.commons.TimezoneConverter.toBogota(model.getDeletedAt()))")
  ParkingTicketsDTO toDto(ParkingTickets model);
}
