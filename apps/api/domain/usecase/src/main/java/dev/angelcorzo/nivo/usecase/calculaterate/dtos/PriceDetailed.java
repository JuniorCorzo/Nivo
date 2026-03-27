package dev.angelcorzo.nivo.usecase.calculaterate.dtos;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.LinkedList;
import java.util.Objects;

import lombok.Getter;

@Getter
public final class PriceDetailed {
  private final String name;
  private final LinkedList<PriceLine> breakpoint = new LinkedList<>();
  private BigDecimal ivaAmount = BigDecimal.ZERO;
  private BigDecimal total = BigDecimal.ZERO;
  private BigDecimal ivaRate = BigDecimal.ZERO;
  private BigDecimal subtotal = BigDecimal.ZERO;

  private PriceDetailed(String name) {
    this.name = name;
  }

  public static PriceDetailed of(String name) {
    return new PriceDetailed(name);
  }

  public void addLine(PriceLine breakpoint) {
    this.breakpoint.add(breakpoint);
    this.subtotal = this.subtotal.add(breakpoint.amount());
    this.recalculatedTotal();
  }

  public void setIvaRate(BigDecimal ivaRate) {
    this.ivaRate = ivaRate;
    this.recalculatedTotal();
  }

  public void recalculatedTotal() {
    final BigDecimal ivaAmount = this.subtotal.multiply(this.ivaRate).setScale(2, RoundingMode.HALF_UP);
    this.ivaAmount = ivaAmount;
    this.total = this.subtotal.add(ivaAmount);
  }

  @Override
  public boolean equals(Object o) {
    if (this == o) return true;
    if (o == null || getClass() != o.getClass()) return false;
    PriceDetailed that = (PriceDetailed) o;
    return Objects.equals(ivaRate, that.ivaRate)
        && java.util.Objects.equals(name, that.name)
        && java.util.Objects.equals(subtotal, that.subtotal)
        && java.util.Objects.equals(ivaAmount, that.ivaAmount)
        && java.util.Objects.equals(total, that.total);
  }

  @Override
  public int hashCode() {
    return java.util.Objects.hash(name, subtotal, ivaRate, ivaAmount, total);
  }

  @Override
  public String toString() {
    return "PriceDetailed["
        + "name="
        + name
        + ", "
        + "subtotal="
        + subtotal
        + ", "
        + "ivaRate="
        + ivaRate
        + ", "
        + "ivaAmount="
        + ivaAmount
        + ", "
        + "total="
        + total
        + ']';
  }
}
