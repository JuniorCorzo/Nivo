# Design: Pricing Engine Refactor

## Overview

Full rewrite of the `domain/usecase/rate` module and introduction of `ParkingLotPolicy` value object in `domain/model/parkinglots`. The Decorator pattern is replaced by an explicit `List<PricingStage>` pipeline orchestrated by a `PricingEngine` domain service.

---

## 1. Domain Model Changes

### 1.1 `ParkingLotPolicy` — new Value Object (embedded in `ParkingLots`)

```
domain/model/parkinglots/ParkingLotPolicy.java   ADDED
```

A record that carries the liquidation rules of a parking lot:

| Field | Type | Semantics |
|---|---|---|
| `gracePeriodMinutes` | `int` | Window after entry where grace applies. 0 = no grace. |
| `gracePeriodPrice` | `BigDecimal` | Flat price charged if stay ≤ grace window. 0.00 = free. |
| `ivaRate` | `BigDecimal` | Tax rate applied to subtotal. Replaces the hardcoded 0.19. |

**Extensibility contract**: `ParkingLotPolicy` is designed to be promoted to an interface in a future iteration with two implementations: `ParkingLevelPolicy` and `GlobalPolicy` (scope enum `PARKING | GLOBAL`). The `PricingEngine` and all stages only depend on the record fields — no code change required in the engine when that migration happens.

```java
public record ParkingLotPolicy(
    int        gracePeriodMinutes,
    BigDecimal gracePeriodPrice,
    BigDecimal ivaRate
) {
    public static ParkingLotPolicy defaults() {
        return new ParkingLotPolicy(0, BigDecimal.ZERO, new BigDecimal("0.19"));
    }

    public boolean hasGracePeriod() {
        return gracePeriodMinutes > 0;
    }

    public boolean isGraceFree() {
        return gracePeriodPrice.compareTo(BigDecimal.ZERO) == 0;
    }
}
```

`ParkingLots` gains a field `private ParkingLotPolicy policy` (non-null, defaults via `ParkingLotPolicy.defaults()`).

### 1.2 `Rates` — fix code smell

`minChargeTimeMinutes` changes from `String` to `int`. Same fix propagates to `RateReference`.

### 1.3 DB Migration (Flyway)

New columns on `parking_lots`:

```sql
ALTER TABLE parking_lots
    ADD COLUMN grace_period_minutes INT           NOT NULL DEFAULT 0,
    ADD COLUMN grace_period_price   NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    ADD COLUMN iva_rate             NUMERIC(5,4)  NOT NULL DEFAULT 0.19;
```

`minChargeTimeMinutes` column on `rates` (if stored as VARCHAR): migrate to INTEGER.

---

## 2. PricingEngine Pipeline

### 2.1 `PricingContext` — immutable context flowing through stages

```
domain/usecase/rate/engine/PricingContext.java   ADDED
```

```java
public record PricingContext(
    RateReference    rate,
    ParkingLotPolicy policy,
    OffsetDateTime   entryTime,
    OffsetDateTime   exitTime,
    Duration         duration,       // derived: exitTime - entryTime
    BigDecimal       subtotal,       // accumulated by each stage
    List<PriceLine>  breakpoints,    // itemized price lines
    boolean          settled         // true = pipeline stops immediately
) {
    public static PricingContext of(RateReference rate, ParkingLotPolicy policy,
                                    OffsetDateTime entryTime, OffsetDateTime exitTime) {
        return new PricingContext(
            rate, policy, entryTime, exitTime,
            Duration.between(entryTime, exitTime),
            BigDecimal.ZERO, List.of(), false
        );
    }

    public PricingContext withSubtotal(BigDecimal newSubtotal, PriceLine line) { ... }
    public PricingContext settled() { ... }
}
```

### 2.2 `PricingStage` — functional interface

```
domain/usecase/rate/engine/PricingStage.java   ADDED
```

```java
@FunctionalInterface
public interface PricingStage {
    PricingContext apply(PricingContext context);
}
```

### 2.3 Stages

```
domain/usecase/rate/engine/stages/
  GracePeriodStage.java    ADDED  (implemented)
  BaseRateStage.java       ADDED  (implemented)
  SpecialPolicyStage.java  ADDED  (implemented)
  SubscriberStage.java     ADDED  (stub no-op)
  StampsStage.java         ADDED  (stub no-op)
  DayCapStage.java         ADDED  (stub no-op)
```

**`GracePeriodStage` logic:**

```
if !policy.hasGracePeriod() → return context unchanged
if duration ≤ gracePeriodMinutes:
    if policy.isGraceFree() → return context.settled() with subtotal=0
    else → return context.settled() with subtotal=gracePeriodPrice + PriceLine("Grace period", gracePeriodPrice)
else:
    return context unchanged (normal billing applies)
```

**`BaseRateStage` logic:**

```
if context.settled() → return context unchanged (skip)
fee = ParkingFeeCalculator.calculateFee(duration, pricePerUnit, minChargeDuration, timeUnit, HALF_UP)
return context.withSubtotal(fee, PriceLine(concept, fee))
```

**`SpecialPolicyStage` logic:**

