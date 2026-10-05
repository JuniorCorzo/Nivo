package dev.angelcorzo.nivo.domain.usecase.rate.dtos;

import java.math.BigDecimal;

public record PriceLine(String concept, BigDecimal amount) {
  public static PriceLine of(String concept, BigDecimal amount) {
    return new PriceLine(concept, amount);
  }
}
