package dev.angelcorzo.nivo.infrastructure.entrypoint.rest.publicapi;

import java.math.BigDecimal;
import java.util.List;

import dev.angelcorzo.nivo.domain.usecase.rate.dtos.PriceDetailed;
import dev.angelcorzo.nivo.domain.usecase.rate.dtos.PriceLine;

public record SimulateRateResponse(
    String name,
    BigDecimal subtotal,
    BigDecimal ivaRate,
    BigDecimal ivaAmount,
    BigDecimal total,
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
