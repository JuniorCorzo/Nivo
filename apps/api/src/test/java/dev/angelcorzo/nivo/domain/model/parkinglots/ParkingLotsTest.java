package dev.angelcorzo.nivo.domain.model.parkinglots;

import static org.assertj.core.api.Assertions.assertThat;

import java.math.BigDecimal;
import java.util.UUID;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class ParkingLotsTest {

  @Test
  @DisplayName("Should use default policy when not provided")
  void shouldDefaultPolicyWhenNotProvided() {
    ParkingLots parkingLot = ParkingLots.builder()
        .id(UUID.randomUUID())
        .name("Central Parking")
        .build();

    ParkingLotPolicy policy = parkingLot.getPolicy();
    assertThat(policy).isNotNull();
    assertThat(policy.gracePeriodMinutes()).isZero();
    assertThat(policy.gracePeriodPrice()).isEqualByComparingTo(BigDecimal.ZERO);
    assertThat(policy.ivaRate()).isEqualByComparingTo(new BigDecimal("0.19"));
  }

  @Test
  @DisplayName("Should use provided custom policy")
  void shouldUseProvidedCustomPolicy() {
    ParkingLotPolicy customPolicy = ParkingLotPolicy.builder()
        .gracePeriodMinutes(15)
        .gracePeriodPrice(new BigDecimal("2000.00"))
        .ivaRate(new BigDecimal("0.1900"))
        .build();

    ParkingLots parkingLot = ParkingLots.builder()
        .id(UUID.randomUUID())
        .name("Central Parking")
        .policy(customPolicy)
        .build();

    assertThat(parkingLot.getPolicy()).isEqualTo(customPolicy);
  }

  @Test
  @DisplayName("Should return defaults when policy is explicitly set to null")
  void shouldReturnDefaultsWhenPolicyIsNull() {
    ParkingLots parkingLot = ParkingLots.builder()
        .id(UUID.randomUUID())
        .name("Central Parking")
        .policy(null)
        .build();

    ParkingLotPolicy policy = parkingLot.getPolicy();
    assertThat(policy).isNotNull();
    assertThat(policy.gracePeriodMinutes()).isZero();
    assertThat(policy.gracePeriodPrice()).isEqualByComparingTo(BigDecimal.ZERO);
    assertThat(policy.ivaRate()).isEqualByComparingTo(new BigDecimal("0.19"));
  }
}
