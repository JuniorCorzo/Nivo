package dev.angelcorzo.nivo.domain.model.parkinglots;

import dev.angelcorzo.nivo.domain.model.commons.valueobjects.TaxRate;
import dev.angelcorzo.nivo.domain.model.parkinglots.valueobject.GracePeriod;
import java.math.BigDecimal;
import lombok.Builder;

@Builder(toBuilder = true)
public record ParkingLotPolicy(
    GracePeriod gracePeriod,
    TaxRate taxRate
) {

  public ParkingLotPolicy {
    gracePeriod = gracePeriod != null ? gracePeriod : GracePeriod.none();
    taxRate = taxRate != null ? taxRate : TaxRate.standardIva();
  }

  public ParkingLotPolicy(int gracePeriodMinutes, BigDecimal gracePeriodPrice, BigDecimal ivaRate) {
    this(
        GracePeriod.of(gracePeriodMinutes, gracePeriodPrice != null ? gracePeriodPrice : BigDecimal.ZERO),
        ivaRate != null ? TaxRate.of(ivaRate) : TaxRate.standardIva()
    );
  }

  public static ParkingLotPolicy defaults() {
    return new ParkingLotPolicy(GracePeriod.none(), TaxRate.standardIva());
  }

  public int gracePeriodMinutes() {
    return this.gracePeriod != null ? this.gracePeriod.minutes() : 0;
  }

  public BigDecimal gracePeriodPrice() {
    return this.gracePeriod != null ? this.gracePeriod.price() : BigDecimal.ZERO;
  }

  public BigDecimal ivaRate() {
    return this.taxRate != null ? this.taxRate.value() : TaxRate.standardIva().value();
  }

  public boolean hasGracePeriod() {
    return this.gracePeriod != null && this.gracePeriod.isPresent();
  }

  public boolean isGraceFree() {
    return this.gracePeriod != null && this.gracePeriod.isFree();
  }

  public static class ParkingLotPolicyBuilder {
    private Integer gracePeriodMinutes;
    private BigDecimal gracePeriodPrice;
    private BigDecimal ivaRate;

    public ParkingLotPolicyBuilder gracePeriodMinutes(int gracePeriodMinutes) {
      this.gracePeriodMinutes = gracePeriodMinutes;
      return this;
    }

    public ParkingLotPolicyBuilder gracePeriodPrice(BigDecimal gracePeriodPrice) {
      this.gracePeriodPrice = gracePeriodPrice;
      return this;
    }

    public ParkingLotPolicyBuilder ivaRate(BigDecimal ivaRate) {
      this.ivaRate = ivaRate;
      return this;
    }

    public ParkingLotPolicy build() {
      GracePeriod gp = this.gracePeriod;
      if (gp == null && (this.gracePeriodMinutes != null || this.gracePeriodPrice != null)) {
        int mins = this.gracePeriodMinutes != null ? this.gracePeriodMinutes : 0;
        BigDecimal price = this.gracePeriodPrice != null ? this.gracePeriodPrice : BigDecimal.ZERO;
        gp = GracePeriod.of(mins, price);
      }
      TaxRate tr = this.taxRate;
      if (tr == null && this.ivaRate != null) {
        tr = TaxRate.of(this.ivaRate);
      }
      return new ParkingLotPolicy(gp, tr);
    }
  }
}
