# Spec: ParkingLotPolicy — ADDED

## Purpose

Value Object embedded in `ParkingLots` that carries the liquidation rules of a parking lot. Domain home for grace period configuration. Designed to be promoted to an interface with scope variants (`PARKING | GLOBAL`) in a future iteration without changing `PricingEngine` or any stage.

## Requirements

### Requirement: Grace period configuration

The policy MUST express a grace window (in minutes) during which a different pricing rule applies.

- `gracePeriodMinutes = 0` → no grace period; billing starts immediately from first minute.
- `gracePeriodMinutes > 0` → a grace window exists; the `GracePeriodStage` evaluates it.

### Requirement: Grace period pricing

The policy MUST express the price charged when a stay falls within the grace window.

- `gracePeriodPrice = 0.00` → grace is free; vehicle exits without charge.
- `gracePeriodPrice > 0` → grace carries a flat fee; vehicle is charged that amount regardless of exact duration within the window.

### Requirement: IVA rate

The policy MUST carry the tax rate to be applied to the subtotal. This field replaces the hardcoded `0.19` in `CalculateRateUseCase`.

### Requirement: Safe defaults

`ParkingLotPolicy.defaults()` MUST return a policy with `gracePeriodMinutes=0`, `gracePeriodPrice=0.00`, `ivaRate=0.19`. Applied automatically to parking lots created before this migration.

#### Scenario: Grace is free

- GIVEN a `ParkingLotPolicy` with `gracePeriodMinutes=15` and `gracePeriodPrice=0.00`
- WHEN `hasGracePeriod()` is called
- THEN it returns `true`
- AND `isGraceFree()` returns `true`

#### Scenario: Grace has price

- GIVEN a `ParkingLotPolicy` with `gracePeriodMinutes=15` and `gracePeriodPrice=500.00`
- WHEN `hasGracePeriod()` is called
- THEN it returns `true`
- AND `isGraceFree()` returns `false`

#### Scenario: No grace configured

- GIVEN a `ParkingLotPolicy` with `gracePeriodMinutes=0`
- WHEN `hasGracePeriod()` is called
- THEN it returns `false`
