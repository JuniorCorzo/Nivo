# Tasks: Pricing Engine Refactor

> TDD applies to every task. Write the failing test first, then implement.
> Tasks are ordered by dependency. Do not begin a task until its predecessors are done.

---

## Phase 1 — Domain Model

- [ ] **T-01** Fix `Rates.minChargeTimeMinutes` from `String` to `int`; update `RateReference` record component; update `RatesMapper` (JPA adapter); update any entry-point DTOs that carry this field.

- [ ] **T-02** Add `ParkingLotPolicy` record to `domain/model/parkinglots/`. Implement `defaults()`, `hasGracePeriod()`, `isGraceFree()`. Unit test all three methods.

- [ ] **T-03** Add `policy: ParkingLotPolicy` field to `ParkingLots` entity (non-null, defaults to `ParkingLotPolicy.defaults()`). Update `ParkingLotsMapper` (JPA) to read the three new columns. Write Flyway migration `V{next}__add_parking_lot_policy_columns.sql`.

---

## Phase 2 — PricingContext & PricingStage

- [ ] **T-04** Create `PricingContext` record in `domain/usecase/rate/engine/`. Implement `of(...)` factory and `withSubtotal(...)` / `settled()` builder methods. Unit test immutability: each builder method returns a new instance with correct values; original unchanged.

- [ ] **T-05** Create `PricingStage` functional interface in `domain/usecase/rate/engine/`.

---

## Phase 3 — Stages (TDD per stage)

- [ ] **T-06** `GracePeriodStage` — write tests first:
  - no grace configured (gracePeriodMinutes=0) → context unchanged
  - duration ≤ grace + free (gracePeriodPrice=0) → settled=true, subtotal=0, no breakpoint added
  - duration ≤ grace + priced (gracePeriodPrice>0) → settled=true, subtotal=flatPrice, breakpoint added
  - duration > grace → context unchanged
  Then implement.

- [ ] **T-07** `BaseRateStage` — write tests first:
  - settled=true → context unchanged (skip)
  - duration < minCharge → bills at minCharge
  - billing units are ceil'd (fraction billing)
  - breakpoint line added with correct concept string
  Then implement.

- [ ] **T-08** `SpecialPolicyStage` — write tests first:
  - settled=true → skip
  - rate has no special policy → skip
  - PRICE / DISCOUNT × SUBTRACT → correct deduction, floor at 0, delta PriceLine recorded
  - PRICE / DISCOUNT × SET → replaces subtotal, delta PriceLine recorded
  - PRICE / DISCOUNT × PERCENTAGE → correct discount applied, delta PriceLine recorded
  - SURCHARGE × PERCENTAGE → surcharge added to subtotal, positive delta PriceLine recorded
  - SURCHARGE × SET → surcharge sets additional fee
  - TIME × SUBTRACT → duration reduced, fee recalculated using rate.pricePerUnit() (VERIFY BUG FIX: not accumulated subtotal!)
  - TIME × SET → duration replaced, fee recalculated using rate.pricePerUnit()
  - TIME × PERCENTAGE → duration adjusted by percentage, fee recalculated using rate.pricePerUnit()
  Then implement.

- [ ] **T-09** `SubscriberStage` — stub. Returns context unmodified. Single test: output equals input.

- [ ] **T-10** `StampsStage` — stub. Returns context unmodified. Single test: output equals input.

- [ ] **T-11** `DayCapStage` — stub. Returns context unmodified. Single test: output equals input.

---

## Phase 4 — PricingEngine

- [ ] **T-12** Add `PriceDetailed.from(PricingContext, String tenantName)` factory. Unit test: correctly maps breakpoints, subtotal, ivaRate from context and policy.

- [ ] **T-13** Create `PricingEngine` in `domain/usecase/rate/engine/`. Write tests first:
  - settled=true after stage N → stages N+1..end are NOT called (verify via mock/spy)
  - all stages called when nothing settles
  - breakpoints accumulate correctly across stages
  - returned `PriceDetailed` matches final context state
  Then implement.

---

## Phase 5 — Use Case & Wiring

- [ ] **T-14** Refactor `CalculateRateUseCase`:
  - Remove `TenantsRepository` dependency
  - Add `ParkingLotsRepository`, `PricingEngine`, `Clock`
  - Write tests: Clock mock → deterministic duration; grace-free path → total=0; grace-priced path; normal billing path
  - Implement

- [ ] **T-15** Update `UseCasesConfig`:
  - Add `Clock` bean
  - Add `PricingEngine` bean with ordered stage list
  - Update `CalculateRateUseCase` bean constructor

---

## Phase 6 — Delete & Cleanup

- [ ] **T-16** Delete `decorator/RateBaseDecorator.java`, `decorator/RateWithSpecialPolicyDecorator.java`, `decorator/RateComponent.java`. Confirm no remaining references compile.

---

## Phase 7 — Integration & Verification

- [ ] **T-17** Run full test suite (`./gradlew test`). Fix any compilation or test failures from the migration.

- [ ] **T-18** Run mutation tests (`./gradlew pitest`) on the new engine package. Ensure mutation score ≥ existing baseline.
