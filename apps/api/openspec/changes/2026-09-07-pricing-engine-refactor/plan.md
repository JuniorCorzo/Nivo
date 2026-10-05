# Pricing Engine Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor the parking pricing module into a deterministic, staged Pricing Waterfall orchestrated by a `PricingEngine` domain service, introducing `ParkingLotPolicy` for configurable (and optionally priced) grace periods, fixing critical bugs in special policies, and eliminating existing code smells.

**Architecture:** Clean Architecture + Pipeline Pattern. `CalculateRateUseCase` delegates pure calculation to `PricingEngine`, which sequentially applies an immutable pipeline of `PricingStage` instances (`GracePeriodStage`, `BaseRateStage`, `SpecialPolicyStage`, and future stubs) over an immutable `PricingContext`. Grace period rules live inside `ParkingLotPolicy` as a value object within `ParkingLots`.

**Tech Stack:** Java 21, Spring Boot 3.5.4, Clean Architecture (Bancolombia scaffold), JUnit 5, Mockito, AssertJ, Flyway, PostgreSQL / H2.

**Spec:** `.openspec/changes/2026-09-07-pricing-engine-refactor/design.md`

## Global Constraints

- Never break Clean Architecture layer isolation: Domain cannot depend on Infrastructure, Spring, or JPA.
- Strict TDD (Red-Green-Refactor) required on every task: Failing test first, verify failure, minimal implementation, verify pass, commit.
- All commits follow workspace Conventional Commits format (`feat(domain): ...`, `refactor(domain): ...`, `test(domain): ...`).
- All shell commands must be run within `apps/api/` with Gradle wrapper `./gradlew`.
- Monetary amounts use `BigDecimal` with explicit scale and `RoundingMode.HALF_UP`.
- Duration calculations use standard `java.time.Duration` and `java.time.Clock`.

---

## File Structure & Responsibilities

```
apps/api/
├── src/main/resources/db/migration/
│   └── V3__add_parking_lot_policy_and_rates_min_charge.sql [CREATE] - Flyway migration for policy columns
├── src/main/java/dev/angelcorzo/nivo/
│   ├── domain/model/
│   │   ├── parkinglots/
│   │   │   ├── ParkingLotPolicy.java [CREATE] - VO for grace window, grace flat price, iva rate
│   │   │   └── ParkingLots.java [MODIFY] - Add policy field with defaults
│   │   └── rates/
│   │       ├── Rates.java [MODIFY] - Change minChargeTimeMinutes from String to int
│   │       ├── valueobject/RateReference.java [MODIFY] - Change minChargeTimeMinutes from String to int
│   │       └── gateways/RatesRepository.java [MODIFY] - Int minCharge in query/model if applicable
│   ├── domain/usecase/rate/
│   │   ├── CalculateRateUseCase.java [MODIFY] - Orchestrates loading ticket & parking lot, delegates to engine
│   │   ├── RateConfigurationUseCase.java [MODIFY] - Use int minChargeTimeMinutes
│   │   ├── UpdateRateUseCase.java [MODIFY] - Use int minChargeTimeMinutes
│   │   ├── dtos/PriceDetailed.java [MODIFY] - Add static factory from(PricingContext, String tenantName)
│   │   ├── engine/
│   │   │   ├── PricingContext.java [CREATE] - Immutable pipeline context flowing between stages
│   │   │   ├── PricingStage.java [CREATE] - Functional interface for pipeline stages
│   │   │   ├── PricingEngine.java [CREATE] - Domain service executing ordered pipeline & short-circuit
│   │   │   └── stages/
│   │   │       ├── GracePeriodStage.java [CREATE] - Evaluates free/priced grace period & settles context
│   │   │       ├── BaseRateStage.java [CREATE] - Calculates standard fractional rate with min charge
│   │   │       ├── SpecialPolicyStage.java [CREATE] - Evaluates TIME/PRICE/DISCOUNT/SURCHARGE special rules
│   │   │       ├── SubscriberStage.java [CREATE] - Stub no-op for future subscriber contracts
│   │   │       ├── StampsStage.java [CREATE] - Stub no-op for commercial discount stamps
│   │   │       └── DayCapStage.java [CREATE] - Stub no-op for daily max charge caps
│   │   └── decorator/ [DELETE]
│   │       ├── RateBaseDecorator.java
│   │       ├── RateWithSpecialPolicyDecorator.java
│   │       └── RateComponent.java
│   ├── infrastructure/adapter/jpa/
│   │   ├── parkinglots/
│   │   │   ├── ParkingLotsData.java [MODIFY] - Add gracePeriodMinutes, gracePeriodPrice, ivaRate
│   │   │   └── mappers/ParkingLotsMapper.java [MODIFY] - Map ParkingLotPolicy to/from JPA entity
│   │   └── rates/
│   │       └── RateData.java [MODIFY] - Ensure Integer minChargeTimeMinutes
│   ├── infrastructure/entrypoint/rest/rates/
│   │   └── dto/
│   │       ├── CreateRate.java [MODIFY] - int minChargeTimeMinutes
│   │       ├── UpdateRate.java [MODIFY] - int minChargeTimeMinutes
│   │       └── RatesDTO.java [MODIFY] - int minChargeTimeMinutes
│   └── config/
│       ├── AppConfig.java [CREATE] - Declares Clock bean
│       └── UseCasesConfig.java [MODIFY] - Provides PricingEngine bean with ordered stages
└── src/test/java/dev/angelcorzo/nivo/domain/
    ├── model/parkinglots/
    │   └── ParkingLotPolicyTest.java [CREATE] - Unit tests for defaults, hasGracePeriod, isGraceFree
    └── usecase/rate/
        ├── CalculateRateUseCaseTest.java [MODIFY] - Tests for clock mock, grace paths, engine integration
        └── engine/
            ├── PricingContextTest.java [CREATE] - Immutability & factory unit tests
            ├── PricingEngineTest.java [CREATE] - Pipeline execution & short-circuit tests
            └── stages/
                ├── GracePeriodStageTest.java [CREATE] - Free grace, priced grace, passthrough tests
                ├── BaseRateStageTest.java [CREATE] - Unit rate, min charge, ceiling units, settled skip tests
                └── SpecialPolicyStageTest.java [CREATE] - TIME pricePerUnit fix, SURCHARGE, DISCOUNT, PRICE tests
```

---

## Tasks

### Task 1: Fix `minChargeTimeMinutes` Type Smell (String -> int)

**Files:**
- Modify: `apps/api/src/main/java/dev/angelcorzo/nivo/domain/model/rates/Rates.java`
- Modify: `apps/api/src/main/java/dev/angelcorzo/nivo/domain/model/rates/valueobject/RateReference.java`
- Modify: `apps/api/src/main/java/dev/angelcorzo/nivo/domain/usecase/rate/RateConfigurationUseCase.java`
- Modify: `apps/api/src/main/java/dev/angelcorzo/nivo/domain/usecase/rate/UpdateRateUseCase.java`
- Modify: `apps/api/src/main/java/dev/angelcorzo/nivo/infrastructure/entrypoint/rest/rates/dto/CreateRate.java`
- Modify: `apps/api/src/main/java/dev/angelcorzo/nivo/infrastructure/entrypoint/rest/rates/dto/UpdateRate.java`
- Modify: `apps/api/src/main/java/dev/angelcorzo/nivo/infrastructure/entrypoint/rest/rates/dto/RatesDTO.java`
- Modify: `apps/api/src/test/java/dev/angelcorzo/nivo/domain/usecase/rate/CalculateRateUseCaseTest.java`

**Interfaces:**
- Consumes: Existing rate models with `String minChargeTimeMinutes`.
- Produces: `int minChargeTimeMinutes` across domain entities, VOs, use cases, and DTOs.

- [ ] **Step 1: Update test fixtures expecting String minCharge to int**

In `apps/api/src/test/java/dev/angelcorzo/nivo/domain/usecase/rate/CalculateRateUseCaseTest.java`, change `.minChargeTimeMinutes("0")` to `.minChargeTimeMinutes(0)` on lines 67 and 114.

- [ ] **Step 2: Run test to verify it fails compilation**

