# Technical Design: Vehicle Check-in and Check-out

## Technical Approach
Implement vehicle check-in and check-out workflows in `apps/web` (Angular 19, signals, facades) connecting to existing Spring Boot REST endpoints in `apps/api`:
1. **Vehicle Check-in**: Operator submits plate, slot, and rate. Frontend calls `POST /tickets/check-in` with `CreateTicket`, creating an active ticket (`OPEN`) and occupying the slot.
2. **Price Calculation Preview**: On check-out initiation, frontend fetches fee breakdown via `GET /rates/{ticketId}/calculate` returning `PriceDetailed`.
3. **Vehicle Check-out**: Operator confirms departure. Frontend calls `POST /tickets/check-out` with polymorphic `CheckOutCommand` (`sendVia: "URL"`, `paymentMethod: "EFFECTIVE"`), returning `PaymentsDTO`, closing the ticket, and freeing the slot.

## Architecture Decisions
| Decision | Options | Choice | Rationale |
|---|---|---|---|
| **API Contract** | New endpoints vs Existing backend | Existing `apps/api` endpoints | Reuses tested backend endpoints (`/tickets/check-in`, `/rates/{id}/calculate`, `/tickets/check-out`). |
| **Frontend State** | Global store vs Signal Facades | Signal Facades (`CheckInFacade`, `CheckOutFacade`) | Standardizes on Angular 19 signals (`signal`, `computed`, `rxResource`) matching `RateFormFacade`. |
| **Check-out Flow** | Direct exit vs Live price preview + checkout | Preview + Checkout | Ensures operators review `PriceDetailed` before executing `CheckOutCommand`. |
| **Receipts** | PDF library vs HTML/CSS print component | Standalone Receipt Component | Lightweight, browser-native print styles with instant visual feedback. |

## Data Flow
```
[ Operator UI ] ──→ [ CheckInFacade / CheckOutFacade ] (Signals)
                             │
                             ▼
                     [ TicketService ] (Authorized HTTP Context)
                             │
            ┌────────────────┴────────────────┐
            │ POST /tickets/check-in          │ GET /rates/{id}/calculate
            ▼                                 ▼
  [ ParkingTicketsController ]              [ RateController ]
            │                                 │
            └────────────────┬────────────────┘
                             │ POST /tickets/check-out
                             ▼
                  [ CheckOutVehicleUseCase ] ──→ [ PaymentsDTO / Slot Freed ]
```

## File Changes
| Area | File | Action | Description |
|---|---|---|---|
| Web Core | `apps/web/src/app/core/models/ticket.model.ts` | Create | Domain models for tickets, checkout, and price breakdown |
| Web Core | `apps/web/src/app/core/mappers/ticket.mapper.ts` | Create | Pure mappers translating OpenAPI DTOs $\leftrightarrow$ domain ticket models |
| Web Core | `apps/web/src/app/core/services/ticket-service.ts` | Create | Service wrapping generated `ParkingTicketsService` and `RatesService` |
| Web Features | `apps/web/src/app/features/operations/facades/check-in.facade.ts` | Create | Signal facade for entry validation and ticket issuance |
| Web Features | `apps/web/src/app/features/operations/facades/check-out.facade.ts` | Create | Signal facade for fee calculation preview and checkout confirmation |
| Web Features | `apps/web/src/app/features/operations/components/check-in-modal/` | Create | Modal with plate normalization and quick shortcut submission |
| Web Features | `apps/web/src/app/features/operations/components/check-out-modal/` | Create | Modal with breakdown (`PriceDetailed`) and checkout action |
| Web Features | `apps/web/src/app/features/operations/components/ticket-receipt/` | Create | Printable receipt displaying entry/exit times, duration, and totals |
| Web Shared | `apps/web/src/app/shared/constants/app-routes.constant.ts` | Modify | Add operations routing constants |
| Web App | `apps/web/src/app/app.routes.ts` | Modify | Register routes for parking operations |

## Interfaces / Contracts

### Existing Backend Endpoints (`apps/api`)
- `POST /tickets/check-in`: Body `CreateTicket` $\rightarrow$ `Response<ParkingTicketsDTO>` (201 Created)
- `GET /rates/{ticketId}/calculate`: Path param `ticketId` $\rightarrow$ `Response<PriceDetailed>` (200 OK)
- `POST /tickets/check-out`: Body `CheckOutCommand` $\rightarrow$ `Response<PaymentsDTO>` (201 Created)

### TypeScript Contracts (`apps/web`)
```typescript
export interface CreateTicketPayload {
  slotId: string;
  rateId: string;
  plate: string;
  email?: string;
}

export interface CheckOutPayload {
  sendVia: 'URL' | 'EMAIL' | 'SMS';
  ticketId: string;
  paymentMethod: 'EFFECTIVE' | 'PAY_LINK';
}

export interface TicketSummary {
  id: string;
  licensePlate: string;
  slotNumber?: string;
  rateName?: string;
  entryTime: string;
  exitTime?: string;
  totalToCharge?: number;
  status: 'OPEN' | 'CLOSED' | 'ANNULLED';
}
```

### Java Backend Records (`apps/api`)
```java
public record CreateTicket(@NotNull UUID slotId, @NotNull UUID rateId, String email, @NotEmpty String plate) {}

public record NoSendCheckOutCommand(@NotNull UUID ticketId, @NotNull PaymentsMethods paymentMethod) implements CheckOutCommand {
  public String sendVia() { return "URL"; }
}

public record PriceDetailed(String name, LinkedList<PriceLine> breakpoint, BigDecimal ivaAmount, BigDecimal total, BigDecimal ivaRate, BigDecimal subtotal) {}
```

## Testing Strategy
- **Unit Tests**:
  - `ticket.mapper.spec.ts`: Test DTO $\leftrightarrow$ domain model transformations.
  - `ticket-service.spec.ts`: Verify HTTP calls to generated OpenAPI services.
  - `check-in.facade.spec.ts` / `check-out.facade.spec.ts`: Assert signal state transitions, calculation fetching, and checkout execution.
- **Component Tests**:
  - `CheckInModalComponent`: Form validations and submit actions.
  - `CheckOutModalComponent`: Live calculation rendering and exit confirmation.
  - `TicketReceiptComponent`: Summary data bindings and print styling.

## Threat Matrix
| Threat ID | Threat Description | Severity | Mitigation Strategy |
|---|---|---|---|
| TM-01 | Unauthorized ticket operations | High | Enforced `@PreAuthorize("hasRole('OPERATOR')")` and tenant isolation in API context. |
| TM-02 | Inaccurate charge calculation | Medium | Calculation computed server-side via `CalculateRateUseCase` before checkout. |

## Migration / Rollout
No database migration required. Backend endpoints are existing and active. Frontend operations UI is exposed under parking lot navigation.

## Open Questions
- None. Backend contracts and frontend signal architecture are fully aligned.
