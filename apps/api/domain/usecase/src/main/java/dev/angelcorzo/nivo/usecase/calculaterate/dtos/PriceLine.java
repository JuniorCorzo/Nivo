package dev.angelcorzo.nivo.usecase.calculaterate.dtos;

import java.math.BigDecimal;

public record PriceLine(String concept, BigDecimal amount) {
  public static PriceLine of(String concept, BigDecimal amount) {
    return new PriceLine(concept, amount);
  }
}