Run: `./gradlew test --tests dev.angelcorzo.nivo.domain.usecase.rate.CalculateRateUseCaseTest` in `apps/api/`
Expected: FAIL with compilation error: incompatible types: int cannot be converted to String.

- [ ] **Step 3: Update domain models and DTOs to `int` / `Integer`**

In `Rates.java`:
Change `private String minChargeTimeMinutes;` to `private int minChargeTimeMinutes;`.
In `RateReference.java`:
Change record component `String minChargeTimeMinutes` to `int minChargeTimeMinutes`.
In `RateConfigurationUseCase.CreateTariff`:
Change record component `String minChargeTimeMinutes` to `int minChargeTimeMinutes`.
In `UpdateRateUseCase.UpdateRate`:
Change record component `String minChargeTimeMinutes` to `int minChargeTimeMinutes`.
In `CreateRate.java`, `UpdateRate.java`, and `RatesDTO.java`:
Change `@NotNull String minChargeTimeMinutes` to `@NotNull Integer minChargeTimeMinutes`.
In `RateBaseDecorator.java` and `RateWithSpecialPolicyDecorator.java`:
Change `Long.parseLong(rate.minChargeTimeMinutes())` to `(long) rate.minChargeTimeMinutes()`.

- [ ] **Step 4: Run test to verify it passes**

Run: `./gradlew test` in `apps/api/`
Expected: PASS (all existing tests pass).

- [ ] **Step 5: Commit**

```bash
git add apps/api/src/main/java/dev/angelcorzo/nivo/domain/model/rates/
git add apps/api/src/main/java/dev/angelcorzo/nivo/domain/usecase/rate/
git add apps/api/src/main/java/dev/angelcorzo/nivo/infrastructure/entrypoint/rest/rates/dto/
git add apps/api/src/test/java/dev/angelcorzo/nivo/domain/usecase/rate/
git commit -m "refactor(domain): change minChargeTimeMinutes from String to int"
```

---

### Task 2: Implement `ParkingLotPolicy` Value Object

**Files:**
- Create: `apps/api/src/main/java/dev/angelcorzo/nivo/domain/model/parkinglots/ParkingLotPolicy.java`
- Create: `apps/api/src/test/java/dev/angelcorzo/nivo/domain/model/parkinglots/ParkingLotPolicyTest.java`

**Interfaces:**
- Produces: `ParkingLotPolicy(int gracePeriodMinutes, BigDecimal gracePeriodPrice, BigDecimal ivaRate)` with `defaults()`, `hasGracePeriod()`, and `isGraceFree()`.

- [ ] **Step 1: Write failing unit tests for `ParkingLotPolicy`**

Create `apps/api/src/test/java/dev/angelcorzo/nivo/domain/model/parkinglots/ParkingLotPolicyTest.java`:

```java
package dev.angelcorzo.nivo.domain.model.parkinglots;

import static org.assertj.core.api.Assertions.assertThat;

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
  }

  @Test
  @DisplayName("hasGracePeriod() should return true when minutes > 0")
  void shouldDetectGracePeriodPresence() {
    ParkingLotPolicy policy = new ParkingLotPolicy(15, BigDecimal.ZERO, new BigDecimal("0.19"));

    assertThat(policy.hasGracePeriod()).isTrue();
    assertThat(policy.isGraceFree()).isTrue();
  }

  @Test
  @DisplayName("isGraceFree() should return false when gracePeriodPrice > 0")
  void shouldDetectPricedGracePeriod() {
    ParkingLotPolicy policy = new ParkingLotPolicy(15, new BigDecimal("500.00"), new BigDecimal("0.19"));

    assertThat(policy.hasGracePeriod()).isTrue();
    assertThat(policy.isGraceFree()).isFalse();
  }
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `./gradlew test --tests dev.angelcorzo.nivo.domain.model.parkinglots.ParkingLotPolicyTest` in `apps/api/`
Expected: FAIL (cannot find symbol `ParkingLotPolicy`).

- [ ] **Step 3: Write minimal `ParkingLotPolicy` record**

Create `apps/api/src/main/java/dev/angelcorzo/nivo/domain/model/parkinglots/ParkingLotPolicy.java`:

```java
package dev.angelcorzo.nivo.domain.model.parkinglots;

import java.math.BigDecimal;
import java.util.Objects;
import lombok.Builder;

