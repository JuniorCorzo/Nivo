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
import dev.angelcorzo.nivo.usecase.getactiveparkingticketbyslot.GetActiveParkingTicketBySlotUseCase;
import dev.angelcorzo.nivo.usecase.listparkingticketsbyparkinglot.ListParkingTicketsByParkingLotUseCase;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/tickets")
@Tag(name = "Parking Tickets", description = "Vehicle check-in and check-out ticket management")
@RequiredArgsConstructor
public class ParkingTicketsController {
  private final CheckInVehicleWithoutReservationUseCase checkInVehicleWithoutReservationUseCase;
  private final CheckOutVehicleUseCase checkOutVehicleUseCase;
  private final ListParkingTicketsByParkingLotUseCase listParkingTicketsByParkingLotUseCase;
  private final GetActiveParkingTicketBySlotUseCase getActiveParkingTicketBySlotUseCase;

  private final AuthenticationContextGateway authenticationContext;
  private final ParkingTicketMapper parkingTicketMapper;
  private final PaymentsMapper paymentsMapper;

  @Operation(
      summary = "List parking tickets by parking lot",
      description = "Retrieves all parking tickets belonging to a specific parking lot")
  @ApiResponses({
    @ApiResponse(responseCode = "200", description = "Tickets retrieved successfully"),
    @ApiResponse(responseCode = "403", description = "Forbidden - Operator role required")
  })
  @GetMapping("/list")
  @PreAuthorize("hasRole('OPERATOR')")
  public Response<List<ParkingTicketsDTO>> listTickets(
      @Parameter(description = "Parking lot ID", required = true) @RequestParam("parking") UUID parkingLotId) {
    final List<ParkingTicketsDTO> tickets =
        this.listParkingTicketsByParkingLotUseCase.execute(parkingLotId).stream()
            .map(this.parkingTicketMapper::toDto)
            .toList();

    return Response.ok(tickets, "Tickets retrieved successfully");
  }

  @Operation(
      summary = "Get active parking ticket by slot",
      description = "Retrieves the active OPEN ticket for a specific slot, if any")
  @ApiResponses({
    @ApiResponse(responseCode = "200", description = "Active ticket retrieved successfully"),
    @ApiResponse(responseCode = "403", description = "Forbidden - Operator role required")
  })
  @GetMapping("/active")
  @PreAuthorize("hasRole('OPERATOR')")
  public Response<ParkingTicketsDTO> getActiveTicket(
      @Parameter(description = "Slot ID", required = true) @RequestParam("slot") UUID slotId) {
    final ParkingTicketsDTO ticket =
        this.getActiveParkingTicketBySlotUseCase.execute(slotId)
            .map(this.parkingTicketMapper::toDto)
            .orElse(null);

    return Response.ok(ticket, "Active ticket retrieved successfully");
  }

  @Operation(
      summary = "Vehicle check-in",
      description = "Registers vehicle entry without prior reservation and generates a parking ticket")
  @ApiResponses({
    @ApiResponse(responseCode = "201", description = "Ticket created successfully"),
    @ApiResponse(responseCode = "400", description = "Invalid payload or slot unavailable"),
    @ApiResponse(responseCode = "403", description = "Forbidden - Operator role required")
  })
  @PostMapping("/check-in")
  @PreAuthorize("hasRole('OPERATOR')")
  @ResponseStatus(HttpStatus.CREATED)
  public Response<ParkingTicketsDTO> createTicket(@RequestBody @Valid CreateTicket createTicket) {
    final UUID tenantId = this.authenticationContext.getCurrentTenantId();

    final ParkingTickets ticket =
        this.checkInVehicleWithoutReservationUseCase.execute(
            this.parkingTicketMapper.toModel(createTicket).toBuilder()
                .tenantId(tenantId)
                .email(createTicket.email())
                .build());

    return Response.created(this.parkingTicketMapper.toDto(ticket), "Ticket created successfully");
  }

  @Operation(
      summary = "Vehicle check-out",
      description = "Calculates total charge, processes checkout, and creates a payment record")
  @ApiResponses({
    @ApiResponse(responseCode = "201", description = "Vehicle checked out and payment created"),
    @ApiResponse(responseCode = "400", description = "Invalid checkout command"),
    @ApiResponse(responseCode = "403", description = "Forbidden - Operator role required")
  })
  @PostMapping("/check-out")
  @PreAuthorize("hasRole('OPERATOR')")
  @ResponseStatus(HttpStatus.CREATED)
  public Response<PaymentsDTO> checkOutVehicle(@RequestBody @Valid CheckOutCommand checkOutCommand) {
    final CheckOut checkOut = this.paymentsMapper.toModel(checkOutCommand);

    Payments payment = this.checkOutVehicleUseCase.execute(checkOut);

    return Response.created(this.paymentsMapper.toDto(payment), "Checkout processed successfully");
  }
}
