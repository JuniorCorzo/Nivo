# PageHeader Redesign & Declarative Navigation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the dual responsive PageHeader redesign following the design mockup, introduce NavigationContextService with Signals for declarative routes, migrate rates to a dedicated `rates-page`, and integrate the new header across parking-form, parking-home, operations, slots, and tickets.

**Architecture:** 
- `NavigationContextService`: Standalone root service consuming `Router` and `ActiveParkingService` to dynamically resolve `RouteNavContext`, `breadcrumbs`, and `mobilePath` according to scopes (`tenant` vs `parking`).
- `PageHeaderComponent`: Dual layout with desktop card and mobile 3-row compact container using `@nivo-sass/design-system` primitives.
- `RatesPageComponent`: Dedicated page container in `features/rates/page/rates-page/` hosting the PageHeader and tabs, delegating the rates grid to `RateListComponent`.
- View integrations: Applying the PageHeader across the target views with TDD unit tests.

**Tech Stack:** Angular 21, Angular Signals, `@nivo-sass/design-system`, `@ng-icons/lucide`, Vitest.

**Spec:** `openspec/changes/2026-09-14-page-header-redesign/design.md`

## Global Constraints
- ChangeDetectionStrategy.OnPush across all Angular components.
- Design System Mandate: ALWAYS use `@nivo-sass/design-system` components (`nv-button`, `nv-card`, `nv-badge`, `nv-input`, typography) rather than ad-hoc raw HTML replacements.
- Targeted tests only: execute tests using `bun run test -- --watch=false --include <path/to/test.spec.ts>` inside `apps/web`.
- Clean conventional commits (no AI attribution).

---

### Task 1: NavigationContextService and Declarative Route Data

**Files:**
- Create: `apps/web/src/app/core/services/navigation-context.service.ts`
- Test: `apps/web/src/app/core/services/navigation-context.service.spec.ts`
- Modify: `apps/web/src/app/app.routes.ts`

**Interfaces:**
- Produces:
  ```typescript
  export type NavigationScope = 'tenant' | 'parking';

  export interface RouteNavContext {
    scope: NavigationScope;
    title?: string;
    subtitle?: string;
    section?: string;
    backLink?: string;
    isRoot?: boolean;
  }

  @Injectable({ providedIn: 'root' })
  export class NavigationContextService {
    readonly navContext: Signal<RouteNavContext | null>;
    readonly scope: Signal<NavigationScope>;
    readonly isRoot: Signal<boolean>;
    readonly breadcrumbs: Signal<PageHeaderBreadcrumbItem[]>;
    readonly mobilePath: Signal<string>;
    readonly backLink: Signal<string | null>;
  }
  ```

- [ ] **Step 1: Write the failing test for NavigationContextService**

Create `apps/web/src/app/core/services/navigation-context.service.spec.ts` testing:
- Default state when no route context is present.
- Extraction of `data.navContext` on navigation event.
- Scope `parking`: resolving breadcrumb prefix using `ActiveParkingService.activeParkingName()`.
- Scope `tenant`: resolving tenant breadcrumbs without requiring active parking.
- Generation of `mobilePath` (e.g., `Central Norte / Operaciones` vs `Operaciones / Tickets`).

- [ ] **Step 2: Run test to verify it fails**

Run: `bun run test -- --watch=false --include src/app/core/services/navigation-context.service.spec.ts`
Expected: FAIL with module/class not found.

- [ ] **Step 3: Implement NavigationContextService & Update app.routes.ts**

Implement `apps/web/src/app/core/services/navigation-context.service.ts` and add `data.navContext` definitions in `apps/web/src/app/app.routes.ts`.

- [ ] **Step 4: Run test to verify it passes**

Run: `bun run test -- --watch=false --include src/app/core/services/navigation-context.service.spec.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/app/core/services/navigation-context.service.* apps/web/src/app/app.routes.ts
git commit -m "feat(core): implement NavigationContextService and configure route navContext"
```

---

### Task 2: PageHeaderComponent Dual & Responsive Redesign

**Files:**
- Modify: `apps/web/src/app/shared/components/page-header/page-header.component.ts`
- Modify: `apps/web/src/app/shared/components/page-header/page-header.component.html`
- Modify: `apps/web/src/app/shared/components/page-header/page-header.component.css`
- Test: `apps/web/src/app/shared/components/page-header/page-header.component.spec.ts`

**Interfaces:**
- Consumes:
  - `NavigationContextService`
  - `@nivo-sass/design-system` (`nv-h1`, `nv-muted`, `BadgeComponent`, `ButtonComponent`)
- Produces:
  - Dual responsive template: Desktop unified card (`hidden sm:flex`) and Mobile 3-row layout (`flex sm:hidden`).
  - History pill `< >` with `goBack()` and `goForward()`.
  - Seamless fallback to `NavigationContextService` when breadcrumbs are not passed explicitly.

- [ ] **Step 1: Write failing tests in page-header.component.spec.ts**

Add tests for:
- Desktop structure: unified card class `page-header-desktop`, history pill `< >`, title + badge, projected actions.
- Mobile structure: 3-row layout class `page-header-mobile`, back button, compact route path, badge, icon, and stacked/grid actions.
- Interaction with `NavigationContextService` fallback.

- [ ] **Step 2: Run test to verify it fails**

Run: `bun run test -- --watch=false --include src/app/shared/components/page-header/page-header.component.spec.ts`
Expected: FAIL with missing elements or expectations.

- [ ] **Step 3: Implement responsive template and component updates**

