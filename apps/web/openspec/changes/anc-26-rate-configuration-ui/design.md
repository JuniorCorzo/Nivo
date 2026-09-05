# Design: ANC-26 Rate Configuration UI

## Technical Approach

Implement the rates management module under `apps/web/src/app/features/rates/` mirroring the decoupled architecture of `slots` and `parking`. Uses Angular Standalone Components, Angular Signals, pure mapper functions, facade pattern for reactive form state, and integration with generated OpenAPI endpoints (`ParkingLotsService`, `RateControllerService`, `TenantControllerService`).

All implementations MUST comply with project conventions defined in `AGENTS.md` and `ARCHITECTURE.md`:

- **Commit Scopes**: Use `feat(web/rates): ...` or `feat(web/ui): ...` with Conventional Commits.
- **Design System & Tokens**: Adhere to `nivo-brand-design` standards (`libs/design-system`), using atomic components, design tokens (colors, typography, spacing), and Tailwind CSS.
- **Architecture**: Clean layer separation (Domain Models $\rightarrow$ Pure Mappers $\rightarrow$ Core Services $\rightarrow$ Feature Facades $\rightarrow$ Standalone UI Components).

## Architecture Decisions

| Decision | Option A | Option B | Chosen & Rationale |
| --- | --- | --- | --- |
| **State Management** | Global NgRx Store | Angular Signals + Facade Pattern | **Signals + Facade**: Matches existing `slots-table.state.ts` and `parking-form.facade.ts` architecture without introducing unnecessary store boilerplate. |
| **Form Implementation** | ReactiveForms `FormGroup` | Signal Forms (`@angular/forms/signals`) | **ReactiveForms with Signal interop**: Mature validation ecosystem with `toSignal()` bridges for real-time calculation feeds. |
| **Routing Hierarchy** | Flat `/app/rates` | Nested `/app/parking-lots/:parkingId/rates` | **Nested**: Rates strictly belong to parking lots; aligns with `APP_ROUTE_PATHS` conventions. |
| **Design Standards** | Custom ad-hoc styles | Design System Tokens (`nivo-brand-design`) | **Design System Tokens**: Ensures consistent UI branding, colors, and typography across features. |

## Data Flow

```
[User Input] ─────────→ [RateFormFacade] ───────→ [RateService]
      │                        │                        │
      ▼                        ▼                        ▼
[Validation Signals]   [Live Calculator]    [Generated OpenAPI Client]
      │                        │                        │
      ▼                        ▼                        ▼
[UI Error Badges]      [Preview Card]       [Backend /parking-lots/{id}/rates]
```

## File Changes

| File | Action | Description |
| --- | --- | --- |
| `apps/web/src/app/core/models/rate.model.ts` | Create | Domain models for `Rate`, `RateType`, `CreateRateModel`, `UpdateRateModel`, `SpecialPolicy`. |
| `apps/web/src/app/core/mappers/rate.mapper.ts` | Create | Pure mapper functions translating DTOs $\leftrightarrow$ domain rate models. |
| `apps/web/src/app/core/services/rate-service.ts` | Create | Injectable rate service wrapping OpenAPI endpoints with HTTP context. |
| `apps/web/src/app/shared/constants/app-routes.constant.ts` | Modify | Add rates routes (`parkingLotRates`, `createParkingLotRate`, `editParkingLotRate`). |
| `apps/web/src/app/app.routes.ts` | Modify | Register routes and lazy component loaders for rates feature. |
| `apps/web/src/app/features/rates/components/rates-list/` | Create | Rate list page, table view, status pills, and empty state. |
| `apps/web/src/app/features/rates/components/rate-form/` | Create | Dynamic rate form with type selector and live preview. |
| `apps/web/src/app/features/rates/components/rate-calculator/` | Create | Interactive pricing calculator component. |
| `apps/web/src/app/features/rates/facades/rate-form.facade.ts` | Create | Facade orchestrating form validation and calculation preview signals. |

## Interfaces / Contracts

```typescript
export type TimeUnit = "MINUTES" | "HOURS" | "DAYS";
export type VehicleType = "CAR" | "MOTORCYCLE" | "BIKE";

export interface RateModel {
  id: string;
  name: string;
  description: string;
  vehicleType: VehicleType;
  timeUnit: TimeUnit;
  pricePerUnit: number;
  minChargeTimeMinutes: number;
  parkingId: string;
  specialPolicy?: SpecialPolicyModel;
  createdAt: string;
  updatedAt: string;
}

export interface SpecialPolicyModel {
  id: string;
  name: string;
  active: boolean;
  modifies: "PRICE" | "TIME" | "DISCOUNT" | "SURCHARGE";
  operation: "SUBTRACT" | "PERCENTAGE" | "SET";
  valueToModify: number;
}
```

## Testing Strategy

| Layer | What to Test | Approach |
| --- | --- | --- |
| Unit | `rate.mapper.ts` & `rate-service.ts` | Vitest specs with mocked OpenAPI DTOs. |
| Unit | `RateFormFacade` calculation logic | Assert signal emissions on price changes and grace period rules. |
| Component | `RateFormComponent` & `RateCalculatorComponent` | Test dynamic inputs rendering and real-time preview reactivity. |

## Threat Matrix

N/A — no routing shell, subprocess, VCS/PR automation, executable-file classification, or process-integration boundary.

## Migration / Rollout

No data migration required. Feature is additive and enabled for tenant administrators under parking lot management.

## Open Questions

- None. Backend endpoints exist and are generated in `src/app/core/api/generated`.
