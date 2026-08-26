package dev.angelcorzo.nivo.api.rates.controller;

import dev.angelcorzo.nivo.api.commons.dto.Response;
import dev.angelcorzo.nivo.api.rates.dto.RatesDTO;
import dev.angelcorzo.nivo.api.rates.dto.UpdateRate;
import dev.angelcorzo.nivo.api.rates.enums.RateMessages;
import dev.angelcorzo.nivo.api.rates.mappers.RatesMapper;
import dev.angelcorzo.nivo.model.rates.Rates;
import dev.angelcorzo.nivo.usecase.calculaterate.CalculateRateUseCase;
import dev.angelcorzo.nivo.usecase.calculaterate.dtos.PriceDetailed;
import dev.angelcorzo.nivo.usecase.deleterate.DeleteRateUseCase;
import dev.angelcorzo.nivo.usecase.updaterate.UpdateRateUseCase;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.hibernate.validator.constraints.UUID;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/rates")
@Tag(name = "Rates", description = "Parking rate calculation, updating and deletion")
@RequiredArgsConstructor
public class RateController {
  private final RatesMapper ratesMapper;

  private final UpdateRateUseCase updateRateUseCase;
  private final DeleteRateUseCase deleteRateUseCase;
  private final CalculateRateUseCase calculateRateUseCase;

  @Operation(
      summary = "Calculate parking ticket price",
      description = "Calculates the detailed amount to charge for a parking ticket based on duration and rates")
  @ApiResponses({
    @ApiResponse(responseCode = "200", description = "Price calculated successfully"),
    @ApiResponse(responseCode = "403", description = "Forbidden - Operator role required"),
    @ApiResponse(responseCode = "404", description = "Ticket not found")
  })
  @GetMapping("/{ticketId}/calculate")
  @PreAuthorize("hasRole('OPERATOR')")
  public Response<PriceDetailed> calculatePrice(
      @Parameter(description = "Ticket ID", required = true) @PathVariable("ticketId") java.util.UUID ticketId) {
    final PriceDetailed rateCalculated = this.calculateRateUseCase.execute(ticketId);

    return Response.ok(rateCalculated, RateMessages.CALCULATE_PRICE.format());
  }

  @Operation(
      summary = "Update tariff rate",
      description = "Updates the configuration of an existing tariff rate")
  @ApiResponses({
    @ApiResponse(responseCode = "200", description = "Rate updated successfully"),
    @ApiResponse(responseCode = "400", description = "Invalid rate payload"),
    @ApiResponse(responseCode = "403", description = "Forbidden - Owner role required")
  })
  @PutMapping("/update")
  @PreAuthorize("hasRole('OWNER')")
  public Response<RatesDTO> updateRate(@RequestBody @Valid UpdateRate rate) {
    final UpdateRateUseCase.UpdateRate updateRate = this.ratesMapper.toModel(rate);
    final Rates rateUpdated = this.updateRateUseCase.execute(updateRate);

    return Response.ok(
        this.ratesMapper.toDTO(rateUpdated), RateMessages.UPDATED_RATE_SUCCESSFULLY.format());
  }

  @Operation(
      summary = "Delete tariff rate",
      description = "Deletes a tariff rate by its ID")
  @ApiResponses({
    @ApiResponse(responseCode = "200", description = "Rate deleted successfully"),
    @ApiResponse(responseCode = "403", description = "Forbidden - Owner role required"),
    @ApiResponse(responseCode = "404", description = "Rate not found")
  })
  @DeleteMapping("/{id}/delete")
  @PreAuthorize("hasRole('OWNER')")
  public Response<Void> deleteRate(
      @Parameter(description = "Rate ID", required = true) @PathVariable java.util.UUID id) {
    this.deleteRateUseCase.execute(id);
    return Response.ok(null, RateMessages.DELETE_RATE_SUCCESSFULLY.format());
  }
}
