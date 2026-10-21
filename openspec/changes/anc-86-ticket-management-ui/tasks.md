# Tasks: Ticket Management & History UI (ANC-86)

## Overview & Review Budget

- **Total Estimated Lines**: ~380 lines
- **Chained PRs**: Single PR (Diff <= 400 lines budget guard)
- **Delivery Strategy**: `single-pr`
- **Scope**: `apps/web` (Core Service, Routing, Signals Facade, Presentational Components, Container Page, Unit Tests)

<!-- WORKLOAD_FORECAST_START -->

| Metric                 | Estimate             |
| ---------------------- | -------------------- |
| Total Tasks            | 12 tasks             |
| Phases Count           | 5 phases             |
| Total Estimated Diff   | ~380 lines           |
| Max Phase Diff         | ~130 lines (Phase 3) |
| Review Budget Exceeded | No (<= 400 lines)    |

<!-- WORKLOAD_FORECAST_END -->

---

## Task Breakdown

### Phase 1: Core Service Extension & Routing (Est. ~45 lines)

- [x] **Task 1.1: Extend TicketService with listTicketsByParkingLot**
  - Path: `apps/web/src/app/core/services/ticket-service.ts`
  - Action: Implement `listTicketsByParkingLot(parkingLotId: string): Observable<TicketSummary[]>` consuming generated `ParkingTicketsService.listTickets`, mapping DTOs via `mapToTicketSummary` and attaching `AUTHORIZED` HttpContext.
  - Verify: `cd apps/web && bun test src/app/core/services/ticket-service.spec.ts`
- [x] **Task 1.2: Configure Ticket Route Constants and Lazy Route Mapping**
  - Path: `apps/web/src/app/shared/constants/app-routes.constant.ts`, `apps/web/src/app/app.routes.ts`
  - Action: Add `parkingLotTickets` path pattern (`parking-lots/:parkingId/tickets`) and navigation helper in `APP_ROUTE_PATHS` and `APP_ROUTES`. Map lazy-loaded `TicketsPageComponent` under authenticated app shell.
  - Verify: `cd apps/web && bun x ultracite check`
- [x] **Task 1.3: Expose Parking Lot Navigation Entry Point**
  - Path: `apps/web/src/app/features/parking/facades/parking-home.facade.ts`
  - Action: Add `onManageTickets()` method navigating to `APP_ROUTES.app.parkingLotTickets(p.id)`.
  - Verify: `cd apps/web && bun test src/app/features/parking/facades/parking-home.facade.spec.ts`

### Phase 2: Tickets State Management (Est. ~95 lines)

- [x] **Task 2.1: Define Ticket Filter Criteria Model**
  - Path: `apps/web/src/app/features/tickets/models/ticket-filter.model.ts`
  - Action: Define `TicketFilterCriteria` interface with fields for `plate` (string), `status` (`'ALL' | 'OPEN' | 'CLOSED'`), `vehicleType` (string), and `dateRange` (`{ from?: string; to?: string } | null`).
  - Verify: `cd apps/web && bun x ultracite check`
- [x] **Task 2.2: Implement TicketsFacade with Signal Reactivity & Price Preview**
  - Path: `apps/web/src/app/features/tickets/facades/tickets.facade.ts`
  - Action: Create `TicketsFacade` managing writable signals (`parkingId`, `tickets`, `filters`, `selectedTicket`, `liveRatePreview`, `isLoading`, `isCalculatingRate`, `isDrawerOpen`, `isReceiptOpen`) and computed signals (`filteredTickets`, `ticketStats`). Implement `loadTickets()`, `updateFilters()`, `resetFilters()`, `openDetail()` (triggering `calculatePrice` simulation for `OPEN` tickets), `closeDetail()`, `openReceipt()`, and `closeReceipt()`.
  - Verify: `cd apps/web && bun test src/app/features/tickets/facades/tickets.facade.spec.ts`

### Phase 3: Presentational Components (Est. ~130 lines)

- [x] **Task 3.1: Build TicketFiltersComponent using Design System**
  - Path: `apps/web/src/app/features/tickets/components/ticket-filters/ticket-filters.component.ts`
  - Action: Implement standalone presentational filter bar with `ChangeDetectionStrategy.OnPush`. Utilize `@nivo-sass/design-system` primitives (`InputComponent` for plate search with 300ms debounce, `SelectComponent` for status & vehicle type, and `ButtonComponent` for reset). Expose `filters` input, `filtersChange` output, and `reset` output.
  - Verify: `cd apps/web && bun test src/app/features/tickets/components/ticket-filters/ticket-filters.component.spec.ts`
