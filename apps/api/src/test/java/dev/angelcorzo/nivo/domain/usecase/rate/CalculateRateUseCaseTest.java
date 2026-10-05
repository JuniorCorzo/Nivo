package dev.angelcorzo.nivo.domain.usecase.rate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import dev.angelcorzo.nivo.domain.model.authentication.gateway.AuthenticationContextGateway;
import dev.angelcorzo.nivo.domain.model.commons.exceptions.InvalidDomainException;
import dev.angelcorzo.nivo.domain.model.parkinglots.ParkingLotPolicy;
import dev.angelcorzo.nivo.domain.model.parkinglots.ParkingLots;
import dev.angelcorzo.nivo.domain.model.parkinglots.gateways.ParkingLotsRepository;
import dev.angelcorzo.nivo.domain.model.parkingtickets.ParkingTicketNotFound;
import dev.angelcorzo.nivo.domain.model.parkingtickets.ParkingTickets;
import dev.angelcorzo.nivo.domain.model.parkingtickets.gateways.ParkingTicketsRepository;
import dev.angelcorzo.nivo.domain.model.rates.enums.TimeUnitsRate;
import dev.angelcorzo.nivo.domain.model.rates.enums.VehicleType;
import dev.angelcorzo.nivo.domain.model.rates.valueobject.RateReference;
import dev.angelcorzo.nivo.domain.model.tenants.Tenants;
import dev.angelcorzo.nivo.domain.usecase.rate.dtos.PriceDetailed;
import dev.angelcorzo.nivo.domain.usecase.rate.engine.PricingEngine;
import dev.angelcorzo.nivo.domain.usecase.rate.engine.stages.*;
import java.math.BigDecimal;
import java.time.Clock;
import java.time.Instant;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

@DisplayName("CalculateRateUseCase Tests")
class CalculateRateUseCaseTest {

  private ParkingTicketsRepository ticketsRepository;
  private ParkingLotsRepository parkingLotsRepository;
  private AuthenticationContextGateway authGateway;
  private Clock fixedClock;
  private CalculateRateUseCase calculateRateUseCase;

  @BeforeEach
  void setUp() {
    ticketsRepository = mock(ParkingTicketsRepository.class);
    parkingLotsRepository = mock(ParkingLotsRepository.class);
    authGateway = mock(AuthenticationContextGateway.class);
    fixedClock = Clock.fixed(Instant.parse("2026-09-07T12:00:00Z"), ZoneOffset.UTC);

    PricingEngine engine = new PricingEngine(List.of(
        new GracePeriodStage(),
        new BaseRateStage(),
        new SpecialPolicyStage(),
        new SubscriberStage(),
        new StampsStage(),
        new DayCapStage()
    ));

    calculateRateUseCase = new CalculateRateUseCase(
        ticketsRepository,
        parkingLotsRepository,
        authGateway,
        engine,
        fixedClock
    );
  }

  @Test
  @DisplayName("Should return 0 total when stay is within free grace window")
  void shouldReturnZeroForFreeGrace() {
    UUID ticketId = UUID.randomUUID();
    UUID parkingId = UUID.randomUUID();

    ParkingLotPolicy policy = new ParkingLotPolicy(15, BigDecimal.ZERO, new BigDecimal("0.19"));
    ParkingLots parking = ParkingLots.builder().id(parkingId).policy(policy).build();

    RateReference rate = RateReference.builder()
        .pricePerUnit(BigDecimal.valueOf(5000))
        .timeUnit(TimeUnitsRate.HOURS)
        .minChargeTimeMinutes(0)
        .vehicleType(VehicleType.CAR)
        .build();

    ParkingTickets ticket = ParkingTickets.builder()
        .id(ticketId)
        .rate(rate)
        .entryTime(OffsetDateTime.parse("2026-09-07T11:50:00Z")) // 10 min stay <= 15 min grace
        .build();

    when(ticketsRepository.findById(ticketId)).thenReturn(Optional.of(ticket));
    when(parkingLotsRepository.findById(parkingId)).thenReturn(Optional.of(parking));
    when(authGateway.getCurrentTenant()).thenReturn(Tenants.builder().companyName("Central Parking").build());

    PriceDetailed price = calculateRateUseCase.execute(ticketId, parkingId);

    assertThat(price.getTotal()).isEqualByComparingTo(BigDecimal.ZERO);
    assertThat(price.getBreakpoint()).isEmpty();
  }

