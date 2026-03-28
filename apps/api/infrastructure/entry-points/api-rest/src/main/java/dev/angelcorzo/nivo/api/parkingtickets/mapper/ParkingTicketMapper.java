package dev.angelcorzo.nivo.api.parkingtickets.mapper;

import dev.angelcorzo.nivo.api.commons.config.MapperStructConfig;
import dev.angelcorzo.nivo.api.parkingtickets.dto.CreateTicket;
import dev.angelcorzo.nivo.api.parkingtickets.dto.ParkingTicketsDTO;
import dev.angelcorzo.nivo.model.parkingtickets.ParkingTickets;
import dev.angelcorzo.nivo.usecase.checkinvehiclewithoureservation.CheckInVehicleWithoutReservationUseCase;
import org.mapstruct.Mapper;

@Mapper(config = MapperStructConfig.class)
public interface ParkingTicketMapper {
  CheckInVehicleWithoutReservationUseCase.CreatedParkingTicket toModel(CreateTicket dto);

  ParkingTicketsDTO toDto(ParkingTickets model);
}
