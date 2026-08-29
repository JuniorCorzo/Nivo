# Proposal: Vehicle Check-in and Zero-Payment Check-out

## Intent
Enable parking operators to efficiently register incoming vehicles (Check-in, Linear ANC-33/ANC-35) and process departures that do not require payment (Check-out without payment, Linear ANC-37/ANC-38), including grace-period exits, authorized exemptions, and complimentary stays.

## Scope

### In Scope
- **Check-in Workflow**: Rapid license plate entry, vehicle type selection, slot assignment/occupancy update, and digital/printable ticket emission.
- **Zero-Payment Check-out Workflow**: Ticket lookup/barcode scan, validation of exemption/grace period/zero-balance rules, slot release, and exit authorization.
- **Operator UI & Facades**: Angular 19 reactive components (signals, OnPush) in `apps/web` with barcode scanner input support and keyboard shortcuts.
- **API & Domain Integration**: REST endpoints and use cases in `apps/api` for ticket creation, status transitions (`OPEN` -> `CLOSED`), and slot state synchronization.

### Out of Scope
- Direct payment gateway transactions, POS terminal processing, or cash drawer reconciliation (handled in subsequent billing/payment milestones).
- Automated LPR (License Plate Recognition) camera hardware integration.

## Capabilities

### New Capabilities
- `vehicle-checkin`: Captures vehicle metadata, allocates available parking slot, generates active parking ticket, and records entry timestamp.
- `vehicle-checkout`: Validates ticket departure eligibility under zero-payment criteria (grace period, free vouchers, exempt categories), updates ticket status to closed, and frees the associated slot.

### Modified Capabilities
- `parking-slots`: Real-time slot status transitions (`AVAILABLE` <-> `OCCUPIED`) upon vehicle check-in and check-out events.

## Approach
1. **Frontend (`apps/web`)**:
   - Implement container/presentational components under `features/operations` following Angular 19 Signal architecture (`signal`, `computed`, `rxResource`).
   - Provide operator check-in/check-out modals and fast-action dashboards with keyboard navigation and instant plate search.
2. **Backend (`apps/api`)**:
   - Clean Architecture flow: REST entry points dispatching to `CreateTicketUseCase` and `CloseZeroCostTicketUseCase`.
   - Domain validation enforcing slot availability, duplicate plate checks for active sessions, and zero-balance clearance policies.

## Affected Areas
- `apps/web/src/app/features/operations/` (check-in, check-out components, facades)
- `apps/web/src/app/core/api/` (generated clients, ticket services)
- `apps/api/domain/usecase/` (ticket lifecycle use cases)
- `apps/api/infrastructure/entry-points/api-rest/` (ticket checkin/checkout endpoints)

## Risks
- **Race conditions on slot allocation**: Mitigated via backend transactional isolation and slot state checks.
- **Unauthorized exit clearance**: Mitigated by strict domain rule enforcement on zero-cost eligibility.

## Rollback Plan
Feature is additive and gated behind operational routing. Rollback consists of disabling operations navigation routes and reverting API ticket endpoints without data schema breakage.

## Dependencies
- Active parking lot and slot distribution configuration (ANC-22).
- Operating rate rules for grace period evaluation (ANC-26).

## Success Criteria
- Vehicle check-in completes in < 3 seconds with valid slot allocation and ticket generation.
- Zero-payment check-out releases slot immediately and marks ticket closed.
- 100% unit and integration test coverage across new components and use cases.