  @Test
  @DisplayName("Should return flat price when stay is within priced grace window")
  void shouldReturnFlatPriceForPricedGrace() {
    UUID ticketId = UUID.randomUUID();
    UUID parkingId = UUID.randomUUID();

    ParkingLotPolicy policy = new ParkingLotPolicy(15, new BigDecimal("500.00"), new BigDecimal("0.19"));
    ParkingLots parking = ParkingLots.builder().id(parkingId).policy(policy).build();

    RateReference rate = RateReference.builder()
        .pricePerUnit(BigDecimal.valueOf(5000))
        .timeUnit(TimeUnitsRate.HOURS)
        .minChargeTimeMinutes(0)
        .vehicleType(VehicleType.CAR)
        .build();

    ParkingTickets ticket = ParkingTickets.builder()
        .id(ticketId)
        .rate(rate)
        .entryTime(OffsetDateTime.parse("2026-09-07T11:50:00Z")) // 10 min stay <= 15 min grace
        .build();

    when(ticketsRepository.findById(ticketId)).thenReturn(Optional.of(ticket));
    when(parkingLotsRepository.findById(parkingId)).thenReturn(Optional.of(parking));
    when(authGateway.getCurrentTenant()).thenReturn(Tenants.builder().companyName("Central Parking").build());

    PriceDetailed price = calculateRateUseCase.execute(ticketId, parkingId);

    assertThat(price.getSubtotal()).isEqualByComparingTo(new BigDecimal("500.00"));
    assertThat(price.getTotal()).isEqualByComparingTo(new BigDecimal("595.00"));
  }

  @Test
  @DisplayName("Should throw ParkingTicketNotFound when ticket does not exist")
  void shouldThrowWhenTicketNotFound() {
    UUID ticketId = UUID.randomUUID();
    UUID parkingId = UUID.randomUUID();

    when(ticketsRepository.findById(ticketId)).thenReturn(Optional.empty());

    assertThatThrownBy(() -> calculateRateUseCase.execute(ticketId, parkingId))
        .isInstanceOf(ParkingTicketNotFound.class);
  }

  @Test
  @DisplayName("Should calculate rate with execute(UUID ticketId) single parameter")
  void shouldCalculateRateWithSingleParameter() {
    UUID ticketId = UUID.randomUUID();

    RateReference rate = RateReference.builder()
        .pricePerUnit(BigDecimal.valueOf(5000))
        .timeUnit(TimeUnitsRate.HOURS)
        .minChargeTimeMinutes(0)
        .vehicleType(VehicleType.CAR)
        .build();

    ParkingTickets ticket = ParkingTickets.builder()
        .id(ticketId)
        .rate(rate)
        .entryTime(OffsetDateTime.parse("2026-09-07T10:00:00Z")) // 2 hours stay
        .build();

    when(ticketsRepository.findById(ticketId)).thenReturn(Optional.of(ticket));
    when(authGateway.getCurrentTenant()).thenReturn(Tenants.builder().companyName("Central Parking").build());

    PriceDetailed price = calculateRateUseCase.execute(ticketId);

    assertThat(price).isNotNull();
    assertThat(price.getSubtotal()).isEqualByComparingTo(new BigDecimal("10000.00"));
    assertThat(price.getTotal()).isEqualByComparingTo(new BigDecimal("11900.00"));
  }

  @Test
  @DisplayName("Should throw InvalidDomainException when ticket entry time is in the future")
  void shouldThrowWhenEntryTimeIsInFuture() {
    UUID ticketId = UUID.randomUUID();
    RateReference rate = RateReference.builder().build();

    // fixedClock is at 12:00:00Z, entry time 13:00:00Z is after exitTime (clock now)
    ParkingTickets ticket = ParkingTickets.builder()
        .id(ticketId)
        .rate(rate)
        .entryTime(OffsetDateTime.parse("2026-09-07T13:00:00Z"))
        .build();

    when(ticketsRepository.findById(ticketId)).thenReturn(Optional.of(ticket));
    when(authGateway.getCurrentTenant()).thenReturn(Tenants.builder().companyName("Central Parking").build());

    assertThatThrownBy(() -> calculateRateUseCase.execute(ticketId))
        .isInstanceOf(InvalidDomainException.class)
        .hasMessage("Exit time cannot be before entry time");
  }

  @Nested
  @DisplayName("Duration and Billing Waterfall Scenarios")
  class DurationAndBillingScenarios {

