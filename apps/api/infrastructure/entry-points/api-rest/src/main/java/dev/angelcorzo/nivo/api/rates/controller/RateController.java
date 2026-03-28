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
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.hibernate.validator.constraints.UUID;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController()
@RequestMapping("/rates")
@RequiredArgsConstructor
public class RateController {
  private final RatesMapper ratesMapper;

  private final UpdateRateUseCase updateRateUseCase;
  private final DeleteRateUseCase deleteRateUseCase;
  private final CalculateRateUseCase calculateRateUseCase;

  @GetMapping("/{ticketId}/calculate")
  @PreAuthorize("hasRole('OPERATOR')")
  public Response<PriceDetailed> calculatePrice(@PathVariable("ticketId") java.util.UUID ticketId) {
    final PriceDetailed rateCalculated = this.calculateRateUseCase.execute(ticketId);

    return Response.ok(rateCalculated, RateMessages.CALCULATE_PRICE.format());
  }

  @PutMapping("/update")
  @PreAuthorize("hasRole('OWNER')")
  public Response<RatesDTO> updateRate(@RequestBody @Valid UpdateRate rate) {
    final UpdateRateUseCase.UpdateRate updateRate = this.ratesMapper.toModel(rate);
    final Rates rateUpdated = this.updateRateUseCase.execute(updateRate);

    return Response.ok(
        this.ratesMapper.toDTO(rateUpdated), RateMessages.UPDATED_RATE_SUCCESSFULLY.format());
  }

  @DeleteMapping("/{id}/delete")
  @PreAuthorize("hasRole('OWNER')")
  public Response<Void> deleteRate(@PathVariable @UUID java.util.UUID id) {
    this.deleteRateUseCase.execute(id);
    return Response.ok(null, RateMessages.DELETE_RATE_SUCCESSFULLY.format());
  }
}
