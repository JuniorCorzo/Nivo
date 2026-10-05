# Proposal: Pricing Engine Refactor

## Goal

Rewrite the tariff engine module to implement a formal Pricing Waterfall pipeline, introduce `ParkingLotPolicy` as the domain home for grace period configuration, and eliminate existing code smells — enabling the grace period to carry an optional price and providing extensible stubs for future waterfall stages (subscriber, stamps, day cap).

## Rationale

The current implementation has three critical problems:

1. **Grace period does not exist in the domain.** The SAD specifies it but no code enforces it. The `RateBaseDecorator` charges from `entryTime` to `now()` unconditionally.
2. **`CalculateRateUseCase` is untestable in isolation.** `OffsetDateTime.now()` is called inside `RateBaseDecorator` with no injection point, making duration non-deterministic in tests. IVA rate is hardcoded to `0.19`.
3. **The Decorator pattern leaks waterfall ordering into instantiation order.** Adding or reordering stages requires changing `CalculateRateUseCase`, violating the Open/Closed Principle.

The refactor replaces the decorator pair with an explicit, ordered `List<PricingStage>` pipeline managed by a `PricingEngine` domain service. Grace period becomes a `ParkingLotPolicy` value object embedded in `ParkingLots`, positioning it correctly at the parking lot level and providing a clear extension point for future global policies.