    @Test
    @DisplayName("Fractional duration with ceil billing: 65 minutes stay with hourly rate bills 2 full hours")
    void shouldCalculateFractionalDurationWithCeilBilling() {
      UUID ticketId = UUID.randomUUID();
      // fixedClock is 12:00:00Z, entryTime 10:55:00Z -> exactly 65 minutes stay
      OffsetDateTime entryTime = OffsetDateTime.parse("2026-09-07T10:55:00Z");

      RateReference rate = RateReference.builder()
          .name("Standard Hourly")
          .pricePerUnit(BigDecimal.valueOf(3000))
          .timeUnit(TimeUnitsRate.HOURS)
          .minChargeTimeMinutes(0)
          .vehicleType(VehicleType.CAR)
          .build();

      ParkingTickets ticket = ParkingTickets.builder()
          .id(ticketId)
          .rate(rate)
          .entryTime(entryTime)
          .build();

      when(ticketsRepository.findById(ticketId)).thenReturn(Optional.of(ticket));
      when(authGateway.getCurrentTenant()).thenReturn(Tenants.builder().companyName("Central Parking").build());

      // Act
      PriceDetailed price = calculateRateUseCase.execute(ticketId);

      // Assert: ceil(65 / 60) = 2 hours -> 2 * 3000 = 6000 subtotal, 19% IVA = 1140, total = 7140
      assertThat(price.getSubtotal()).isEqualByComparingTo(new BigDecimal("6000.00"));
      assertThat(price.getIvaAmount()).isEqualByComparingTo(new BigDecimal("1140.00"));
      assertThat(price.getTotal()).isEqualByComparingTo(new BigDecimal("7140.00"));
      assertThat(price.getBreakpoint()).hasSize(1);
      assertThat(price.getBreakpoint().getFirst().concept()).contains("Standard Hourly");
    }

    @Test
    @DisplayName("Minimum charge enforcement: 10 minutes stay with 30-minute min charge bills 30 minutes")
    void shouldEnforceMinimumChargeTime() {
      UUID ticketId = UUID.randomUUID();
      // fixedClock is 12:00:00Z, entryTime 11:50:00Z -> 10 minutes stay
      OffsetDateTime entryTime = OffsetDateTime.parse("2026-09-07T11:50:00Z");

      RateReference rate = RateReference.builder()
          .name("Motorcycle Minute")
          .pricePerUnit(BigDecimal.valueOf(100))
          .timeUnit(TimeUnitsRate.MINUTES)
          .minChargeTimeMinutes(30)
          .vehicleType(VehicleType.MOTORCYCLE)
          .build();

      ParkingTickets ticket = ParkingTickets.builder()
          .id(ticketId)
          .rate(rate)
          .entryTime(entryTime)
          .build();

      when(ticketsRepository.findById(ticketId)).thenReturn(Optional.of(ticket));
      when(authGateway.getCurrentTenant()).thenReturn(Tenants.builder().companyName("Central Parking").build());

      PriceDetailed price = calculateRateUseCase.execute(ticketId);

      // Assert: 10 min < 30 min minCharge -> billed for 30 minutes * 100 COP = 3000 subtotal, IVA 570, total 3570
      assertThat(price.getSubtotal()).isEqualByComparingTo(new BigDecimal("3000.00"));
      assertThat(price.getIvaAmount()).isEqualByComparingTo(new BigDecimal("570.00"));
      assertThat(price.getTotal()).isEqualByComparingTo(new BigDecimal("3570.00"));
    }

    @Test
    @DisplayName("Grace period transition: stay of 16 minutes exceeding 15 min grace window bills normal duration")
    void shouldBillNormalWhenExceedingGracePeriod() {
      UUID ticketId = UUID.randomUUID();
      UUID parkingId = UUID.randomUUID();
      // fixedClock is 12:00:00Z, entryTime 11:44:00Z -> 16 minutes stay
      OffsetDateTime entryTime = OffsetDateTime.parse("2026-09-07T11:44:00Z");

      ParkingLotPolicy policy = new ParkingLotPolicy(15, BigDecimal.ZERO, new BigDecimal("0.19"));
      ParkingLots parking = ParkingLots.builder().id(parkingId).policy(policy).build();

      RateReference rate = RateReference.builder()
          .name("Car Hourly")
          .pricePerUnit(BigDecimal.valueOf(4000))
          .timeUnit(TimeUnitsRate.HOURS)
          .minChargeTimeMinutes(0)
          .vehicleType(VehicleType.CAR)
          .build();

      ParkingTickets ticket = ParkingTickets.builder()
          .id(ticketId)
          .rate(rate)
          .entryTime(entryTime)
          .build();

      when(ticketsRepository.findById(ticketId)).thenReturn(Optional.of(ticket));
      when(parkingLotsRepository.findById(parkingId)).thenReturn(Optional.of(parking));
      when(authGateway.getCurrentTenant()).thenReturn(Tenants.builder().companyName("Central Parking").build());

      PriceDetailed price = calculateRateUseCase.execute(ticketId, parkingId);

      // Assert: 16 min > 15 min grace -> billed 1 hour ceil -> 4000 subtotal, IVA 760, total 4760
      assertThat(price.getSubtotal()).isEqualByComparingTo(new BigDecimal("4000.00"));
      assertThat(price.getTotal()).isEqualByComparingTo(new BigDecimal("4760.00"));
      assertThat(price.getBreakpoint()).hasSize(1);
    }
  }

