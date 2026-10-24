# Feature: Core Fixes Issues 73, 74, 76, 72
Objective: Implement architectural bugfixes and improvements for issues #73, #74, #76, and #72.
Branch: fix/issues-72-73-74-76
Delivery Strategy: ask-on-risk
Test Runners: ./gradlew test (apps/api), bun test (apps/web)

## Specs
- S1 [Issue #73]: "Ticket público: Corregir vista que se queda cargando indefinidamente. Nota adicional: No se están realizando llamados a la API." Bind route `:id` in `app.config.ts` via `withComponentInputBinding()`, unwrap API `Response<T>` data in `public-ticket.service.ts`, and enable `.cors(Customizer.withDefaults())` in `SecurityChain.java`.
- S2 [Issue #74]: "Salida de vehículo: Mostrar foto capturada si el vehículo no tiene placa." Show vehicle entry photo and "SIN PLACA" badge in `check-out-modal.html` when vehicle is unplated, register `lucideCamera`, and sync `database/scheme.sql` with Flyway V9 (`photo_url`, `plate_country`, `phone_number`).
- S3 [Issue #76]: "IVA: Permitir configuración y cálculo con 0%." In `CalculateRateUseCase.java`, resolve parking lot ID via `SlotsRepository.findById` instead of returning null stub; in `check-out-modal.html`, display IVA when `ivaRate !== null && ivaRate !== undefined` (including 0%); in `UpsertParkingLotsRequest.java`, ensure `@DecimalMin("0.0")` validation allows 0.
- S4 [Issue #72]: "Dashboard: Corregir/remover métricas hardcodeadas de comparativa (antes vs presente)." Remove hardcoded static strings (+14.8%, -6 min, 82%, 15 min) from `dashboard-kpi-grid.html` and clean up misleading comparative footers.

## Tasks
- [x] T1 [S1] (delegated): Fix public ticket loading (app.config.ts withComponentInputBinding, public-ticket.service.ts unwrap data, SecurityChain.java CORS) with unit tests. Commit: e94e28f.
- [x] T2 [S2] (delegated): Display entry photo and "SIN PLACA" badge in check-out modal, register lucideCamera, and sync database/scheme.sql. Commit: 7b5374d.
- [x] T3 [S3] (delegated): Fix 0% IVA rate calculation (inject SlotsRepository into CalculateRateUseCase, check-out-modal.html ivaRate display, UpsertParkingLotsRequest validation) with TDD unit tests. Commit: 4a76f08.
- [x] T4 [S4] (delegated): Remove/clean hardcoded comparative strings in dashboard-kpi-grid. Commit: f67fd17.
- [x] T5 [S1, S2, S3, S4] (delegated): Run full test verification suite and spotless/lint checks. Commit: 32d9b8e.

## Log
- L1 (2026-10-24): Usuario solicita: "implementa el plan con este topic en engram architecture/implementation-plan-72-73-74-76"
- L2 (2026-10-24): Creado worktree `fix-issues-72-73-74-76` y sincronizado CodeGraph.
- L3 (2026-10-24): T1 completada. Commit: e94e28f. Router input binding, unwrapping de ticket data y CORS habilitado.
- L4 (2026-10-24): T2 completada. Commit: 7b5374d. Foto de ingreso, badge "SIN PLACA", lucideCamera y sincronización de scheme.sql.
- L5 (2026-10-24): T3 completada. Commit: 4a76f08. Inyección de SlotsRepository en CalculateRateUseCase, visualización de IVA 0% en checkout modal y validación de ivaRate.
- L6 (2026-10-24): T4 completada. Commit: f67fd17. Remoción de métricas comparativas hardcodeadas y limpieza de KPI grid.
- L7 (2026-10-24): T5 completada. Commit: 32d9b8e. Verificación y recheck exhaustivo: todas las suites (backend y frontend) y spotless/oxfmt pasando 100%.