Update `page-header.component.ts`, `page-header.component.html`, and `page-header.component.css` using design system classes and tokens matching `page-header-mockups.html`.

- [ ] **Step 4: Run test to verify it passes**

Run: `bun run test -- --watch=false --include src/app/shared/components/page-header/page-header.component.spec.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/app/shared/components/page-header/
git commit -m "feat(web): redesign PageHeader with dual desktop and mobile responsive layouts"
```

---

### Task 3: Rates Page Migration (`features/rates/page/rates-page/`)

**Files:**
- Create: `apps/web/src/app/features/rates/page/rates-page/rates-page.ts`
- Create: `apps/web/src/app/features/rates/page/rates-page/rates-page.html`
- Create: `apps/web/src/app/features/rates/page/rates-page/rates-page.spec.ts`
- Modify: `apps/web/src/app/features/rates/components/rates-list/rates-list.ts`
- Modify: `apps/web/src/app/features/rates/components/rates-list/rates-list.html`
- Modify: `apps/web/src/app/features/rates/components/rates-list/rates-list.spec.ts`
- Modify: `apps/web/src/app/app.routes.ts`

**Interfaces:**
- Produces:
  - `RatesPageComponent`: Smart component at `rates-page/` hosting `app-page-header`, navigation tabs (`Tarifas`, `Calculadora`, `Políticas`), and delegating the rates list to `RateListComponent`.
  - Cleaned `RateListComponent` focused purely on list filters and grid.

- [ ] **Step 1: Write failing test for RatesPageComponent**

Create `rates-page.spec.ts` verifying that `RatesPageComponent` renders `app-page-header`, tabs, and switches between rates list, calculator, and policies.

- [ ] **Step 2: Run test to verify it fails**

Run: `bun run test -- --watch=false --include src/app/features/rates/page/rates-page/rates-page.spec.ts`
Expected: FAIL.

- [ ] **Step 3: Implement RatesPageComponent and refactor RateListComponent**

Implement `RatesPageComponent`, adjust `RateListComponent`, and update the route in `apps/web/src/app/app.routes.ts`.

- [ ] **Step 4: Run targeted tests to verify they pass**

Run:
`bun run test -- --watch=false --include src/app/features/rates/page/rates-page/rates-page.spec.ts`
`bun run test -- --watch=false --include src/app/features/rates/components/rates-list/rates-list.spec.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/app/features/rates/ apps/web/src/app/app.routes.ts
git commit -m "refactor(rates): migrate rates page to features/rates/page/rates-page"
```

---

### Task 4: Integrate PageHeader in Target Views (`parking-form`, `parking-home`, `operations`, `slots`, `tickets`)

**Files:**
- Modify: `apps/web/src/app/features/parking/page/parking-form/parking-form.html`
- Modify: `apps/web/src/app/features/parking/page/parking-form/parking-form.ts`
- Modify: `apps/web/src/app/features/parking/page/parking-form/parking-form.spec.ts`
- Modify: `apps/web/src/app/features/parking/page/parking-home/parking-home.html`
- Modify: `apps/web/src/app/features/parking/page/parking-home/parking-home.spec.ts`
- Modify: `apps/web/src/app/features/operations/page/operations-page.html`
- Modify: `apps/web/src/app/features/operations/page/operations-page.spec.ts`
- Modify: `apps/web/src/app/features/slots/page/parking-slots-list/parking-slots-list.html`
- Modify: `apps/web/src/app/features/slots/page/parking-slots-list/parking-slots-list.spec.ts`
- Modify: `apps/web/src/app/features/tickets/page/tickets-page.html`
- Modify: `apps/web/src/app/features/tickets/page/tickets-page.spec.ts`

**Interfaces:**
- `parking-form`: Cancel and Submit buttons integrated in the `PageHeader` `[actions]` slot with reactive disabled states.
- `parking-home`: Title with active parking name, status badge, details in subtitle, and quick action buttons.
- `operations-page`: Live status badge and quick action buttons for check-in and tickets.
- `slots`: Capacity badge and buttons for "+ Crear Plazas" and "Editar Grupo".
- `tickets`: Distinguishing tenant vs parking scope with report export action.

- [ ] **Step 1: Write/update targeted tests for parking-form header actions**

Update `parking-form.spec.ts` to assert that Cancelar and Guardar buttons are rendered in the header and trigger `onCancel` / `onSubmit`.

- [ ] **Step 2: Run test to verify it fails**

Run: `bun run test -- --watch=false --include src/app/features/parking/page/parking-form/parking-form.spec.ts`
Expected: FAIL.

- [ ] **Step 3: Update parking-form and other views**

Apply header updates in `parking-form`, `parking-home`, `operations-page`, `parking-slots-list`, and `tickets-page`.

- [ ] **Step 4: Run targeted tests for each view**

Run:
`bun run test -- --watch=false --include src/app/features/parking/page/parking-form/parking-form.spec.ts`
`bun run test -- --watch=false --include src/app/features/parking/page/parking-home/parking-home.spec.ts`
`bun run test -- --watch=false --include src/app/features/operations/page/operations-page.spec.ts`
`bun run test -- --watch=false --include src/app/features/slots/page/parking-slots-list/parking-slots-list.spec.ts`
`bun run test -- --watch=false --include src/app/features/tickets/page/tickets-page.spec.ts`
Expected: ALL PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/app/features/
git commit -m "feat(views): integrate redesigned PageHeader across parking-form, home, operations, slots and tickets"
```
