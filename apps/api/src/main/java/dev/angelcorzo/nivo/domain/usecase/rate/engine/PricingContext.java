package dev.angelcorzo.nivo.domain.usecase.rate.engine;

import dev.angelcorzo.nivo.domain.model.parkinglots.ParkingLotPolicy;
import dev.angelcorzo.nivo.domain.model.rates.valueobject.RateReference;
import dev.angelcorzo.nivo.domain.usecase.rate.dtos.PriceLine;
import java.math.BigDecimal;
import java.time.Duration;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import lombok.Builder;

@Builder(toBuilder = true)
public record PricingContext(
    RateReference rate,
    ParkingLotPolicy policy,
    StayInterval stayInterval,
    BigDecimal subtotal,
    List<PriceLine> breakpoints,
    boolean settled
) {
  public PricingContext {
    subtotal = subtotal != null ? subtotal : BigDecimal.ZERO;
    breakpoints = breakpoints != null ? Collections.unmodifiableList(breakpoints) : List.of();
  }

  public static PricingContext of(
      RateReference rate,
      ParkingLotPolicy policy,
      StayInterval stayInterval
  ) {
    return new PricingContext(rate, policy, stayInterval, BigDecimal.ZERO, List.of(), false);
  }

  public static PricingContext of(
      RateReference rate,
      ParkingLotPolicy policy,
      OffsetDateTime entryTime,
      OffsetDateTime exitTime
  ) {
    return of(rate, policy, StayInterval.of(entryTime, exitTime));
  }

  public OffsetDateTime entryTime() {
    return stayInterval != null ? stayInterval.entryTime() : null;
  }

  public OffsetDateTime exitTime() {
    return stayInterval != null ? stayInterval.exitTime() : null;
  }

  public Duration duration() {
    return stayInterval != null ? stayInterval.duration() : Duration.ZERO;
  }

  public PricingContext withSubtotal(BigDecimal newSubtotal, PriceLine line) {
    List<PriceLine> newLines = new ArrayList<>(this.breakpoints);
    if (line != null) {
      newLines.add(line);
    }
    return this.toBuilder()
        .subtotal(newSubtotal)
        .breakpoints(Collections.unmodifiableList(newLines))
        .build();
  }

  public PricingContext toSettled() {
    return this.toBuilder().settled(true).build();
  }

  public PricingContext settle() {
    return toSettled();
  }

  public PricingContext settled(boolean settled) {
    return this.toBuilder().settled(settled).build();
  }

  public PricingContext withSettled(boolean settled) {
    return this.toBuilder().settled(settled).build();
  }
}
