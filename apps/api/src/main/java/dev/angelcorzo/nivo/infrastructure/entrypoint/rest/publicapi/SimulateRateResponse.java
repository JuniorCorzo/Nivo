package dev.angelcorzo.nivo.infrastructure.entrypoint.rest.publicapi;

import java.math.BigDecimal;
import java.util.List;

import io.swagger.v3.oas.annotations.media.Schema;

import dev.angelcorzo.nivo.domain.usecase.rate.dtos.PriceDetailed;
import dev.angelcorzo.nivo.domain.usecase.rate.dtos.PriceLine;

@Schema(
    description = "Response containing simulated parking fee details and calculation breakdown",
    requiredProperties = {
      "name",
      "subtotal",
      "ivaRate",
      "ivaAmount",
      "total",
      "breakpoints"
    })
public record SimulateRateResponse(
    @Schema(
        description = "Name of the rate applied in simulation",
        example = "Simulador Nivo",
        requiredMode = Schema.RequiredMode.REQUIRED)
    String name,

    @Schema(
        description = "Subtotal amount before taxes",
        example = "8000.00",
        requiredMode = Schema.RequiredMode.REQUIRED)
    BigDecimal subtotal,

    @Schema(
        description = "Applicable IVA/VAT rate in decimal format",
        example = "0.19",
        requiredMode = Schema.RequiredMode.REQUIRED)
    BigDecimal ivaRate,

    @Schema(
        description = "Calculated IVA/VAT tax amount",
        example = "1520.00",
        requiredMode = Schema.RequiredMode.REQUIRED)
    BigDecimal ivaAmount,

    @Schema(
        description = "Total simulated fee including taxes",
        example = "9520.00",
        requiredMode = Schema.RequiredMode.REQUIRED)
    BigDecimal total,

    @Schema(
        description = "Detailed price line breakdowns for the stay duration",
        example = "[{\"concept\": \"Tarifa CAR (2 Horas * 4000 COP/Horas)\", \"amount\": 8000.00}]",
        requiredMode = Schema.RequiredMode.REQUIRED)
    List<PriceLine> breakpoints
) {

  public static SimulateRateResponse from(final PriceDetailed detailed) {
    if (detailed == null) {
      return null;
    }
    final List<PriceLine> lines =
        detailed.getBreakpoint() != null
            ? List.copyOf(detailed.getBreakpoint())
            : List.of();

    return new SimulateRateResponse(
        detailed.getName(),
        detailed.getSubtotal(),
        detailed.getIvaRate(),
        detailed.getIvaAmount(),
        detailed.getTotal(),
        lines
    );
  }
}
