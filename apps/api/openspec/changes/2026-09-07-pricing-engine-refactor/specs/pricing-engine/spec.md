# Spec: PricingEngine Pipeline — ADDED

## Purpose

Domain service that orchestrates the pricing waterfall by executing an ordered, immutable list of `PricingStage` implementations against a `PricingContext`. Single source of truth for stage order and pipeline termination logic.

## Requirements

### Requirement: Ordered stage execution

The engine MUST execute stages in the order they were provided at construction time.

### Requirement: Pipeline short-circuit on settled context

If any stage returns a context with `settled=true`, the engine MUST stop executing remaining stages immediately.

#### Scenario: Grace-free exit short-circuits pipeline

- GIVEN a `PricingEngine` with `[GracePeriodStage, BaseRateStage, SpecialPolicyStage]`
- AND a `PricingContext` where duration ≤ grace and `gracePeriodPrice=0`
- WHEN `calculate()` is called
- THEN `GracePeriodStage` marks context as settled
- AND `BaseRateStage` and `SpecialPolicyStage` are NOT invoked
- AND returned `PriceDetailed.total` equals `0.00`

#### Scenario: Normal billing executes all stages

- GIVEN a `PricingContext` where duration > grace
- WHEN `calculate()` is called
- THEN all stages are invoked in order
- AND `PriceDetailed.breakpoints` accumulates lines from each contributing stage

### Requirement: Immutable stage list

The stage list provided at construction MUST be defensively copied. External mutations after construction MUST NOT affect the engine.

---

# Spec: GracePeriodStage — ADDED

## Requirements

### Requirement: Passthrough when no grace configured

- GIVEN `policy.gracePeriodMinutes = 0`
- WHEN stage is applied
- THEN context is returned unchanged

### Requirement: Passthrough when duration exceeds grace

- GIVEN `policy.gracePeriodMinutes = 15` and `context.duration = 20 minutes`
- WHEN stage is applied
- THEN context is returned unchanged

### Requirement: Free grace exit

- GIVEN `policy.gracePeriodMinutes = 15`, `policy.gracePeriodPrice = 0.00`, `context.duration = 10 minutes`
- WHEN stage is applied
- THEN `context.settled = true`, `context.subtotal = 0.00`, no breakpoint added

### Requirement: Priced grace exit

- GIVEN `policy.gracePeriodMinutes = 15`, `policy.gracePeriodPrice = 500.00`, `context.duration = 10 minutes`
- WHEN stage is applied
- THEN `context.settled = true`, `context.subtotal = 500.00`, one breakpoint added with `amount = 500.00`

---

# Spec: BaseRateStage — ADDED

## Requirements

### Requirement: Skip when settled

- GIVEN `context.settled = true`
- WHEN stage is applied
- THEN context is returned unchanged

### Requirement: Minimum charge enforcement

- GIVEN `rate.minChargeTimeMinutes = 30` and `context.duration = 10 minutes`
- WHEN stage is applied
- THEN billing is calculated for 30 minutes (minimum), not 10

### Requirement: Ceiling billing units

- GIVEN `rate.timeUnit = HOURS`, `rate.pricePerUnit = 5000`, `context.duration = 90 minutes`
- WHEN stage is applied
- THEN billedUnits = 2 (ceil(90/60)), `context.subtotal = 10000`

---

# Spec: SpecialPolicyStage — ADDED

## Requirements

### Requirement: Skip when settled

- GIVEN `context.settled = true`
- WHEN stage is applied
- THEN context is returned unchanged

### Requirement: Skip when no special policy

- GIVEN `rate.hasSpecialPolicy() = false`
- WHEN stage is applied
- THEN context is returned unchanged

### Requirement: PRICE / DISCOUNT × SUBTRACT — floor at zero

- GIVEN `context.subtotal = 3000`, `policy.modifies = PRICE` (or `DISCOUNT`), `policy.operation = SUBTRACT`, `policy.valueToModify = 5000`
- WHEN stage is applied
- THEN `context.subtotal = 0.00` (floored, not negative)
- AND `PriceLine` records delta `-3000.00`

### Requirement: PRICE / DISCOUNT × SET

- GIVEN `context.subtotal = 8000`, `policy.modifies = PRICE`, `policy.operation = SET`, `policy.valueToModify = 2000`
- WHEN stage is applied
- THEN `context.subtotal = 2000`
- AND `PriceLine` records delta `-6000.00`

### Requirement: PRICE / DISCOUNT × PERCENTAGE

- GIVEN `context.subtotal = 10000`, `policy.modifies = PRICE`, `policy.operation = PERCENTAGE`, `policy.valueToModify = 20` (20% discount)
- WHEN stage is applied
- THEN `context.subtotal = 8000`
- AND `PriceLine` records delta `-2000.00`

### Requirement: SURCHARGE × PERCENTAGE / SET

- GIVEN `context.subtotal = 10000`, `policy.modifies = SURCHARGE`, `policy.operation = PERCENTAGE`, `policy.valueToModify = 15` (15% surcharge)
- WHEN stage is applied
- THEN `context.subtotal = 11500.00`
- AND `PriceLine` records positive delta `+1500.00`

### Requirement: TIME adjustment uses unit rate pricePerUnit (Fix Bug)

- GIVEN `rate.pricePerUnit = 5000`, `rate.timeUnit = HOURS`, `context.subtotal = 20000` (4 hours)
- AND `policy.modifies = TIME`, `policy.operation = SUBTRACT`, `policy.valueToModify = 1` (minus 1 hour)
- WHEN stage is applied
- THEN effective billing duration = 3 hours
- AND fee is recalculated as `3 * 5000 = 15000` (MUST NOT use accumulated subtotal 20000)
- AND `PriceLine` records delta `-5000.00`

---

# Spec: CalculateRateUseCase — MODIFIED

## Requirements

### Requirement: Deterministic duration via Clock

- GIVEN a mocked `Clock` fixed at a known instant
- WHEN `execute(ticketId)` is called
- THEN `exitTime = OffsetDateTime.now(clock)` produces a deterministic, assertable duration

### Requirement: Grace-free path returns zero total

- GIVEN ticket with `entryTime = T`, `Clock.now() = T + 10min`
- AND `ParkingLotPolicy(gracePeriodMinutes=15, gracePeriodPrice=0.00)`
- WHEN `execute(ticketId)` is called
- THEN `PriceDetailed.total = 0.00`

### Requirement: Grace-priced path returns flat price

- GIVEN same timing as above
- AND `ParkingLotPolicy(gracePeriodMinutes=15, gracePeriodPrice=500.00, ivaRate=0.19)`
- WHEN `execute(ticketId)` is called
- THEN `PriceDetailed.subtotal = 500.00` and `PriceDetailed.total = 595.00`

### Requirement: Normal billing path delegates to engine

- GIVEN ticket with `entryTime = T`, `Clock.now() = T + 120min`
- AND `ParkingLotPolicy(gracePeriodMinutes=15, ...)`
- WHEN `execute(ticketId)` is called
- THEN duration passed to pipeline = 120 minutes; engine executes BaseRateStage