```
if context.settled() → return context unchanged
if !rate.hasSpecialPolicy() → return context unchanged

switch (policy.modifies()) {
    case TIME:
        newDuration = calculatedAdjustedDuration(context.duration(), policy)
        adjustedFee = ParkingFeeCalculator.calculateFee(
            newDuration,
            context.rate().pricePerUnit(), // FIX: use unit rate pricePerUnit, NOT accumulated subtotal!
            minDuration,
            context.rate().timeUnit().getChronoUnit(),
            RoundingMode.HALF_UP
        )
        delta = adjustedFee.subtract(context.subtotal())
        return context.withSubtotal(adjustedFee, PriceLine(policy.name(), delta))

    case SURCHARGE:
        surchargeAmount = calculateSurcharge(context.subtotal(), policy)
        newSubtotal = context.subtotal().add(surchargeAmount)
        return context.withSubtotal(newSubtotal, PriceLine(policy.name(), surchargeAmount))

    case PRICE:
    case DISCOUNT:
        newSubtotal = calculateDiscountedPrice(context.subtotal(), policy) // floors at BigDecimal.ZERO
        delta = newSubtotal.subtract(context.subtotal()) // negative or zero
        return context.withSubtotal(newSubtotal, PriceLine(policy.name(), delta))
}
```

**Stub stages:** Return `context` unmodified. Javadoc references the future ticket.

### 2.4 `PricingEngine` — domain service

```
domain/usecase/rate/engine/PricingEngine.java   ADDED
```

```java
public class PricingEngine {
    private final List<PricingStage> stages;

    public PricingEngine(List<PricingStage> stages) {
        this.stages = List.copyOf(stages);  // defensive copy, immutable order
    }

    public PriceDetailed calculate(PricingContext ctx, String tenantName) {
        PricingContext result = ctx;
        for (PricingStage stage : stages) {
            result = stage.apply(result);
            if (result.settled()) break;
        }
        return PriceDetailed.from(result, tenantName);
    }
}
```

`PriceDetailed` gains a static factory `from(PricingContext, String tenantName)` that reads `context.breakpoints()`, `context.subtotal()`, and `context.policy().ivaRate()`.

---

## 3. Use Case Refactor

### 3.1 `CalculateRateUseCase`

```
domain/usecase/rate/CalculateRateUseCase.java   MODIFIED
```

Dependencies change:

| Before | After |
|---|---|
| `TenantsRepository` | removed (tenantName via authCtx directly) |
| _(none)_ | `ParkingLotsRepository` added |
| _(none)_ | `PricingEngine` added |
| _(none)_ | `Clock` added (for testable `now()`) |

Flow:

```
1. Load ParkingTickets by ticketId
2. Load ParkingLots by ticket.parkingId → extract policy
3. Resolve tenantName from authCtx
4. Build PricingContext.of(rate, policy, entryTime, now(clock))
5. pricingEngine.calculate(ctx, tenantName)
6. Return PriceDetailed
```

### 3.2 `UseCasesConfig` — wiring

```java
@Bean
public Clock clock() {
    return Clock.systemDefaultZone();
}

@Bean
public PricingEngine pricingEngine() {
    return new PricingEngine(List.of(
        new GracePeriodStage(),
        new BaseRateStage(),
        new SpecialPolicyStage(),
        new SubscriberStage(),    // stub — TODO: ANC-XX subscriber contracts
        new StampsStage(),        // stub — TODO: ANC-XX commercial stamps
        new DayCapStage()         // stub — TODO: ANC-XX daily cap guardrail
    ));
}
```

---

## 4. Deleted Files

| File | Reason |
|---|---|
| `decorator/RateBaseDecorator.java` | Replaced by `BaseRateStage` |
| `decorator/RateWithSpecialPolicyDecorator.java` | Replaced by `SpecialPolicyStage` |
| `decorator/RateComponent.java` | Interface obsolete |

`utils/ParkingFeeCalculator.java` — **kept** (pure utility, reused by `BaseRateStage` and `SpecialPolicyStage`).

---

## 5. Testing Strategy

| Unit | Scenarios |
|---|---|
| `GracePeriodStage` | no grace configured → passthrough; duration ≤ grace + free → settled + subtotal=0; duration ≤ grace + priced → settled + subtotal=flatPrice; duration > grace → passthrough |
| `BaseRateStage` | settled=true → skip; minCharge respected; billing units ceil'd |
| `SpecialPolicyStage` | settled=true → skip; no policy → skip; PRICE/DISCOUNT×{SUBTRACT,SET,PERCENTAGE}; SURCHARGE×{PERCENTAGE,SET}; TIME×{SUBTRACT,SET,PERCENTAGE} verifying pricePerUnit used (not total); delta PriceLine recorded; floor at 0 |
| `PricingEngine` | settled cuts loop at correct stage; all stages invoked when not settled; breakpoints accumulate correctly |
| `CalculateRateUseCase` | Clock mockeable → deterministic duration; grace free path → PriceDetailed.total=0+IVA=0; grace priced path; normal billing path |

---

## 6. Threat / Risk Matrix

| Risk | Mitigation |
|---|---|
| `minChargeTimeMinutes` String→int breaks existing JPA data | Flyway migration converts column type; JPA entity updated |
| `ParkingLots` missing policy columns on existing rows | DEFAULT values in migration handle existing rows safely |
| `CheckOutVehicleUseCase` calls `CalculateRateUseCase` — contract unchanged | `execute(UUID ticketId)` signature stays the same; no entry-point changes |
| Decorator deleted breaks other callers | Grep confirms only `CalculateRateUseCase` instantiates the decorators |
