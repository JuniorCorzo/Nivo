# Feature: Rebranding & UX Overhaul
Objective: Implementar el rediseño de marca y experiencia de usuario según el Plan #701 de Engram, abarcando tokens OKLCH en design-system, overhaul del modal de checkout en operaciones y actualización de vistas públicas y administrativas.
Branch: feat/rebranding-ux-overhaul
Delivery Strategy: ask-on-risk
Test Runners: bun run --cwd libs/design-system test --watch=false, bun run --cwd apps/web ng test --watch=false

## Specs
- S1: Tokens & Design System Foundation - En `libs/design-system`, generar paleta armónica y accesible OKLCH (Zinc neutrals, Success, Warning, Destructive, Info), actualizar `src/lib/tokens/colors.json`, `generate-tokens.mjs`, `tokens.css` y la documentación/reglas en `libs/design-system/skills/nivo-brand-design/SKILL.md`.
- S2: Base Components Refresh - En `libs/design-system`, actualizar y verificar componentes base (`nv-button`, `nv-badge`, `nv-card`, inputs/selects/checkboxes) asegurando accesibilidad, contratos existentes y tests pasando.
- S3: Checkout Step 1 Identification - En `apps/web/src/app/features/operations/components/modals/check-out-modal/`, implementar Paso 1 con búsqueda rápida por placa / lector de código de barras de ticket y fallback a grilla de plazas ocupadas.
- S4: Checkout Step 2 Tariff Settlement - En `apps/web/src/app/features/operations/components/modals/check-out-modal/`, implementar Paso 2 con timeline de estadía en tiempo real y desglose detallado de impuestos y conceptos de tarifa.
- S5: Checkout Step 3 Payment & Receipt - En `apps/web/src/app/features/operations/components/modals/check-out-modal/`, implementar Paso 3 con selector dinámico de método de pago (Efectivo, Tarjeta, Transferencia) y entrega multicanal de comprobante (en pantalla, email, impresión).
- S6: Public Ticket & Operations Dashboard - En `apps/web/src/app/features/public-ticket/` y `apps/web/src/app/features/dashboard/`, actualizar vista móvil pública de tickets con nuevo branding y dashboard de operaciones con métricas y tarjetas de ocupación con contraste WCAG accesible.
- S7: Administrative Features & Commercial Landing - En `apps/web/src/app/features/rates/`, `slots/`, `tickets/`, `users/`, `landing/`, `auth/`, migrar tablas y formularios a los nuevos tokens y refrescar landing/auth con la nueva identidad de marca.

## Tasks
- [x] T1 [S1] (delegated): Generar paleta armónica OKLCH, actualizar `colors.json`, script `generate-tokens.mjs`, `tokens.css` y `SKILL.md` en `libs/design-system`. Commit: 3f2b94b.
- [x] T2 [S2] (delegated): Refrescar estilos y variantes de componentes base (`nv-button`, `nv-badge`, `nv-card`, inputs) en `libs/design-system` y validar suite completa. Commit: b1dd27c.
- [x] T3 [S3] (delegated): Diseñar y construir Paso 1 (Identificación por placa / barcode / grilla) en `check-out-modal` con tests unitarios. Commit: 2a89864.
- [x] T4 [S4] (delegated): Diseñar y construir Paso 2 (Liquidación y desglose de tarifa en tiempo real) en `check-out-modal` con tests unitarios. Commit: f9b3692.
- [x] T5 [S5] (delegated): Diseñar y construir Paso 3 (Selector de métodos de pago y despacho de comprobante) en `check-out-modal` con tests unitarios. Commit: 6877a25.
- [x] T6 [S6] (delegated): Actualizar vistas de Public Ticket y Dashboard de Operaciones con contraste WCAG y branding renovado. Commit: 38f7259.
- [x] T7 [S7] (delegated): Migrar vistas administrativas y landing/auth a los tokens consolidados de Nivo. Commit: 7a902dc.

## Log
- L1 (2026-10-26): Usuario solicita: "iniciemos con la implementacion del plan con el id 701 en engram"
- L2 (2026-10-26): Recuperada observación #701 de Engram (roadmap/rebranding-and-ux-overhaul) con las 4 fases detalladas. File locator: odd/tasks/rebranding-and-ux-overhaul.md
- L3 (2026-10-26): Completada T1 con commit 3f2b94b. Generados tokens OKLCH perceptualmente uniformes para light y dark theme, y validada suite completa de tests de design-system (49 tests).
- L4 (2026-10-26): Completada T2 con commit b1dd27c. Añadidas suites de pruebas TDD para nv-badge, nv-card y nv-input; validadas 10 suites (75 pruebas pasando) en design system.
- L5 (2026-10-26): Completada T3 con commit 2a89864. Implementado componente de Paso 1 (IdentificationStepComponent) con búsqueda instantánea por placa, scanner de código de barras y grilla de cupos ocupados; validadas 13 pruebas unitarias pasando.
- L6 (2026-10-26): Completada T4 con commit f9b3692. Implementado componente de Paso 2 (SettlementStepComponent) con timeline de estadía en tiempo real, desglose de tarifa/impuestos y banner de período de gracia; validadas 26 pruebas unitarias pasando.
- L7 (2026-10-26): Completada T5 con commit 6877a25. Implementado componente de Paso 3 (PaymentStepComponent) con selector interactivo de métodos de pago (Efectivo, Tarjeta, Transferencia) y entrega multicanal con validación reactiva de email; validadas 39 pruebas unitarias pasando.
- L8 (2026-10-26): Completada T6 con commit 38f7259. Modernizadas vistas de Public Ticket y Dashboard KPI Grid con componentes del design system (nv-badge, nv-button) y contraste accesible WCAG; validadas 88 pruebas unitarias pasando en 13 suites.
- L9 (2026-10-27): Completada T7 con commit 7a902dc. Migrados componentes de landing (benefits, comparison, hero, simulator-ticket) a los tokens consolidados de Nivo y verificadas 18 suites (62 pruebas pasando).