- [x] **Task 3.2: Build TicketsTableComponent with Design System Primitives**
  - Path: `apps/web/src/app/features/tickets/components/tickets-table/tickets-table.component.ts`
  - Action: Implement responsive table using `@nivo-sass/design-system` primitives (`TableComponent`, `TableHeaderComponent`, `TableRowComponent`, `TableHeadComponent`, `TableBodyComponent`, `TableCellComponent`), `BadgeComponent` for status display, `ButtonComponent` for row actions, and `CardComponent` for empty states. Expose `tickets` input, `isLoading` input, `selectTicket` output, and `reprintReceipt` output.
  - Verify: `cd apps/web && bun test src/app/features/tickets/components/tickets-table/tickets-table.component.spec.ts`
- [x] **Task 3.3: Build TicketDetailDrawerComponent with A11y & Live Rate Breakdown**
  - Path: `apps/web/src/app/features/tickets/components/ticket-detail-drawer/ticket-detail-drawer.component.ts`
  - Action: Implement accessible slide-over drawer with `role="dialog"`, `aria-modal="true"`, focus trap, and Escape dismissal. Render ticket metadata, stay duration counter, live pricing breakdown (`subtotal`, `ivaAmount`, `total`) for `OPEN` tickets via `liveRate` input, and finalized payment details for `CLOSED` tickets. Provide receipt reprinting CTA.
  - Verify: `cd apps/web && bun test src/app/features/tickets/components/ticket-detail-drawer/ticket-detail-drawer.component.spec.ts`

### Phase 4: Container Page Integration (Est. ~50 lines)

- [x] **Task 4.1: Implement TicketsPageComponent Smart Container**
  - Path: `apps/web/src/app/features/tickets/page/tickets-page.ts`
  - Action: Create `TicketsPageComponent` with `ChangeDetectionStrategy.OnPush`, providing `TicketsFacade`. Inquire `parkingId` from `ActivatedRoute`, invoke `loadTickets()`, and bind reactive signals to `TicketFiltersComponent`, `TicketsTableComponent`, and `TicketDetailDrawerComponent`.
  - Verify: `cd apps/web && bun test src/app/features/tickets/page/tickets-page.spec.ts`
- [x] **Task 4.2: Integrate TicketReceiptComponent Cross-Feature Reuse**
  - Path: `apps/web/src/app/features/tickets/page/tickets-page.ts`
  - Action: Import and embed `TicketReceiptComponent` from `@features/operations/components/ticket-receipt/ticket-receipt.component.ts` into `TicketsPageComponent`, binding `isReceiptOpen`, `selectedTicket`, and receipt close handlers for instant browser printing.
  - Verify: `cd apps/web && bun test src/app/features/tickets/page/tickets-page.spec.ts`

### Phase 5: Unit Testing & Ultracite Verification (Est. ~60 lines)

- [x] **Task 5.1: Unit Test Suite for Service, Facade, and Components**
  - Path: `apps/web/src/app/core/services/ticket-service.spec.ts`, `apps/web/src/app/features/tickets/facades/tickets.facade.spec.ts`, `apps/web/src/app/features/tickets/components/**/*.spec.ts`, `apps/web/src/app/features/tickets/page/tickets-page.spec.ts`
  - Action: Write comprehensive Vitest unit tests verifying 100% Gherkin scenarios: plate debounce filtering, status matching, empty states, live price calculation preview, closed ticket presentation, receipt modal lifecycle, and keyboard focus trap.
  - Verify: `cd apps/web && bun test`
- [x] **Task 5.2: Static Code Quality & Linter Verification**
  - Path: `apps/web`
  - Action: Run Ultracite linter and formatting checks across all newly created and modified files, resolving any style or type errors.
  - Verify: `cd apps/web && bun x ultracite check`

---

## Verification Checklist

- [x] 100% Gherkin acceptance scenarios covered by unit and integration tests.
- [x] `cd apps/web && bun test` passes with zero regressions.
- [x] `cd apps/web && bun x ultracite check` passes with zero linting/formatting errors.
- [x] All components enforce `ChangeDetectionStrategy.OnPush`.
- [x] Strict compliance with `@nivo-sass/design-system` components (zero raw unstyled buttons or inputs).
- [x] Receipt reprinting reuses existing `TicketReceiptComponent` without duplicate code.
- [x] Conventional commits scoped appropriately (`feat(web): ...`).
