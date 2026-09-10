<!-- TAG: MODIFIED -->
# Delta Spec: Slot Domain Model & Invariants

## Motivation
Represent EV charger availability, PMR accessibility, and soft-delete/operational status directly within the slot domain aggregate.

## Requirements
1. **Model Attributes**:
   - `Slots` domain model must include `hasCharger` (`boolean`), `isAccessible` (`boolean`), and `isActive` (`boolean`).
   - Default values: `hasCharger = false`, `isAccessible = false`, `isActive = true`.
2. **Immutability Invariant**:
   - `vehicle_type` is immutable post-creation and must not be editable through update commands.
3. **Guard Invariant**:
   - Slot metadata and group changes can only occur when `status == SlotStatus.AVAILABLE`.\n