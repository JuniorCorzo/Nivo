package dev.angelcorzo.nivo.infrastructure.entrypoint.rest.parkingtickets.controller;

import dev.angelcorzo.nivo.domain.model.parkingtickets.ParkingTickets;
import dev.angelcorzo.nivo.domain.usecase.ticket.GetPublicTicketUseCase;
import dev.angelcorzo.nivo.infrastructure.entrypoint.rest.commons.dto.Response;
import dev.angelcorzo.nivo.infrastructure.entrypoint.rest.parkingtickets.dto.PublicTicketDTO;
import dev.angelcorzo.nivo.infrastructure.entrypoint.rest.parkingtickets.mapper.ParkingTicketMapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/public/tickets")
@Tag(name = "Public Tickets", description = "Public parking ticket access for drivers")
@RequiredArgsConstructor
public class PublicTicketsController {
  private final GetPublicTicketUseCase getPublicTicketUseCase;
  private final ParkingTicketMapper parkingTicketMapper;

  @Operation(summary = "Get public parking ticket by ID", description = "Retrieves public parking ticket details by UUID for unauthenticated driver verification")
  @ApiResponses({@ApiResponse(responseCode = "200", description = "Public ticket retrieved successfully"),
    @ApiResponse(responseCode = "404", description = "Parking ticket not found")})
  @GetMapping("/{id}")
  public Response<PublicTicketDTO> getPublicTicket(
    @Parameter(description = "Parking ticket ID", required = true) @PathVariable("id") final UUID id) {
    final ParkingTickets ticket = this.getPublicTicketUseCase.execute(id);
    return Response.ok(this.parkingTicketMapper.toPublicDto(ticket), "Public ticket retrieved successfully");
  }
}