  @Nested
  @DisplayName("Special Policy Pipeline Integration Scenarios")
  class SpecialPolicyIntegrationScenarios {

    @Test
    @DisplayName("TIME SUBTRACT policy: 4 hours stay with 1 hour free subtracts time and recalculates fee with pricePerUnit")
    void shouldApplyTimeSubtractSpecialPolicyEndToEnd() {
      UUID ticketId = UUID.randomUUID();
      // fixedClock is 12:00:00Z, entryTime 08:00:00Z -> exactly 4 hours stay
      OffsetDateTime entryTime = OffsetDateTime.parse("2026-09-07T08:00:00Z");

      dev.angelcorzo.nivo.domain.model.specialpolicies.valueobjects.SpecialPoliciesReference policy =
          dev.angelcorzo.nivo.domain.model.specialpolicies.valueobjects.SpecialPoliciesReference.builder()
              .name("First Hour Free")
              .modifies(dev.angelcorzo.nivo.domain.model.specialpolicies.enums.ModifiesTypes.TIME)
              .operation(dev.angelcorzo.nivo.domain.model.specialpolicies.enums.OperationsTypes.SUBTRACT)
              .valueToModify(BigDecimal.valueOf(1)) // minus 1 hour
              .active(true)
              .build();

      RateReference rate = RateReference.builder()
          .name("Downtown Parking")
          .pricePerUnit(BigDecimal.valueOf(5000))
          .timeUnit(TimeUnitsRate.HOURS)
          .minChargeTimeMinutes(0)
          .vehicleType(VehicleType.CAR)
          .specialPolicy(policy)
          .build();

      ParkingTickets ticket = ParkingTickets.builder()
          .id(ticketId)
          .rate(rate)
          .entryTime(entryTime)
          .build();

      when(ticketsRepository.findById(ticketId)).thenReturn(Optional.of(ticket));
      when(authGateway.getCurrentTenant()).thenReturn(Tenants.builder().companyName("Central Parking").build());

      PriceDetailed price = calculateRateUseCase.execute(ticketId);

      // Base: 4h * 5000 = 20000.
      // Special policy: (4h - 1h) * 5000 = 15000. Delta = -5000.
      // Subtotal = 15000, IVA (19%) = 2850, Total = 17850.
      assertThat(price.getSubtotal()).isEqualByComparingTo(new BigDecimal("15000.00"));
      assertThat(price.getIvaAmount()).isEqualByComparingTo(new BigDecimal("2850.00"));
      assertThat(price.getTotal()).isEqualByComparingTo(new BigDecimal("17850.00"));
      assertThat(price.getBreakpoint()).hasSize(2);
      assertThat(price.getBreakpoint().get(0).concept()).contains("Downtown Parking");
      assertThat(price.getBreakpoint().get(0).amount()).isEqualByComparingTo(new BigDecimal("20000.00"));
      assertThat(price.getBreakpoint().get(1).concept()).isEqualTo("First Hour Free");
      assertThat(price.getBreakpoint().get(1).amount()).isEqualByComparingTo(new BigDecimal("-5000.00"));
    }

