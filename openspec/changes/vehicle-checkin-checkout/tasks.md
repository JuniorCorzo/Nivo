# Tasks: Vehicle Check-in and Check-out

<!-- WORKLOAD_FORECAST_START -->
| Metric | Estimate |
|---|---|
| Total Tasks | 11 tasks |
| Complexity | Medium |
| Primary Scope | `apps/web` (Core models, services, facades, modals, tests) |
<!-- WORKLOAD_FORECAST_END -->

## Phase 1: Foundations / Core Models & Facades

- [x] 1.1 **Create Domain Models & Mappers**
  - Define `TicketSummary`, `CreateTicketPayload`, `CheckOutPayload`, and `PriceDetailed` in `apps/web/src/app/core/models/ticket.model.ts`.
  - Create pure mappers for OpenAPI DTO transformations in `apps/web/src/app/core/mappers/ticket.mapper.ts`.

- [x] 1.2 **Create Ticket Service Integration**
  - Implement `TicketService` in `apps/web/src/app/core/services/ticket-service.ts` wrapping generated `ParkingTicketsService` and `RatesService` with error handling.

- [x] 1.3 **Implement Check-in & Check-out Signal Facades**
  - Create `CheckInFacade` in `apps/web/src/app/features/operations/facades/check-in.facade.ts` managing vehicle check-in state, available slots, and active rates.
  - Create `CheckOutFacade` in `apps/web/src/app/features/operations/facades/check-out.facade.ts` managing price calculation preview and checkout execution.

## Phase 2: Check-in UI & Flow

- [x] 2.1 **Build Check-in Modal Component**
  - Create standalone `CheckInModalComponent` in `apps/web/src/app/features/operations/components/check-in-modal/check-in-modal.component.ts`.
  - Add uppercase plate normalization, auto-focus, keyboard shortcuts (Enter to submit), and slot selector.

- [x] 2.2 **Build Ticket Receipt Component**
  - Implement `TicketReceiptComponent` in `apps/web/src/app/features/operations/components/ticket-receipt/ticket-receipt.component.ts` with printable CSS styles and scannable barcode string rendering.

- [x] 2.3 **Integrate Check-in Flow into Operations View**
  - Connect `CheckInModalComponent` with `CheckInFacade` to trigger check-in, handle duplicate plate errors (409), and show receipt on success.

## Phase 3: Check-out & Rate Preview UI

- [x] 3.1 **Build Check-out Modal with Price Calculation Preview**
  - Implement `CheckOutModalComponent` in `apps/web/src/app/features/operations/components/check-out-modal/check-out-modal.component.ts`.
  - Integrate live fee preview displaying `PriceDetailed` (subtotal, IVA, total, breakdown) before exit confirmation.

- [x] 3.2 **Implement Zero-Payment & Standard Departure Handling**
  - Add departure confirmation handling in `CheckOutModalComponent` invoking `CheckOutFacade.checkOut()` with `sendVia: 'URL'` and payment method selection.

- [x] 3.3 **Configure Navigation Routes**
  - Register operations routes in `apps/web/src/app/shared/constants/app-routes.constant.ts` and `apps/web/src/app/app.routes.ts`.

## Phase 4: Unit Testing & Verification

- [x] 4.1 **Unit Tests for Core Mappers & Services**
  - Add unit tests in `apps/web/src/app/core/mappers/ticket.mapper.spec.ts` for DTO conversions.
  - Add unit tests in `apps/web/src/app/core/services/ticket-service.spec.ts` mocking OpenAPI generated clients.

- [x] 4.2 **Unit Tests for Signal Facades & Components**
  - Add unit tests in `apps/web/src/app/features/operations/facades/check-in.facade.spec.ts` and `apps/web/src/app/features/operations/facades/check-out.facade.spec.ts`.
  - Add unit tests for `CheckInModalComponent` and `CheckOutModalComponent`.