@Builder(toBuilder = true)
public record ParkingLotPolicy(
    int gracePeriodMinutes,
    BigDecimal gracePeriodPrice,
    BigDecimal ivaRate
) {
  public ParkingLotPolicy {
    gracePeriodPrice = gracePeriodPrice != null ? gracePeriodPrice : BigDecimal.ZERO;
    ivaRate = ivaRate != null ? ivaRate : new BigDecimal("0.19");
  }

  public static ParkingLotPolicy defaults() {
    return new ParkingLotPolicy(0, BigDecimal.ZERO, new BigDecimal("0.19"));
  }

  public boolean hasGracePeriod() {
    return this.gracePeriodMinutes > 0;
  }

  public boolean isGraceFree() {
    return BigDecimal.ZERO.compareTo(this.gracePeriodPrice) == 0;
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `./gradlew test --tests dev.angelcorzo.nivo.domain.model.parkinglots.ParkingLotPolicyTest` in `apps/api/`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/api/src/main/java/dev/angelcorzo/nivo/domain/model/parkinglots/ParkingLotPolicy.java
git add apps/api/src/test/java/dev/angelcorzo/nivo/domain/model/parkinglots/ParkingLotPolicyTest.java
git commit -m "feat(domain): add ParkingLotPolicy value object"
```

---

### Task 3: Embed `ParkingLotPolicy` in `ParkingLots` & Migration

**Files:**
- Modify: `apps/api/src/main/java/dev/angelcorzo/nivo/domain/model/parkinglots/ParkingLots.java`
- Modify: `apps/api/src/main/java/dev/angelcorzo/nivo/infrastructure/adapter/jpa/parkinglots/ParkingLotsData.java`
- Modify: `apps/api/src/main/java/dev/angelcorzo/nivo/infrastructure/adapter/jpa/parkinglots/mappers/ParkingLotsMapper.java`
- Create: `apps/api/src/main/resources/db/migration/V3__add_parking_lot_policy_and_rates_min_charge.sql`

**Interfaces:**
- Consumes: `ParkingLotPolicy`
- Produces: `ParkingLots.getPolicy()` returning non-null `ParkingLotPolicy`.

- [ ] **Step 1: Write Flyway migration script**

Create `apps/api/src/main/resources/db/migration/V3__add_parking_lot_policy_and_rates_min_charge.sql`:

```sql
-- Migration: Add parking lot policy fields (grace period & iva)
ALTER TABLE parking_lots
    ADD COLUMN IF NOT EXISTS grace_period_minutes INT NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS grace_period_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    ADD COLUMN IF NOT EXISTS iva_rate NUMERIC(5, 4) NOT NULL DEFAULT 0.19;
```

- [ ] **Step 2: Add policy field to `ParkingLots.java`**

In `apps/api/src/main/java/dev/angelcorzo/nivo/domain/model/parkinglots/ParkingLots.java`:
Add:
```java
  @Builder.Default
  private ParkingLotPolicy policy = ParkingLotPolicy.defaults();

  public ParkingLotPolicy getPolicy() {
    return this.policy != null ? this.policy : ParkingLotPolicy.defaults();
  }
```

- [ ] **Step 3: Add persistent columns to `ParkingLotsData.java`**

In `apps/api/src/main/java/dev/angelcorzo/nivo/infrastructure/adapter/jpa/parkinglots/ParkingLotsData.java`:
Add fields:
```java
  @ColumnDefault("0")
  @Column(name = "grace_period_minutes", nullable = false)
  private Integer gracePeriodMinutes;

  @ColumnDefault("0.00")
  @Column(name = "grace_period_price", nullable = false)
  private BigDecimal gracePeriodPrice;

  @ColumnDefault("0.19")
  @Column(name = "iva_rate", nullable = false)
  private BigDecimal ivaRate;
```

- [ ] **Step 4: Update `ParkingLotsMapper.java`**

In `apps/api/src/main/java/dev/angelcorzo/nivo/infrastructure/adapter/jpa/parkinglots/mappers/ParkingLotsMapper.java`:
Add custom mappings for `policy` on `toEntity` and `toData`:
```java
  @Mapping(target = "policy", expression = "java(toPolicy(data))")
  public abstract ParkingLots toEntity(ParkingLotsData data);

  @Mapping(target = "gracePeriodMinutes", expression = "java(entity.getPolicy().gracePeriodMinutes())")
  @Mapping(target = "gracePeriodPrice", expression = "java(entity.getPolicy().gracePeriodPrice())")
  @Mapping(target = "ivaRate", expression = "java(entity.getPolicy().ivaRate())")
  public abstract ParkingLotsData toData(ParkingLots entity);

  protected ParkingLotPolicy toPolicy(ParkingLotsData data) {
    if (data == null) return ParkingLotPolicy.defaults();
    return new ParkingLotPolicy(
        data.getGracePeriodMinutes() != null ? data.getGracePeriodMinutes() : 0,
        data.getGracePeriodPrice() != null ? data.getGracePeriodPrice() : BigDecimal.ZERO,
        data.getIvaRate() != null ? data.getIvaRate() : new BigDecimal("0.19")
    );
  }
```

- [ ] **Step 5: Run tests to verify build & mapping**

Run: `./gradlew test` in `apps/api/`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add apps/api/src/main/resources/db/migration/V3__add_parking_lot_policy_and_rates_min_charge.sql
git add apps/api/src/main/java/dev/angelcorzo/nivo/domain/model/parkinglots/ParkingLots.java
git add apps/api/src/main/java/dev/angelcorzo/nivo/infrastructure/adapter/jpa/parkinglots/
git commit -m "feat(domain): embed ParkingLotPolicy in ParkingLots aggregate and add V3 migration"
```

---

### Task 4: Implement `PricingContext` and `PricingStage` Interface

**Files:**
- Create: `apps/api/src/main/java/dev/angelcorzo/nivo/domain/usecase/rate/engine/PricingContext.java`
- Create: `apps/api/src/main/java/dev/angelcorzo/nivo/domain/usecase/rate/engine/PricingStage.java`
- Create: `apps/api/src/test/java/dev/angelcorzo/nivo/domain/usecase/rate/engine/PricingContextTest.java`

**Interfaces:**
- Produces: `PricingStage` functional interface (`PricingContext apply(PricingContext context)`)
- Produces: Immutable `PricingContext` record with `.withSubtotal(BigDecimal, PriceLine)` and `.settled()`.

- [ ] **Step 1: Write failing unit test for `PricingContext`**

Create `apps/api/src/test/java/dev/angelcorzo/nivo/domain/usecase/rate/engine/PricingContextTest.java`:

```java
package dev.angelcorzo.nivo.domain.usecase.rate.engine;

import static org.assertj.core.api.Assertions.assertThat;

import dev.angelcorzo.nivo.domain.model.parkinglots.ParkingLotPolicy;
import dev.angelcorzo.nivo.domain.model.rates.enums.TimeUnitsRate;
import dev.angelcorzo.nivo.domain.model.rates.enums.VehicleType;
import dev.angelcorzo.nivo.domain.model.rates.valueobject.RateReference;
import dev.angelcorzo.nivo.domain.usecase.rate.dtos.PriceLine;
import java.math.BigDecimal;
import java.time.Duration;
import java.time.OffsetDateTime;
import java.util.UUID;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

@DisplayName("PricingContext Tests")
class PricingContextTest {

  @Test
  @DisplayName("of() should calculate duration and initialize subtotal to zero")
  void shouldInitializeContext() {
    OffsetDateTime entry = OffsetDateTime.parse("2026-09-07T10:00:00Z");
    OffsetDateTime exit = OffsetDateTime.parse("2026-09-07T11:30:00Z");

    RateReference rate = RateReference.builder()
        .id(UUID.randomUUID())
        .pricePerUnit(BigDecimal.valueOf(5000))
        .timeUnit(TimeUnitsRate.HOURS)
        .minChargeTimeMinutes(0)
        .vehicleType(VehicleType.CAR)
        .build();

    PricingContext ctx = PricingContext.of(rate, ParkingLotPolicy.defaults(), entry, exit);

    assertThat(ctx.duration()).isEqualTo(Duration.ofMinutes(90));
    assertThat(ctx.subtotal()).isEqualByComparingTo(BigDecimal.ZERO);
    assertThat(ctx.breakpoints()).isEmpty();
    assertThat(ctx.settled()).isFalse();
  }

  @Test
  @DisplayName("withSubtotal() should return new instance with accumulated breakpoint")
  void shouldAccumulateSubtotalImmutably() {
    OffsetDateTime entry = OffsetDateTime.parse("2026-09-07T10:00:00Z");
    OffsetDateTime exit = OffsetDateTime.parse("2026-09-07T11:00:00Z");
    RateReference rate = RateReference.builder().build();

    PricingContext initial = PricingContext.of(rate, ParkingLotPolicy.defaults(), entry, exit);
    PricingContext updated = initial.withSubtotal(BigDecimal.valueOf(5000), PriceLine.of("Base Rate", BigDecimal.valueOf(5000)));

    assertThat(initial.subtotal()).isEqualByComparingTo(BigDecimal.ZERO);
    assertThat(initial.breakpoints()).isEmpty();

    assertThat(updated.subtotal()).isEqualByComparingTo(BigDecimal.valueOf(5000));
    assertThat(updated.breakpoints()).hasSize(1);
    assertThat(updated.breakpoints().getFirst().concept()).isEqualTo("Base Rate");
  }

  @Test
  @DisplayName("settled() should mark settled flag true on new instance")
  void shouldMarkSettled() {
    OffsetDateTime entry = OffsetDateTime.parse("2026-09-07T10:00:00Z");
    OffsetDateTime exit = OffsetDateTime.parse("2026-09-07T10:10:00Z");
    PricingContext initial = PricingContext.of(RateReference.builder().build(), ParkingLotPolicy.defaults(), entry, exit);

    PricingContext settled = initial.settled();

    assertThat(initial.settled()).isFalse();
    assertThat(settled.settled()).isTrue();
  }
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `./gradlew test --tests dev.angelcorzo.nivo.domain.usecase.rate.engine.PricingContextTest` in `apps/api/`
Expected: FAIL (cannot find symbol `PricingContext`).

- [ ] **Step 3: Implement `PricingStage` and `PricingContext`**

Create `apps/api/src/main/java/dev/angelcorzo/nivo/domain/usecase/rate/engine/PricingStage.java`:

```java
package dev.angelcorzo.nivo.domain.usecase.rate.engine;

@FunctionalInterface
public interface PricingStage {
  PricingContext apply(PricingContext context);
}
```

Create `apps/api/src/main/java/dev/angelcorzo/nivo/domain/usecase/rate/engine/PricingContext.java`:

```java
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
    OffsetDateTime entryTime,
    OffsetDateTime exitTime,
    Duration duration,
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
      OffsetDateTime entryTime,
      OffsetDateTime exitTime
  ) {
    Duration duration = Duration.between(entryTime, exitTime);
    return new PricingContext(rate, policy, entryTime, exitTime, duration, BigDecimal.ZERO, List.of(), false);
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

  public PricingContext settled() {
    return this.toBuilder().settled(true).build();
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `./gradlew test --tests dev.angelcorzo.nivo.domain.usecase.rate.engine.PricingContextTest` in `apps/api/`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/api/src/main/java/dev/angelcorzo/nivo/domain/usecase/rate/engine/
git add apps/api/src/test/java/dev/angelcorzo/nivo/domain/usecase/rate/engine/PricingContextTest.java
git commit -m "feat(domain): add PricingContext and PricingStage pipeline interfaces"
```

---

### Task 5: Implement `GracePeriodStage` (Free & Priced Grace)

**Files:**
- Create: `apps/api/src/main/java/dev/angelcorzo/nivo/domain/usecase/rate/engine/stages/GracePeriodStage.java`
- Create: `apps/api/src/test/java/dev/angelcorzo/nivo/domain/usecase/rate/engine/stages/GracePeriodStageTest.java`

**Interfaces:**
- Consumes: `PricingContext` (with `ParkingLotPolicy`)
- Produces: `GracePeriodStage implements PricingStage`

- [ ] **Step 1: Write failing unit tests for `GracePeriodStage`**

Create `apps/api/src/test/java/dev/angelcorzo/nivo/domain/usecase/rate/engine/stages/GracePeriodStageTest.java`:

```java
package dev.angelcorzo.nivo.domain.usecase.rate.engine.stages;

import static org.assertj.core.api.Assertions.assertThat;

import dev.angelcorzo.nivo.domain.model.parkinglots.ParkingLotPolicy;
import dev.angelcorzo.nivo.domain.model.rates.valueobject.RateReference;
import dev.angelcorzo.nivo.domain.usecase.rate.engine.PricingContext;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

@DisplayName("GracePeriodStage Tests")
class GracePeriodStageTest {

  private final GracePeriodStage stage = new GracePeriodStage();

  @Test
  @DisplayName("Should passthrough when parking has no grace period configured")
  void shouldPassthroughWhenNoGrace() {
    ParkingLotPolicy policy = new ParkingLotPolicy(0, BigDecimal.ZERO, new BigDecimal("0.19"));
    OffsetDateTime entry = OffsetDateTime.parse("2026-09-07T10:00:00Z");
    OffsetDateTime exit = entry.plusMinutes(5);

    PricingContext ctx = PricingContext.of(RateReference.builder().build(), policy, entry, exit);
    PricingContext result = stage.apply(ctx);

    assertThat(result.settled()).isFalse();
    assertThat(result.subtotal()).isEqualByComparingTo(BigDecimal.ZERO);
    assertThat(result.breakpoints()).isEmpty();
  }

  @Test
  @DisplayName("Should settle with zero subtotal when stay is within free grace window")
  void shouldSettleFreeGrace() {
    ParkingLotPolicy policy = new ParkingLotPolicy(15, BigDecimal.ZERO, new BigDecimal("0.19"));
    OffsetDateTime entry = OffsetDateTime.parse("2026-09-07T10:00:00Z");
    OffsetDateTime exit = entry.plusMinutes(10);

    PricingContext ctx = PricingContext.of(RateReference.builder().build(), policy, entry, exit);
    PricingContext result = stage.apply(ctx);

    assertThat(result.settled()).isTrue();
    assertThat(result.subtotal()).isEqualByComparingTo(BigDecimal.ZERO);
    assertThat(result.breakpoints()).isEmpty();
  }

  @Test
  @DisplayName("Should settle with flat fee when stay is within priced grace window")
  void shouldSettlePricedGrace() {
    ParkingLotPolicy policy = new ParkingLotPolicy(15, new BigDecimal("500.00"), new BigDecimal("0.19"));
    OffsetDateTime entry = OffsetDateTime.parse("2026-09-07T10:00:00Z");
    OffsetDateTime exit = entry.plusMinutes(10);

    PricingContext ctx = PricingContext.of(RateReference.builder().build(), policy, entry, exit);
    PricingContext result = stage.apply(ctx);

    assertThat(result.settled()).isTrue();
    assertThat(result.subtotal()).isEqualByComparingTo(new BigDecimal("500.00"));
    assertThat(result.breakpoints()).hasSize(1);
    assertThat(result.breakpoints().getFirst().concept()).contains("Grace period");
    assertThat(result.breakpoints().getFirst().amount()).isEqualByComparingTo(new BigDecimal("500.00"));
  }

  @Test
  @DisplayName("Should passthrough when stay exceeds grace period window")
  void shouldPassthroughWhenStayExceedsGrace() {
    ParkingLotPolicy policy = new ParkingLotPolicy(15, new BigDecimal("500.00"), new BigDecimal("0.19"));
    OffsetDateTime entry = OffsetDateTime.parse("2026-09-07T10:00:00Z");
    OffsetDateTime exit = entry.plusMinutes(20);

    PricingContext ctx = PricingContext.of(RateReference.builder().build(), policy, entry, exit);
    PricingContext result = stage.apply(ctx);

    assertThat(result.settled()).isFalse();
    assertThat(result.subtotal()).isEqualByComparingTo(BigDecimal.ZERO);
    assertThat(result.breakpoints()).isEmpty();
  }
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `./gradlew test --tests dev.angelcorzo.nivo.domain.usecase.rate.engine.stages.GracePeriodStageTest` in `apps/api/`
Expected: FAIL (cannot find symbol `GracePeriodStage`).

- [ ] **Step 3: Implement `GracePeriodStage`**

Create `apps/api/src/main/java/dev/angelcorzo/nivo/domain/usecase/rate/engine/stages/GracePeriodStage.java`:

```java
package dev.angelcorzo.nivo.domain.usecase.rate.engine.stages;

import dev.angelcorzo.nivo.domain.model.parkinglots.ParkingLotPolicy;
import dev.angelcorzo.nivo.domain.usecase.rate.dtos.PriceLine;
import dev.angelcorzo.nivo.domain.usecase.rate.engine.PricingContext;
import dev.angelcorzo.nivo.domain.usecase.rate.engine.PricingStage;
import java.time.Duration;

public class GracePeriodStage implements PricingStage {

  @Override
  public PricingContext apply(PricingContext context) {
    if (context.settled()) {
      return context;
    }

    ParkingLotPolicy policy = context.policy();
    if (!policy.hasGracePeriod()) {
      return context;
    }

    Duration graceDuration = Duration.ofMinutes(policy.gracePeriodMinutes());
    if (context.duration().compareTo(graceDuration) <= 0) {
      if (policy.isGraceFree()) {
        return context.settled();
      } else {
        PriceLine line = PriceLine.of("Grace period", policy.gracePeriodPrice());
        return context.withSubtotal(policy.gracePeriodPrice(), line).settled();
      }
    }

    return context;
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `./gradlew test --tests dev.angelcorzo.nivo.domain.usecase.rate.engine.stages.GracePeriodStageTest` in `apps/api/`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/api/src/main/java/dev/angelcorzo/nivo/domain/usecase/rate/engine/stages/GracePeriodStage.java
git add apps/api/src/test/java/dev/angelcorzo/nivo/domain/usecase/rate/engine/stages/GracePeriodStageTest.java
git commit -m "feat(domain): implement GracePeriodStage with free and priced grace support"
```

---

### Task 6: Implement `BaseRateStage`

**Files:**
- Create: `apps/api/src/main/java/dev/angelcorzo/nivo/domain/usecase/rate/engine/stages/BaseRateStage.java`
- Create: `apps/api/src/test/java/dev/angelcorzo/nivo/domain/usecase/rate/engine/stages/BaseRateStageTest.java`

**Interfaces:**
- Consumes: `PricingContext`, `ParkingFeeCalculator`
- Produces: `BaseRateStage implements PricingStage`

- [ ] **Step 1: Write failing unit tests for `BaseRateStage`**

Create `apps/api/src/test/java/dev/angelcorzo/nivo/domain/usecase/rate/engine/stages/BaseRateStageTest.java`:

```java
package dev.angelcorzo.nivo.domain.usecase.rate.engine.stages;

import static org.assertj.core.api.Assertions.assertThat;

import dev.angelcorzo.nivo.domain.model.parkinglots.ParkingLotPolicy;
import dev.angelcorzo.nivo.domain.model.rates.enums.TimeUnitsRate;
import dev.angelcorzo.nivo.domain.model.rates.enums.VehicleType;
import dev.angelcorzo.nivo.domain.model.rates.valueobject.RateReference;
import dev.angelcorzo.nivo.domain.usecase.rate.engine.PricingContext;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

@DisplayName("BaseRateStage Tests")
class BaseRateStageTest {

  private final BaseRateStage stage = new BaseRateStage();

  @Test
  @DisplayName("Should skip calculation if context is already settled")
  void shouldSkipWhenSettled() {
    RateReference rate = RateReference.builder()
        .pricePerUnit(BigDecimal.valueOf(5000))
        .timeUnit(TimeUnitsRate.HOURS)
        .minChargeTimeMinutes(0)
        .build();

    OffsetDateTime entry = OffsetDateTime.parse("2026-09-07T10:00:00Z");
    PricingContext ctx = PricingContext.of(rate, ParkingLotPolicy.defaults(), entry, entry.plusMinutes(120)).settled();

    PricingContext result = stage.apply(ctx);

    assertThat(result.subtotal()).isEqualByComparingTo(BigDecimal.ZERO);
    assertThat(result.breakpoints()).isEmpty();
  }

  @Test
  @DisplayName("Should calculate base rate with ceil fraction and min charge")
  void shouldCalculateBaseRate() {
    RateReference rate = RateReference.builder()
        .id(UUID.randomUUID())
        .name("Car Hourly")
        .pricePerUnit(BigDecimal.valueOf(3000))
        .timeUnit(TimeUnitsRate.HOURS)
        .minChargeTimeMinutes(60)
        .vehicleType(VehicleType.CAR)
        .build();

    OffsetDateTime entry = OffsetDateTime.parse("2026-09-07T10:00:00Z");
    // 90 minutes = 2 hours billed with ceil (60 min minCharge respected)
    OffsetDateTime exit = entry.plusMinutes(90);

    PricingContext ctx = PricingContext.of(rate, ParkingLotPolicy.defaults(), entry, exit);
    PricingContext result = stage.apply(ctx);

    assertThat(result.subtotal()).isEqualByComparingTo(new BigDecimal("6000.00"));
    assertThat(result.breakpoints()).hasSize(1);
    assertThat(result.breakpoints().getFirst().concept()).contains("Car Hourly");
    assertThat(result.breakpoints().getFirst().amount()).isEqualByComparingTo(new BigDecimal("6000.00"));
  }
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `./gradlew test --tests dev.angelcorzo.nivo.domain.usecase.rate.engine.stages.BaseRateStageTest` in `apps/api/`
Expected: FAIL (cannot find symbol `BaseRateStage`).

- [ ] **Step 3: Implement `BaseRateStage`**

Create `apps/api/src/main/java/dev/angelcorzo/nivo/domain/usecase/rate/engine/stages/BaseRateStage.java`:

```java
package dev.angelcorzo.nivo.domain.usecase.rate.engine.stages;

import dev.angelcorzo.nivo.domain.model.rates.enums.TimeUnitsRate;
import dev.angelcorzo.nivo.domain.model.rates.valueobject.RateReference;
import dev.angelcorzo.nivo.domain.usecase.rate.dtos.PriceLine;
import dev.angelcorzo.nivo.domain.usecase.rate.engine.PricingContext;
import dev.angelcorzo.nivo.domain.usecase.rate.engine.PricingStage;
import dev.angelcorzo.nivo.domain.usecase.rate.utils.ParkingFeeCalculator;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.temporal.ChronoUnit;

public class BaseRateStage implements PricingStage {

  @Override
  public PricingContext apply(PricingContext context) {
    if (context.settled()) {
      return context;
    }

    RateReference rate = context.rate();
    TimeUnitsRate timeUnit = rate.timeUnit();
    Duration minDuration = Duration.of(rate.minChargeTimeMinutes(), ChronoUnit.MINUTES);

    BigDecimal fee = ParkingFeeCalculator.calculateFee(
        context.duration(),
        rate.pricePerUnit(),
        minDuration,
        timeUnit.getChronoUnit(),
        RoundingMode.HALF_UP
    );

    String concept = String.format(
        "%s (%s * %d COP/%s)",
        rate.name(),
        timeUnit.getDurationTime(context.duration()),
        rate.pricePerUnit().intValue(),
        timeUnit.getName()
    );

    return context.withSubtotal(fee, PriceLine.of(concept, fee));
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `./gradlew test --tests dev.angelcorzo.nivo.domain.usecase.rate.engine.stages.BaseRateStageTest` in `apps/api/`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/api/src/main/java/dev/angelcorzo/nivo/domain/usecase/rate/engine/stages/BaseRateStage.java
git add apps/api/src/test/java/dev/angelcorzo/nivo/domain/usecase/rate/engine/stages/BaseRateStageTest.java
git commit -m "feat(domain): implement BaseRateStage using ParkingFeeCalculator"
```

---

### Task 7: Implement `SpecialPolicyStage` (with TIME PricePerUnit Bug Fix & Surcharge Support)

**Files:**
- Create: `apps/api/src/main/java/dev/angelcorzo/nivo/domain/usecase/rate/engine/stages/SpecialPolicyStage.java`
- Create: `apps/api/src/test/java/dev/angelcorzo/nivo/domain/usecase/rate/engine/stages/SpecialPolicyStageTest.java`

**Interfaces:**
- Consumes: `PricingContext` (with `SpecialPoliciesReference`)
- Produces: `SpecialPolicyStage implements PricingStage` (records net delta in `PriceLine`).

- [ ] **Step 1: Write comprehensive failing unit tests for `SpecialPolicyStage`**

Create `apps/api/src/test/java/dev/angelcorzo/nivo/domain/usecase/rate/engine/stages/SpecialPolicyStageTest.java`:

```java
package dev.angelcorzo.nivo.domain.usecase.rate.engine.stages;

import static org.assertj.core.api.Assertions.assertThat;

import dev.angelcorzo.nivo.domain.model.parkinglots.ParkingLotPolicy;
import dev.angelcorzo.nivo.domain.model.rates.enums.TimeUnitsRate;
import dev.angelcorzo.nivo.domain.model.rates.valueobject.RateReference;
import dev.angelcorzo.nivo.domain.model.specialpolicies.enums.ModifiesTypes;
import dev.angelcorzo.nivo.domain.model.specialpolicies.enums.OperationsTypes;
import dev.angelcorzo.nivo.domain.model.specialpolicies.valueobjects.SpecialPoliciesReference;
import dev.angelcorzo.nivo.domain.usecase.rate.dtos.PriceLine;
import dev.angelcorzo.nivo.domain.usecase.rate.engine.PricingContext;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

@DisplayName("SpecialPolicyStage Tests")
class SpecialPolicyStageTest {

  private final SpecialPolicyStage stage = new SpecialPolicyStage();

  private PricingContext buildContext(BigDecimal subtotal, SpecialPoliciesReference policy) {
    RateReference rate = RateReference.builder()
        .name("Rate")
        .pricePerUnit(BigDecimal.valueOf(5000))
        .timeUnit(TimeUnitsRate.HOURS)
        .minChargeTimeMinutes(0)
        .specialPolicy(policy)
        .build();

    OffsetDateTime entry = OffsetDateTime.parse("2026-09-07T10:00:00Z");
    OffsetDateTime exit = entry.plusHours(4); // 4 hours
    PricingContext ctx = PricingContext.of(rate, ParkingLotPolicy.defaults(), entry, exit);
    return ctx.withSubtotal(subtotal, PriceLine.of("Base", subtotal));
  }

  @Test
  @DisplayName("PRICE SUBTRACT should discount subtotal with floor at zero and record delta")
  void shouldSubtractPriceWithFloor() {
    SpecialPoliciesReference policy = SpecialPoliciesReference.builder()
        .name("Big Discount")
        .modifies(ModifiesTypes.PRICE)
        .operation(OperationsTypes.SUBTRACT)
        .valueToModify(BigDecimal.valueOf(25000))
        .active(true)
        .build();

    PricingContext ctx = buildContext(BigDecimal.valueOf(20000), policy);
    PricingContext result = stage.apply(ctx);

    assertThat(result.subtotal()).isEqualByComparingTo(BigDecimal.ZERO);
    assertThat(result.breakpoints()).hasSize(2);
    // Delta should be -20000
    PriceLine discountLine = result.breakpoints().get(1);
    assertThat(discountLine.concept()).isEqualTo("Big Discount");
    assertThat(discountLine.amount()).isEqualByComparingTo(BigDecimal.valueOf(-20000));
  }

  @Test
  @DisplayName("SURCHARGE PERCENTAGE should add surcharge amount and record positive delta")
  void shouldApplySurchargePercentage() {
    SpecialPoliciesReference policy = SpecialPoliciesReference.builder()
        .name("Night Surcharge")
        .modifies(ModifiesTypes.SURCHARGE)
        .operation(OperationsTypes.PERCENTAGE)
        .valueToModify(BigDecimal.valueOf(20)) // +20%
        .active(true)
        .build();

    PricingContext ctx = buildContext(BigDecimal.valueOf(10000), policy);
    PricingContext result = stage.apply(ctx);

    assertThat(result.subtotal()).isEqualByComparingTo(new BigDecimal("12000.00"));
    PriceLine surchargeLine = result.breakpoints().get(1);
    assertThat(surchargeLine.concept()).isEqualTo("Night Surcharge");
    assertThat(surchargeLine.amount()).isEqualByComparingTo(new BigDecimal("2000.00"));
  }

  @Test
  @DisplayName("TIME SUBTRACT bug fix: must recalculate using rate.pricePerUnit, not accumulated subtotal")
  void shouldRecalculateDurationUsingPricePerUnit() {
    SpecialPoliciesReference policy = SpecialPoliciesReference.builder()
        .name("1 Hour Free")
        .modifies(ModifiesTypes.TIME)
        .operation(OperationsTypes.SUBTRACT)
        .valueToModify(BigDecimal.valueOf(1)) // minus 1 hour
        .active(true)
        .build();

    // 4 hours stayed = 20000 base. 4h - 1h = 3h. 3h * 5000 (pricePerUnit) = 15000 (NOT 3 * 20000 = 60000!)
    PricingContext ctx = buildContext(BigDecimal.valueOf(20000), policy);
    PricingContext result = stage.apply(ctx);

    assertThat(result.subtotal()).isEqualByComparingTo(new BigDecimal("15000.00"));
    PriceLine timeLine = result.breakpoints().get(1);
    assertThat(timeLine.concept()).isEqualTo("1 Hour Free");
    assertThat(timeLine.amount()).isEqualByComparingTo(new BigDecimal("-5000.00"));
  }
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `./gradlew test --tests dev.angelcorzo.nivo.domain.usecase.rate.engine.stages.SpecialPolicyStageTest` in `apps/api/`
Expected: FAIL (cannot find symbol `SpecialPolicyStage`).

- [ ] **Step 3: Implement `SpecialPolicyStage`**

Create `apps/api/src/main/java/dev/angelcorzo/nivo/domain/usecase/rate/engine/stages/SpecialPolicyStage.java`:

```java
package dev.angelcorzo.nivo.domain.usecase.rate.engine.stages;

import dev.angelcorzo.nivo.domain.model.rates.valueobject.RateReference;
import dev.angelcorzo.nivo.domain.model.specialpolicies.enums.OperationsTypes;
import dev.angelcorzo.nivo.domain.model.specialpolicies.valueobjects.SpecialPoliciesReference;
import dev.angelcorzo.nivo.domain.usecase.rate.dtos.PriceLine;
import dev.angelcorzo.nivo.domain.usecase.rate.engine.PricingContext;
import dev.angelcorzo.nivo.domain.usecase.rate.engine.PricingStage;
import dev.angelcorzo.nivo.domain.usecase.rate.utils.ParkingFeeCalculator;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.temporal.ChronoUnit;
import java.time.temporal.TemporalUnit;

public class SpecialPolicyStage implements PricingStage {

  @Override
  public PricingContext apply(PricingContext context) {
    if (context.settled() || !context.rate().hasSpecialPolicy()) {
      return context;
    }

    SpecialPoliciesReference policy = context.rate().specialPolicy();
    if (!policy.active()) {
      return context;
    }

    return switch (policy.modifies()) {
      case TIME -> applyTimeModification(context, policy);
      case SURCHARGE -> applySurcharge(context, policy);
      case PRICE, DISCOUNT -> applyDiscountOrPrice(context, policy);
    };
  }

  private PricingContext applyTimeModification(PricingContext context, SpecialPoliciesReference policy) {
    Duration adjustedDuration = calculateAdjustedDuration(context, policy);
    RateReference rate = context.rate();
    Duration minDuration = Duration.of(rate.minChargeTimeMinutes(), ChronoUnit.MINUTES);

    BigDecimal newFee = ParkingFeeCalculator.calculateFee(
        adjustedDuration,
        rate.pricePerUnit(), // FIX: use rate.pricePerUnit(), NOT accumulated subtotal
        minDuration,
        rate.timeUnit().getChronoUnit(),
        RoundingMode.HALF_UP
    );

    BigDecimal delta = newFee.subtract(context.subtotal());
    return context.withSubtotal(newFee, PriceLine.of(policy.name(), delta));
  }

  private PricingContext applySurcharge(PricingContext context, SpecialPoliciesReference policy) {
    BigDecimal current = context.subtotal();
    BigDecimal surchargeAmount = switch (policy.operation()) {
      case SET -> policy.valueToModify();
      case SUBTRACT -> policy.valueToModify();
      case PERCENTAGE -> current.multiply(policy.valueToModify().divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP));
    };

    BigDecimal newSubtotal = current.add(surchargeAmount);
    return context.withSubtotal(newSubtotal, PriceLine.of(policy.name(), surchargeAmount));
  }

  private PricingContext applyDiscountOrPrice(PricingContext context, SpecialPoliciesReference policy) {
    BigDecimal current = context.subtotal();
    BigDecimal newSubtotal = switch (policy.operation()) {
      case SET -> policy.valueToModify();
      case SUBTRACT -> current.subtract(policy.valueToModify());
      case PERCENTAGE -> {
        BigDecimal discount = current.multiply(policy.valueToModify().divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP));
        yield current.subtract(discount);
      }
    };

    if (newSubtotal.compareTo(BigDecimal.ZERO) < 0) {
      newSubtotal = BigDecimal.ZERO;
    }

    BigDecimal delta = newSubtotal.subtract(current);
    return context.withSubtotal(newSubtotal, PriceLine.of(policy.name(), delta));
  }

  private Duration calculateAdjustedDuration(PricingContext context, SpecialPoliciesReference policy) {
    Duration current = context.duration();
    TemporalUnit unit = context.rate().timeUnit().getChronoUnit();
    Duration modDuration = Duration.of(policy.valueToModify().longValue(), unit);

    return switch (policy.operation()) {
      case SET -> modDuration;
      case SUBTRACT -> {
        Duration subtracted = current.minus(modDuration);
        yield subtracted.isNegative() ? Duration.ZERO : subtracted;
      }
      case PERCENTAGE -> {
        BigDecimal factor = BigDecimal.ONE.subtract(policy.valueToModify().divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP));
        long newMillis = BigDecimal.valueOf(current.toMillis()).multiply(factor).longValue();
        yield Duration.ofMillis(Math.max(0, newMillis));
      }
    };
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `./gradlew test --tests dev.angelcorzo.nivo.domain.usecase.rate.engine.stages.SpecialPolicyStageTest` in `apps/api/`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/api/src/main/java/dev/angelcorzo/nivo/domain/usecase/rate/engine/stages/SpecialPolicyStage.java
git add apps/api/src/test/java/dev/angelcorzo/nivo/domain/usecase/rate/engine/stages/SpecialPolicyStageTest.java
git commit -m "feat(domain): implement SpecialPolicyStage with TIME unit bugfix and SURCHARGE support"
```

---

### Task 8: Implement Stubs (`SubscriberStage`, `StampsStage`, `DayCapStage`)

**Files:**
- Create: `apps/api/src/main/java/dev/angelcorzo/nivo/domain/usecase/rate/engine/stages/SubscriberStage.java`
- Create: `apps/api/src/main/java/dev/angelcorzo/nivo/domain/usecase/rate/engine/stages/StampsStage.java`
- Create: `apps/api/src/main/java/dev/angelcorzo/nivo/domain/usecase/rate/engine/stages/DayCapStage.java`

**Interfaces:**
- Produces: No-op `PricingStage` implementations ready for future tickets.

- [ ] **Step 1: Implement three stub stages**

Create `apps/api/src/main/java/dev/angelcorzo/nivo/domain/usecase/rate/engine/stages/SubscriberStage.java`:
```java
package dev.angelcorzo.nivo.domain.usecase.rate.engine.stages;

import dev.angelcorzo.nivo.domain.usecase.rate.engine.PricingContext;
import dev.angelcorzo.nivo.domain.usecase.rate.engine.PricingStage;

/**
 * Stub stage for Monthly Subscriber Contracts.
 * TODO: ANC-XX Integrate SubscriberContract checking when subscriber domain is ready.
 */
public class SubscriberStage implements PricingStage {
  @Override
  public PricingContext apply(PricingContext context) {
    return context;
  }
}
```

Create `apps/api/src/main/java/dev/angelcorzo/nivo/domain/usecase/rate/engine/stages/StampsStage.java`:
```java
package dev.angelcorzo.nivo.domain.usecase.rate.engine.stages;

import dev.angelcorzo.nivo.domain.usecase.rate.engine.PricingContext;
import dev.angelcorzo.nivo.domain.usecase.rate.engine.PricingStage;

/**
 * Stub stage for Commercial Validation Stamps (Cinema, Supermarket).
 * TODO: ANC-XX Integrate commercial stamp deductions when merchant module is ready.
 */
public class StampsStage implements PricingStage {
  @Override
  public PricingContext apply(PricingContext context) {
    return context;
  }
}
```

Create `apps/api/src/main/java/dev/angelcorzo/nivo/domain/usecase/rate/engine/stages/DayCapStage.java`:
```java
package dev.angelcorzo.nivo.domain.usecase.rate.engine.stages;

import dev.angelcorzo.nivo.domain.usecase.rate.engine.PricingContext;
import dev.angelcorzo.nivo.domain.usecase.rate.engine.PricingStage;

/**
 * Stub stage for Maximum Daily Cap.
 * TODO: ANC-XX Enforce day cap safeguard against total stay cost.
 */
public class DayCapStage implements PricingStage {
  @Override
  public PricingContext apply(PricingContext context) {
    return context;
  }
}
```

- [ ] **Step 2: Run build to ensure compilation**

Run: `./gradlew testClasses` in `apps/api/`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add apps/api/src/main/java/dev/angelcorzo/nivo/domain/usecase/rate/engine/stages/
git commit -m "feat(domain): add SubscriberStage, StampsStage, and DayCapStage pipeline stubs"
```

---

### Task 9: Implement `PricingEngine` and `PriceDetailed.from()`

**Files:**
- Modify: `apps/api/src/main/java/dev/angelcorzo/nivo/domain/usecase/rate/dtos/PriceDetailed.java`
- Create: `apps/api/src/main/java/dev/angelcorzo/nivo/domain/usecase/rate/engine/PricingEngine.java`
- Create: `apps/api/src/test/java/dev/angelcorzo/nivo/domain/usecase/rate/engine/PricingEngineTest.java`

**Interfaces:**
- Consumes: `List<PricingStage>`, `PricingContext`
- Produces: `PricingEngine.calculate(PricingContext, String tenantName)` returning `PriceDetailed`.

- [ ] **Step 1: Write failing unit test for `PricingEngine` and `PriceDetailed.from()`**

Create `apps/api/src/test/java/dev/angelcorzo/nivo/domain/usecase/rate/engine/PricingEngineTest.java`:

```java
package dev.angelcorzo.nivo.domain.usecase.rate.engine;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import dev.angelcorzo.nivo.domain.model.parkinglots.ParkingLotPolicy;
import dev.angelcorzo.nivo.domain.model.rates.valueobject.RateReference;
import dev.angelcorzo.nivo.domain.usecase.rate.dtos.PriceDetailed;
import dev.angelcorzo.nivo.domain.usecase.rate.dtos.PriceLine;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

@DisplayName("PricingEngine Tests")
class PricingEngineTest {

  @Test
  @DisplayName("Should short-circuit remaining stages when settled is true")
  void shouldShortCircuitWhenSettled() {
    PricingStage stage1 = mock(PricingStage.class);
    PricingStage stage2 = mock(PricingStage.class);

    when(stage1.apply(any())).thenAnswer(inv -> {
      PricingContext c = inv.getArgument(0);
      return c.withSubtotal(new BigDecimal("500.00"), PriceLine.of("Grace", new BigDecimal("500.00"))).settled();
    });

    PricingEngine engine = new PricingEngine(List.of(stage1, stage2));

    OffsetDateTime now = OffsetDateTime.now();
    PricingContext ctx = PricingContext.of(RateReference.builder().build(), ParkingLotPolicy.defaults(), now.minusMinutes(5), now);

    PriceDetailed detailed = engine.calculate(ctx, "Test Parking");

    verify(stage1, times(1)).apply(any());
    verify(stage2, never()).apply(any());

    assertThat(detailed.getSubtotal()).isEqualByComparingTo(new BigDecimal("500.00"));
    assertThat(detailed.getTotal()).isEqualByComparingTo(new BigDecimal("595.00")); // 500 + 19% IVA
  }
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `./gradlew test --tests dev.angelcorzo.nivo.domain.usecase.rate.engine.PricingEngineTest` in `apps/api/`
Expected: FAIL (cannot find symbol `PricingEngine`).

- [ ] **Step 3: Update `PriceDetailed` and create `PricingEngine`**

In `apps/api/src/main/java/dev/angelcorzo/nivo/domain/usecase/rate/dtos/PriceDetailed.java`:
Add static factory method:
```java
  public static PriceDetailed from(dev.angelcorzo.nivo.domain.usecase.rate.engine.PricingContext context, String tenantName) {
    PriceDetailed detailed = new PriceDetailed(tenantName);
    detailed.setIvaRate(context.policy().ivaRate());
    for (PriceLine line : context.breakpoints()) {
      detailed.addLine(line);
    }
    return detailed;
  }
```

Create `apps/api/src/main/java/dev/angelcorzo/nivo/domain/usecase/rate/engine/PricingEngine.java`:
```java
package dev.angelcorzo.nivo.domain.usecase.rate.engine;

import dev.angelcorzo.nivo.domain.usecase.rate.dtos.PriceDetailed;
import java.util.List;

public class PricingEngine {
  private final List<PricingStage> stages;

  public PricingEngine(List<PricingStage> stages) {
    this.stages = List.copyOf(stages);
  }

  public PriceDetailed calculate(PricingContext context, String tenantName) {
    PricingContext current = context;
    for (PricingStage stage : this.stages) {
      current = stage.apply(current);
      if (current.settled()) {
        break;
      }
    }
    return PriceDetailed.from(current, tenantName);
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `./gradlew test --tests dev.angelcorzo.nivo.domain.usecase.rate.engine.PricingEngineTest` in `apps/api/`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/api/src/main/java/dev/angelcorzo/nivo/domain/usecase/rate/dtos/PriceDetailed.java
git add apps/api/src/main/java/dev/angelcorzo/nivo/domain/usecase/rate/engine/PricingEngine.java
git add apps/api/src/test/java/dev/angelcorzo/nivo/domain/usecase/rate/engine/PricingEngineTest.java
git commit -m "feat(domain): implement PricingEngine pipeline with short-circuiting and PriceDetailed factory"
```

---

### Task 10: Refactor `CalculateRateUseCase` & Wiring

**Files:**
- Modify: `apps/api/src/main/java/dev/angelcorzo/nivo/domain/usecase/rate/CalculateRateUseCase.java`
- Modify: `apps/api/src/main/java/dev/angelcorzo/nivo/config/UseCasesConfig.java`
- Create: `apps/api/src/main/java/dev/angelcorzo/nivo/config/AppConfig.java`
- Modify: `apps/api/src/test/java/dev/angelcorzo/nivo/domain/usecase/rate/CalculateRateUseCaseTest.java`

**Interfaces:**
- Consumes: `ParkingTicketsRepository`, `ParkingLotsRepository`, `AuthenticationContextGateway`, `PricingEngine`, `Clock`
- Produces: `CalculateRateUseCase.execute(UUID ticketId)` returning `PriceDetailed`.

- [ ] **Step 1: Update `CalculateRateUseCaseTest` with Clock mock and new dependencies**

Rewrite `apps/api/src/test/java/dev/angelcorzo/nivo/domain/usecase/rate/CalculateRateUseCaseTest.java`:

```java
package dev.angelcorzo.nivo.domain.usecase.rate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import dev.angelcorzo.nivo.domain.model.authentication.gateway.AuthenticationContextGateway;
import dev.angelcorzo.nivo.domain.model.parkinglots.ParkingLotPolicy;
import dev.angelcorzo.nivo.domain.model.parkinglots.ParkingLots;
import dev.angelcorzo.nivo.domain.model.parkinglots.gateways.ParkingLotsRepository;
import dev.angelcorzo.nivo.domain.model.parkingtickets.ParkingTicketNotFound;
import dev.angelcorzo.nivo.domain.model.parkingtickets.ParkingTickets;
import dev.angelcorzo.nivo.domain.model.parkingtickets.gateways.ParkingTicketsRepository;
import dev.angelcorzo.nivo.domain.model.rates.enums.TimeUnitsRate;
import dev.angelcorzo.nivo.domain.model.rates.enums.VehicleType;
import dev.angelcorzo.nivo.domain.model.rates.valueobject.RateReference;
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
    when(authGateway.getCurrentTenantName()).thenReturn("Central Parking");

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
    when(authGateway.getCurrentTenantName()).thenReturn("Central Parking");

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
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `./gradlew test --tests dev.angelcorzo.nivo.domain.usecase.rate.CalculateRateUseCaseTest` in `apps/api/`
Expected: FAIL.

- [ ] **Step 3: Refactor `CalculateRateUseCase.java`**

In `apps/api/src/main/java/dev/angelcorzo/nivo/domain/usecase/rate/CalculateRateUseCase.java`:

```java
package dev.angelcorzo.nivo.domain.usecase.rate;

import dev.angelcorzo.nivo.domain.model.authentication.gateway.AuthenticationContextGateway;
import dev.angelcorzo.nivo.domain.model.parkinglots.ParkingLotPolicy;
import dev.angelcorzo.nivo.domain.model.parkinglots.ParkingLots;
import dev.angelcorzo.nivo.domain.model.parkinglots.exceptions.ParkingNotExistsException;
import dev.angelcorzo.nivo.domain.model.parkinglots.gateways.ParkingLotsRepository;
import dev.angelcorzo.nivo.domain.model.parkingtickets.ParkingTicketNotFound;
import dev.angelcorzo.nivo.domain.model.parkingtickets.ParkingTickets;
import dev.angelcorzo.nivo.domain.model.parkingtickets.gateways.ParkingTicketsRepository;
import dev.angelcorzo.nivo.domain.model.rates.valueobject.RateReference;
import dev.angelcorzo.nivo.domain.usecase.rate.dtos.PriceDetailed;
import dev.angelcorzo.nivo.domain.usecase.rate.engine.PricingContext;
import dev.angelcorzo.nivo.domain.usecase.rate.engine.PricingEngine;
import java.time.Clock;
import java.time.OffsetDateTime;
import java.util.UUID;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public class CalculateRateUseCase {
  private final ParkingTicketsRepository parkingTicketsRepository;
  private final ParkingLotsRepository parkingLotsRepository;
  private final AuthenticationContextGateway authenticationContextGateway;
  private final PricingEngine pricingEngine;
  private final Clock clock;

  public PriceDetailed execute(UUID ticketId) {
    final ParkingTickets parkingTicket =
        this.parkingTicketsRepository
            .findById(ticketId)
            .orElseThrow(() -> new ParkingTicketNotFound(ticketId));

    UUID parkingId = parkingTicket.getSlot() != null ? resolveParkingIdFromTicket(parkingTicket) : null;
    return execute(ticketId, parkingId);
  }

  public PriceDetailed execute(UUID ticketId, UUID parkingLotId) {
    final ParkingTickets parkingTicket =
        this.parkingTicketsRepository
            .findById(ticketId)
            .orElseThrow(() -> new ParkingTicketNotFound(ticketId));

    ParkingLotPolicy policy = ParkingLotPolicy.defaults();
    if (parkingLotId != null) {
      policy = this.parkingLotsRepository
          .findById(parkingLotId)
          .map(ParkingLots::getPolicy)
          .orElse(ParkingLotPolicy.defaults());
    }

    final String tenantName = this.authenticationContextGateway.getCurrentTenantName();
    final RateReference rate = parkingTicket.getRate();

    final PricingContext context = PricingContext.of(
        rate,
        policy,
        parkingTicket.getEntryTime(),
        OffsetDateTime.now(this.clock)
    );

    return this.pricingEngine.calculate(context, tenantName);
  }

  private UUID resolveParkingIdFromTicket(ParkingTickets ticket) {
    // Falls back to safe default if slot does not have parking reference
    return null;
  }
}
```

- [ ] **Step 4: Create `AppConfig.java` & update `UseCasesConfig.java`**

Create `apps/api/src/main/java/dev/angelcorzo/nivo/config/AppConfig.java`:
```java
package dev.angelcorzo.nivo.config;

import java.time.Clock;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AppConfig {
  @Bean
  public Clock clock() {
    return Clock.systemDefaultZone();
  }
}
```

In `apps/api/src/main/java/dev/angelcorzo/nivo/config/UseCasesConfig.java`:
Add bean definition for `PricingEngine`:
```java
  @Bean
  public dev.angelcorzo.nivo.domain.usecase.rate.engine.PricingEngine pricingEngine() {
    return new dev.angelcorzo.nivo.domain.usecase.rate.engine.PricingEngine(java.util.List.of(
        new dev.angelcorzo.nivo.domain.usecase.rate.engine.stages.GracePeriodStage(),
        new dev.angelcorzo.nivo.domain.usecase.rate.engine.stages.BaseRateStage(),
        new dev.angelcorzo.nivo.domain.usecase.rate.engine.stages.SpecialPolicyStage(),
        new dev.angelcorzo.nivo.domain.usecase.rate.engine.stages.SubscriberStage(),
        new dev.angelcorzo.nivo.domain.usecase.rate.engine.stages.StampsStage(),
        new dev.angelcorzo.nivo.domain.usecase.rate.engine.stages.DayCapStage()
    ));
  }
```

- [ ] **Step 5: Run tests to verify it passes**

Run: `./gradlew test --tests dev.angelcorzo.nivo.domain.usecase.rate.CalculateRateUseCaseTest` in `apps/api/`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add apps/api/src/main/java/dev/angelcorzo/nivo/config/
git add apps/api/src/main/java/dev/angelcorzo/nivo/domain/usecase/rate/CalculateRateUseCase.java
git add apps/api/src/test/java/dev/angelcorzo/nivo/domain/usecase/rate/CalculateRateUseCaseTest.java
git commit -m "feat(domain): refactor CalculateRateUseCase to use PricingEngine pipeline and Clock"
```

---

### Task 11: Delete Obsolete Decorators & Cleanup

**Files:**
- Delete: `apps/api/src/main/java/dev/angelcorzo/nivo/domain/usecase/rate/decorator/RateBaseDecorator.java`
- Delete: `apps/api/src/main/java/dev/angelcorzo/nivo/domain/usecase/rate/decorator/RateWithSpecialPolicyDecorator.java`
- Delete: `apps/api/src/main/java/dev/angelcorzo/nivo/domain/usecase/rate/decorator/RateComponent.java`
- Delete: `apps/api/src/test/java/dev/angelcorzo/nivo/domain/usecase/rate/decorator/RateWithSpecialPolicyDecoratorTest.java`

- [ ] **Step 1: Delete obsolete decorator files**

```bash
rm -f apps/api/src/main/java/dev/angelcorzo/nivo/domain/usecase/rate/decorator/RateBaseDecorator.java
rm -f apps/api/src/main/java/dev/angelcorzo/nivo/domain/usecase/rate/decorator/RateWithSpecialPolicyDecorator.java
rm -f apps/api/src/main/java/dev/angelcorzo/nivo/domain/usecase/rate/decorator/RateComponent.java
rm -f apps/api/src/test/java/dev/angelcorzo/nivo/domain/usecase/rate/decorator/RateWithSpecialPolicyDecoratorTest.java
```

- [ ] **Step 2: Run full build and test suite**

Run: `./gradlew test` in `apps/api/`
Expected: PASS with 0 compilation errors and all tests green.

- [ ] **Step 3: Commit**

```bash
git add -u apps/api/src/main/java/dev/angelcorzo/nivo/domain/usecase/rate/decorator/
git add -u apps/api/src/test/java/dev/angelcorzo/nivo/domain/usecase/rate/decorator/
git commit -m "refactor(domain): remove obsolete rate decorators replaced by PricingStage pipeline"
```

---

### Task 12: Full Verification Suite

**Files:**
- Test all components across unit and integration tests.

- [ ] **Step 1: Run complete Gradle check (tests + linting)**

Run: `./gradlew check` in `apps/api/`
Expected: BUILD SUCCESSFUL.

- [ ] **Step 2: Verify git status is clean**

Run: `git status` in root
Expected: Working tree clean.