    @Test
    @DisplayName("SURCHARGE PERCENTAGE policy: 2 hours stay with 20% night surcharge increases subtotal and records delta")
    void shouldApplySurchargeSpecialPolicyEndToEnd() {
      UUID ticketId = UUID.randomUUID();
      // fixedClock is 12:00:00Z, entryTime 10:00:00Z -> 2 hours stay
      OffsetDateTime entryTime = OffsetDateTime.parse("2026-09-07T10:00:00Z");

      dev.angelcorzo.nivo.domain.model.specialpolicies.valueobjects.SpecialPoliciesReference policy =
          dev.angelcorzo.nivo.domain.model.specialpolicies.valueobjects.SpecialPoliciesReference.builder()
              .name("Night Shift Surcharge")
              .modifies(dev.angelcorzo.nivo.domain.model.specialpolicies.enums.ModifiesTypes.SURCHARGE)
              .operation(dev.angelcorzo.nivo.domain.model.specialpolicies.enums.OperationsTypes.PERCENTAGE)
              .valueToModify(BigDecimal.valueOf(20)) // +20%
              .active(true)
              .build();

      RateReference rate = RateReference.builder()
          .name("Night Rate")
          .pricePerUnit(BigDecimal.valueOf(4000))
          .timeUnit(TimeUnitsRate.HOURS)
          .minChargeTimeMinutes(0)
          .vehicleType(VehicleType.CAR)
          .specialPolicy(policy)
          .build();

      ParkingTickets ticket = ParkingTickets.builder()
          .id(ticketId)
          .rate(rate)
          .entryTime(entryTime)
          .build();

      when(ticketsRepository.findById(ticketId)).thenReturn(Optional.of(ticket));
      when(authGateway.getCurrentTenant()).thenReturn(Tenants.builder().companyName("Central Parking").build());

      PriceDetailed price = calculateRateUseCase.execute(ticketId);

      // Base: 2h * 4000 = 8000.
      // Surcharge 20% on 8000 = +1600.
      // Subtotal = 9600, IVA 19% = 1824, Total = 11424.
      assertThat(price.getSubtotal()).isEqualByComparingTo(new BigDecimal("9600.00"));
      assertThat(price.getIvaAmount()).isEqualByComparingTo(new BigDecimal("1824.00"));
      assertThat(price.getTotal()).isEqualByComparingTo(new BigDecimal("11424.00"));
      assertThat(price.getBreakpoint()).hasSize(2);
      assertThat(price.getBreakpoint().get(1).concept()).isEqualTo("Night Shift Surcharge");
      assertThat(price.getBreakpoint().get(1).amount()).isEqualByComparingTo(new BigDecimal("1600.00"));
    }

    @Test
    @DisplayName("PRICE SUBTRACT policy exceeding base price floors at zero and taxes zero")
    void shouldFloorDiscountAtZeroWhenExceedingTotal() {
      UUID ticketId = UUID.randomUUID();
      // fixedClock is 12:00:00Z, entryTime 11:00:00Z -> 1 hour stay
      OffsetDateTime entryTime = OffsetDateTime.parse("2026-09-07T11:00:00Z");

      dev.angelcorzo.nivo.domain.model.specialpolicies.valueobjects.SpecialPoliciesReference policy =
          dev.angelcorzo.nivo.domain.model.specialpolicies.valueobjects.SpecialPoliciesReference.builder()
              .name("Big Welcome Coupon")
              .modifies(dev.angelcorzo.nivo.domain.model.specialpolicies.enums.ModifiesTypes.PRICE)
              .operation(dev.angelcorzo.nivo.domain.model.specialpolicies.enums.OperationsTypes.SUBTRACT)
              .valueToModify(BigDecimal.valueOf(10000)) // $10,000 off
              .active(true)
              .build();

      RateReference rate = RateReference.builder()
          .name("Hourly")
          .pricePerUnit(BigDecimal.valueOf(3000)) // $3,000 base
          .timeUnit(TimeUnitsRate.HOURS)
          .minChargeTimeMinutes(0)
          .vehicleType(VehicleType.CAR)
          .specialPolicy(policy)
          .build();

      ParkingTickets ticket = ParkingTickets.builder()
          .id(ticketId)
          .rate(rate)
          .entryTime(entryTime)
          .build();

      when(ticketsRepository.findById(ticketId)).thenReturn(Optional.of(ticket));
      when(authGateway.getCurrentTenant()).thenReturn(Tenants.builder().companyName("Central Parking").build());

      PriceDetailed price = calculateRateUseCase.execute(ticketId);

      // Base: 1h * 3000 = 3000.
      // Coupon: 3000 - 10000 -> floors at 0. Delta = -3000.
      // Subtotal = 0, IVA = 0, Total = 0.
      assertThat(price.getSubtotal()).isEqualByComparingTo(BigDecimal.ZERO);
      assertThat(price.getIvaAmount()).isEqualByComparingTo(BigDecimal.ZERO);
      assertThat(price.getTotal()).isEqualByComparingTo(BigDecimal.ZERO);
      assertThat(price.getBreakpoint()).hasSize(2);
      assertThat(price.getBreakpoint().get(1).concept()).isEqualTo("Big Welcome Coupon");
      assertThat(price.getBreakpoint().get(1).amount()).isEqualByComparingTo(new BigDecimal("-3000.00"));
    }
  }
}
