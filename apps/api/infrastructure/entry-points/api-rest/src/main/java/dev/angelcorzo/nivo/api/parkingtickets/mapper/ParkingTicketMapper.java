package dev.angelcorzo.nivo.api.parkingtickets.mapper;

import dev.angelcorzo.nivo.api.commons.TimezoneConverter;
import dev.angelcorzo.nivo.api.commons.config.MapperStructConfig;
import dev.angelcorzo.nivo.api.parkingtickets.dto.CreateTicket;
import dev.angelcorzo.nivo.api.parkingtickets.dto.ParkingTicketsDTO;
import dev.angelcorzo.nivo.model.parkingtickets.ParkingTickets;
import dev.angelcorzo.nivo.usecase.checkinvehiclewithoureservation.CheckInVehicleWithoutReservationUseCase;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(config = MapperStructConfig.class, uses = TimezoneConverter.class)
public interface ParkingTicketMapper {
  CheckInVehicleWithoutReservationUseCase.CreatedParkingTicket toModel(CreateTicket dto);

  @Mapping(target = "entryTime", expression = "java(dev.angelcorzo.nivo.api.commons.TimezoneConverter.toBogota(model.getEntryTime()))")
  @Mapping(target = "exitTime", expression = "java(dev.angelcorzo.nivo.api.commons.TimezoneConverter.toBogota(model.getExitTime()))")
  @Mapping(target = "createdAt", expression = "java(dev.angelcorzo.nivo.api.commons.TimezoneConverter.toBogota(model.getCreatedAt()))")
  @Mapping(target = "updatedAt", expression = "java(dev.angelcorzo.nivo.api.commons.TimezoneConverter.toBogota(model.getUpdatedAt()))")
  @Mapping(target = "deletedAt", expression = "java(dev.angelcorzo.nivo.api.commons.TimezoneConverter.toBogota(model.getDeletedAt()))")
  ParkingTicketsDTO toDto(ParkingTickets model);
}
