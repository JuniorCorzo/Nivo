package dev.angelcorzo.nivo.domain.model.parkinglots;

import static org.assertj.core.api.Assertions.assertThat;

import dev.angelcorzo.nivo.domain.model.commons.valueobjects.TaxRate;
import dev.angelcorzo.nivo.domain.model.parkinglots.valueobject.GracePeriod;
import java.math.BigDecimal;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

@DisplayName("ParkingLotPolicy Tests")
class ParkingLotPolicyTest {

  @Test
  @DisplayName("defaults() should create policy with zero grace and 0.19 IVA")
  void shouldCreateDefaults() {
    ParkingLotPolicy policy = ParkingLotPolicy.defaults();

    assertThat(policy.gracePeriodMinutes()).isZero();
    assertThat(policy.gracePeriodPrice()).isEqualByComparingTo(BigDecimal.ZERO);
    assertThat(policy.ivaRate()).isEqualByComparingTo(new BigDecimal("0.19"));
    assertThat(policy.hasGracePeriod()).isFalse();
    assertThat(policy.isGraceFree()).isTrue();
    assertThat(policy.gracePeriod()).isEqualTo(GracePeriod.none());
    assertThat(policy.taxRate()).isEqualTo(TaxRate.standardIva());
  }

  @Test
  @DisplayName("hasGracePeriod() should return true when minutes > 0")
  void shouldDetectGracePeriodPresence() {
    ParkingLotPolicy policy = new ParkingLotPolicy(15, BigDecimal.ZERO, new BigDecimal("0.19"));

    assertThat(policy.hasGracePeriod()).isTrue();
    assertThat(policy.isGraceFree()).isTrue();
    assertThat(policy.gracePeriod().minutes()).isEqualTo(15);
  }

  @Test
  @DisplayName("isGraceFree() should return false when gracePeriodPrice > 0")
  void shouldDetectPricedGracePeriod() {
    ParkingLotPolicy policy = new ParkingLotPolicy(15, new BigDecimal("500.00"), new BigDecimal("0.19"));

    assertThat(policy.hasGracePeriod()).isTrue();
    assertThat(policy.isGraceFree()).isFalse();
    assertThat(policy.gracePeriod().price()).isEqualByComparingTo(new BigDecimal("500.00"));
  }

  @Test
  @DisplayName("Should construct policy using GracePeriod and TaxRate value objects directly")
  void shouldConstructWithValueObjects() {
    GracePeriod gracePeriod = GracePeriod.of(30, new BigDecimal("1000.00"));
    TaxRate taxRate = TaxRate.of(new BigDecimal("0.16"));

    ParkingLotPolicy policy = new ParkingLotPolicy(gracePeriod, taxRate);

    assertThat(policy.gracePeriod()).isEqualTo(gracePeriod);
    assertThat(policy.taxRate()).isEqualTo(taxRate);
    assertThat(policy.gracePeriodMinutes()).isEqualTo(30);
    assertThat(policy.gracePeriodPrice()).isEqualByComparingTo(new BigDecimal("1000.00"));
    assertThat(policy.ivaRate()).isEqualByComparingTo(new BigDecimal("0.16"));
  }

  @Test
  @DisplayName("Should fallback to defaults when nulls are passed to canonical constructor")
  void shouldFallbackToDefaultsOnNulls() {
    ParkingLotPolicy policy = new ParkingLotPolicy(null, null);

    assertThat(policy.gracePeriod()).isEqualTo(GracePeriod.none());
    assertThat(policy.taxRate()).isEqualTo(TaxRate.standardIva());
    assertThat(policy.gracePeriodMinutes()).isZero();
    assertThat(policy.gracePeriodPrice()).isEqualByComparingTo(BigDecimal.ZERO);
    assertThat(policy.ivaRate()).isEqualByComparingTo(new BigDecimal("0.19"));
  }

  @Test
  @DisplayName("Builder should support setting value objects directly")
  void shouldSupportBuilderWithValueObjects() {
    GracePeriod gracePeriod = GracePeriod.of(10, BigDecimal.ZERO);
    TaxRate taxRate = TaxRate.of(new BigDecimal("0.08"));

    ParkingLotPolicy policy = ParkingLotPolicy.builder()
        .gracePeriod(gracePeriod)
        .taxRate(taxRate)
        .build();

    assertThat(policy.gracePeriod()).isEqualTo(gracePeriod);
    assertThat(policy.taxRate()).isEqualTo(taxRate);
    assertThat(policy.gracePeriodMinutes()).isEqualTo(10);
    assertThat(policy.ivaRate()).isEqualByComparingTo(new BigDecimal("0.08"));
  }

  @Test
  @DisplayName("Builder should support setting primitive / legacy fields")
  void shouldSupportBuilderWithLegacyFields() {
    ParkingLotPolicy policy = ParkingLotPolicy.builder()
        .gracePeriodMinutes(20)
        .gracePeriodPrice(new BigDecimal("250.00"))
        .ivaRate(new BigDecimal("0.15"))
        .build();

    assertThat(policy.gracePeriodMinutes()).isEqualTo(20);
    assertThat(policy.gracePeriodPrice()).isEqualByComparingTo(new BigDecimal("250.00"));
    assertThat(policy.ivaRate()).isEqualByComparingTo(new BigDecimal("0.15"));
    assertThat(policy.hasGracePeriod()).isTrue();
    assertThat(policy.isGraceFree()).isFalse();
  }
}
