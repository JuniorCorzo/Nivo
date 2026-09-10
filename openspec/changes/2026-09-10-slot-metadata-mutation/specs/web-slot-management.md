<!-- TAG: MODIFIED -->
# Delta Spec: Web Slot Management & Batch Modals

## Motivation
Allow parking operators to visually identify and batch-update slot metadata and groups using design system components.

## Requirements
1. **Visual Indicators**:
   - Display EV charger ⚡ and PMR accessibility ♿ badges on slot table entries.
2. **Batch Equipment Modal**:
   - Activated from multi-selection toolbar (`selectedCount > 0`).
   - Toggles `hasCharger`, `isAccessible`, and `isActive` via `@nivo-sass/design-system` switches.
   - Validates that no selected slots are occupied before submission.
3. **Group Rename Modal**:
   - Allows changing `zone` and `prefix` with confirmation prompt.\n