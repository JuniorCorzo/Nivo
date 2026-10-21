# Proposal: Ticket Management & History UI (ANC-86)

## Why

Operators and parking administrators need central auditing and historical tracking of parking tickets. Currently, only active slots and direct checkout are accessible in live operations, lacking historical querying, multi-criteria filtering, live price previews for open stays, and receipt reprinting.

## What Changes

- **Core Service**: Add `listTicketsByParkingLot(parkingLotId: string)` to `TicketService` consuming `GET /tickets/list` via `ParkingTicketsService`.
- **Routing & Navigation**: Add `/app/parking-lots/:parkingId/tickets` in `APP_ROUTE_PATHS` / `APP_ROUTES` and link within parking lot navigation / sidebar.
- **Feature Module (`apps/web/src/app/features/tickets`)**:
  - `TicketsPageComponent`: Container page coordinating signals and facade.
  - `TicketsFacade`: Signal-driven facade managing filters (plate search, status `OPEN`/`CLOSED`, vehicle type, date range), sorting, and ticket data streams via Angular Signals and RxJS.
  - `TicketsTableComponent`: Presentational table using `nv-table`, `nv-badge`, `nv-button`, and `nv-typography`.
  - `TicketFilterBarComponent`: Presentational filter bar using `nv-input`, `nv-select`, and `nv-button`.
  - `TicketDetailDrawerComponent`: Presentational drawer displaying ticket metadata, stay duration, live tariff calculation preview for `OPEN` tickets (via `TicketService.calculatePrice`), and receipt reprinting.
- **Receipt Reprinting**: Re-use `TicketReceiptComponent` for instant receipt modal/drawer preview and printing.

### Non-Goals

- Modifying backend APIs or database schemas (`/tickets/list` and `/rates/calculate` already exist).
- Cashier cash reconciliation, manual payment refunds, or ticket voiding workflows (handled in future finance/audit issues).

## Capabilities Contract

### New Capabilities

- `ticket-management-history`: Historical ticket querying with reactive filters (license plate, status, vehicle type, date) and responsive tabular presentation.
- `ticket-detail-preview`: Ticket detail drawer with live price calculation preview for `OPEN` tickets and receipt reprinting.

### Modified Capabilities

- `ticket-service`: Extended with `listTicketsByParkingLot` integration.
- `app-navigation`: Extended with `/app/parking-lots/:parkingId/tickets` route and links.

## Architectural Impact

- **Frontend (`apps/web`)**: Clean Architecture Container/Presentational pattern with `TicketsFacade` signal state. Strict adherence to `@nivo-sass/design-system` components (`nv-table`, `nv-card`, `nv-badge`, `nv-input`, `nv-select`, `nv-button`, `nv-typography`) and `ChangeDetectionStrategy.OnPush`.
- **Backend (`apps/api`)**: Zero changes. Consumes existing endpoints.
- **Database**: No migrations required.

## Review Budget & Chained PR Strategy

- **Estimated Lines of Code**: ~380 lines.
- **Chained PRs Needed**: No (self-contained frontend feature).

## Risks & Rollback Plan

- **Risks**: High ticket volume performance. Mitigated by reactive debounce on search, computed signal filtering, and pagination.
- **Rollback**: Revert frontend commit and remove route mapping without impacting backend or database.
