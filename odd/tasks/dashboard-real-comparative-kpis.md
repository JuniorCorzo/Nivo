# Feature: Dashboard Real Comparative KPIs & Single Query Optimization
Objective: Implement real dynamic comparative KPIs (revenue delta, stay delta, digital payment ratio, grace period) via single-query optimization in Spring Boot and PostgreSQL view.
Branch: feat/dashboard-kpis-and-operational-fixes | Runner: ./gradlew test, bun run test

## Specs
- S1: "pues agregalas, no tengo problema con eso, puedes usar la forma de nativa de spring boot para pedir datos por tiempo mediante search param"
- S2: "me gustaria tambien que optimices es request, en lugar de ser dos, no se podria hacer una sola?"
- S3: Single SQL query optimization: `DailySummaryViewRepository` must fetch `[date, date.minusDays(7)]` in a single query via `IN` clause instead of two separate queries.
- S4: Flyway V11 migration: Recreate `nivo.v_parking_daily_summary` view with `digital_revenue` aggregated from payments where `payment_method IN ('PAY_LINK', 'CARD')` and status = 'PAID'. Sync `database/scheme.sql`.
- S5: Spring Boot native temporal search param: `GET /dashboard/summary` accepts `@RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date` (defaults to `LocalDate.now()`).
- S6: DTO and domain calculations: `GetDashboardSummaryUseCase` calculates `revenueDeltaPercentage`, `avgStayDeltaMinutes`, `digitalPaymentRatio`, and extracts `gracePeriodMinutes` from `ParkingLots.getPolicy().gracePeriodMinutes()`.
- S7: Frontend dashboard integration: Update `DashboardSummaryDto`, `DashboardSummaryModel`, and `dashboard-kpi-grid.html` to render real dynamic comparisons (trend arrow, percentage delta, minutes delta, digital ratio, and grace period).

## Tasks
- [x] T1 (S4): Flyway V11 migration for `digital_revenue` in `v_parking_daily_summary`, sync `database/scheme.sql`, update `DailySummaryViewEntity` and `DailySummaryModel` | route: delegated | commit: pending
- [x] T2 (S3, S5, S6): Single-query repository methods, use case delta calculations, and `DashboardController` date param with unit tests | route: delegated | commit: pending
- [x] T3 (S7): Frontend DTO, model, and mapper updates for new KPI fields | route: delegated | commit: pending
- [x] T4 (S7): Update `dashboard-kpi-grid` template, component, and specs to render dynamic real KPIs | route: delegated | commit: pending
- [ ] T5 (S1-S7): Verification gate across backend and frontend suites | route: delegated | commit: pending

## Log
- L1: 2026-10-24 - User requested: "pues agregalas, no tengo problema con eso, puedes usar la forma de nativa de spring boot para pedir datos por tiempo mediante search param" and "me gustaria tambien que optimices es request, en lugar de ser dos, no se podria hacer una sola?"
