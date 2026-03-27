package dev.angelcorzo.nivo.api.parkingtickets.controller;

import dev.angelcorzo.nivo.api.commons.dto.Response;
import dev.angelcorzo.nivo.api.parkingtickets.dto.CreateTicket;
import dev.angelcorzo.nivo.api.parkingtickets.dto.ParkingTicketsDTO;
import dev.angelcorzo.nivo.api.parkingtickets.mapper.ParkingTicketMapper;
import dev.angelcorzo.nivo.api.payments.dtos.request.check_out.check_out.CheckOutCommand;
import dev.angelcorzo.nivo.api.payments.dtos.response.PaymentsDTO;
import dev.angelcorzo.nivo.api.payments.mappers.PaymentsMapper;
import dev.angelcorzo.nivo.model.authentication.gateway.AuthenticationContextGateway;
import dev.angelcorzo.nivo.model.parkingtickets.ParkingTickets;
import dev.angelcorzo.nivo.model.payments.Payments;
import dev.angelcorzo.nivo.model.payments.valueobject.check_out.CheckOut;
import dev.angelcorzo.nivo.usecase.checkinvehiclewithoureservation.CheckInVehicleWithoutReservationUseCase;
import dev.angelcorzo.nivo.usecase.checkoutvehicle.CheckOutVehicleUseCase;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/tickets")
@RequiredArgsConstructor
public class ParkingTicketsController {
  private final CheckInVehicleWithoutReservationUseCase checkInVehicleWithoutReservationUseCase;
  private final CheckOutVehicleUseCase checkOutVehicleUseCase;

  private final AuthenticationContextGateway authenticationContext;
  private final ParkingTicketMapper parkingTicketMapper;
  private final PaymentsMapper paymentsMapper;

  @PostMapping("/check-in")
  @PreAuthorize("hasRole('OPERATOR')")
  public Response<ParkingTicketsDTO> createTicket(@RequestBody CreateTicket createTicket) {
    final UUID tenantId = this.authenticationContext.getCurrentTenantId();

    final ParkingTickets ticket =
        this.checkInVehicleWithoutReservationUseCase.execute(
            this.parkingTicketMapper.toModel(createTicket).toBuilder()
                .tenantId(tenantId)
                .email(createTicket.email())
                .build());

    return Response.created(this.parkingTicketMapper.toDto(ticket), "");
  }

  @PostMapping("/check-out")
  @PreAuthorize("hasRole('OPERATOR')")
  @ResponseStatus(HttpStatus.CREATED)
  public Response<PaymentsDTO> checkOutVehicle(@RequestBody CheckOutCommand checkOutCommand) {
    final CheckOut checkOut = this.paymentsMapper.toModel(checkOutCommand);

    Payments payment = this.checkOutVehicleUseCase.execute(checkOut);

    return Response.created(this.paymentsMapper.toDto(payment), "Created");
  }
}
