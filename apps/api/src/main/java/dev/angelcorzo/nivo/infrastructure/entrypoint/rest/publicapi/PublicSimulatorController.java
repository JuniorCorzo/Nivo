package dev.angelcorzo.nivo.infrastructure.entrypoint.rest.publicapi;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import dev.angelcorzo.nivo.domain.usecase.rate.SimulateRateUseCase;
import dev.angelcorzo.nivo.domain.usecase.rate.dtos.PriceDetailed;
import dev.angelcorzo.nivo.domain.usecase.rate.dtos.SimulateRateCommand;

@RestController
@RequestMapping("/public/simulator")
@Tag(name = "Public Simulator", description = "Public parking fee simulation API without authentication")
@RequiredArgsConstructor
public class PublicSimulatorController {

  private final SimulateRateUseCase simulateRateUseCase;

  @PostMapping("/calculate")
  @Operation(summary = "Simulate rate calculation", description = "Calculates parking fee based on vehicle type and duration")
  @ApiResponses({
    @ApiResponse(responseCode = "200", description = "Fee simulated successfully"),
    @ApiResponse(responseCode = "400", description = "Invalid simulation payload")
  })
  public ResponseEntity<SimulateRateResponse> calculate(
    @Valid @RequestBody final SimulateRateRequest request) {
    final SimulateRateCommand command = request != null ? request.toCommand() : null;
    final PriceDetailed priceDetailed = this.simulateRateUseCase.execute(command);
    return ResponseEntity.ok(SimulateRateResponse.from(priceDetailed));
  }
}
