# Technical Design: Ticket Management & History UI (ANC-86)

## Architecture Overview

The Ticket Management & History UI provides parking operators and administrators with historical auditing, reactive multi-criteria filtering, active stay price calculation previews, and receipt reprinting. Following Clean Architecture and modern Angular (v20+) patterns, the feature isolates state in a dedicated signal-driven facade (`TicketsFacade`), decouples presentation via dumb standalone components powered by `@nivo-sass/design-system`, and connects to the backend through an extended `TicketService`.

## Clean Architecture & Component Mapping

### Backend (`apps/api`)

Zero backend code changes required. Consumes existing endpoints:

- `GET /tickets/list?parking=:parkingId`: Returns historical and active tickets.
- `GET /rates/calculate?ticketId=:ticketId`: Real-time pricing calculation for open stays.

### Core Extensions (`apps/web/src/app/core`)

- **`TicketService` (`core/services/ticket-service.ts`)**:
  - `listTicketsByParkingLot(parkingLotId: string): Observable<TicketSummary[]>`: Invokes `ParkingTicketsService.listTickets`, mapping DTOs via `mapToTicketSummary`.

### Routing Integration (`apps/web/src/app`)

- **`APP_ROUTE_PATHS.app.parkingLotTickets`**: `'parking-lots/:parkingId/tickets'`
- **`APP_ROUTES.app.parkingLotTickets(parkingId)`**: `(parkingId) => /app/parking-lots/${parkingId}/tickets`
- **`app.routes.ts`**: Lazy-loads `TicketsPageComponent` under authenticated application shell layout.

### Feature Layer (`apps/web/src/app/features/tickets`)

- **`TicketsPageComponent` (`page/tickets-page.ts`) [Smart Container]**:
  - Injects `ActivatedRoute` and provides `TicketsFacade`.
  - Extracts route parameter `parkingId` and triggers ticket loading.
  - Template composes filter bar, table, drawer, and receipt modal.
  - Enforces `ChangeDetectionStrategy.OnPush`.

- **`TicketsFacade` (`facades/tickets.facade.ts`) [State Management]**:
  - **Writable Signals**:
    - `parkingId = signal<string | null>(null)`
    - `tickets = signal<TicketSummary[]>([])`
    - `filters = signal<TicketFilterCriteria>({ plate: '', status: 'ALL', vehicleType: 'ALL', dateRange: null })`
    - `selectedTicket = signal<TicketSummary | null>(null)`
    - `liveRatePreview = signal<PriceDetailedModel | null>(null)`
    - `isLoading = signal<boolean>(false)`
    - `isCalculatingRate = signal<boolean>(false)`
    - `isDrawerOpen = signal<boolean>(false)`
    - `isReceiptOpen = signal<boolean>(false)`
  - **Computed Signals**:
    - `filteredTickets = computed(() => ...)`: Filters `tickets` by license plate substring, status (`OPEN`/`CLOSED`), and slot/vehicle type.
    - `ticketStats = computed(() => ...)`: Derives total, open, and closed ticket tallies.
  - **Methods**:
    - `loadTickets(parkingId: string): void`
    - `updateFilters(criteria: Partial<TicketFilterCriteria>): void`
    - `openDetail(ticket: TicketSummary): void`: Opens drawer and triggers `calculateLivePrice` if status is `OPEN``.
    - `closeDetail(): void`
    - `openReceipt(ticket: TicketSummary): void`
    - `closeReceipt(): void`

- **`TicketFiltersComponent` (`components/ticket-filters/ticket-filters.component.ts`) [Presentational]**:
  - Inputs: `filters = input.required<TicketFilterCriteria>()`
  - Outputs: `filtersChange = output<TicketFilterCriteria>()`, `reset = output<void>()`
  - Elements: `nv-input` for plate search, `nv-select` for status & vehicle type, `nv-button` for reset.

- **`TicketsTableComponent` (`components/tickets-table/tickets-table.component.ts`) [Presentational]**:
  - Inputs: `tickets = input.required<TicketSummary[]>()`, `isLoading = input<boolean>(false)`
  - Outputs: `selectTicket = output<TicketSummary>()`, `reprintReceipt = output<TicketSummary>()`
  - Elements: `nv-table`, `nv-table-header`, `nv-table-row`, `nv-table-head`, `nv-table-body`, `nv-table-cell`, `nv-badge` (status styling), `nv-button`, `nv-typography`.

- **`TicketDetailDrawerComponent` (`components/ticket-detail-drawer/ticket-detail-drawer.component.ts`) [Presentational]**:
  - Inputs: `isOpen = input.required<boolean>()`, `ticket = input<TicketSummary | null>(null)`, `liveRate = input<PriceDetailedModel | null>(null)`, `isLoadingRate = input<boolean>(false)`
  - Outputs: `close = output<void>()`, `reprintReceipt = output<TicketSummary>()`
  - Accessibility: `role="dialog"`, `aria-modal="true"`, focus trap, escape key listener.
  - Layout: `nv-card`, `nv-typography`, `nv-badge`, live stay duration counter, tariff breakdown lines.

- **`TicketReceiptComponent` [Reused]**:
  - Reused directly from `@features/operations/components/ticket-receipt/ticket-receipt.component`.
  - Standalone modal providing instant print formatting (`window.print()`).

## Architectural Decision Records (ADRs)

### ADR-1: In-Memory Client-Side Signal Filtering

- **Context**: Operators filter tickets by license plate, status, and vehicle type during daily operations.
- **Decision**: Fetch parking lot tickets on navigation and apply reactive filtering in `TicketsFacade` via `computed()`.
- **Consequences**: Instant UI feedback without network latency or repeated server queries; optimal for standard parking lot active dataset sizes.

### ADR-2: Direct Cross-Feature Reuse of TicketReceiptComponent

- **Context**: Entry and exit receipts must look identical across Operations checkout and Ticket Management history.
- **Decision**: Import and reuse `TicketReceiptComponent` from `@features/operations/components/ticket-receipt/ticket-receipt.component.ts` rather than duplicating markup or styles.
- **Consequences**: Ensures single source of truth for print media queries, barcodes, and receipt formatting without duplicate code.

## Security & Multi-Tenancy

- **Multi-Tenant Isolation**: Secured via `AUTHORIZED` HttpContext token injecting Bearer JWT. Backend validates tenant ownership against `parkingId`.
- **Access Control**: Limited to authenticated operators/administrators having parking lot read privileges.
- **UI Hardening & A11y**: Strict template sanitization, `ChangeDetectionStrategy.OnPush` across all views, and WCAG 2.2 AA compliant drawer dialogs.
