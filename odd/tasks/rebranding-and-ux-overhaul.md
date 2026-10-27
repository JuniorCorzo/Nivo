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
- [ ] T1 [S1] (delegated): Generar paleta armónica OKLCH, actualizar `colors.json`, script `generate-tokens.mjs`, `tokens.css` y `SKILL.md` en `libs/design-system`.
- [ ] T2 [S2] (delegated): Refrescar estilos y variantes de componentes base (`nv-button`, `nv-badge`, `nv-card`, inputs) en `libs/design-system` y validar suite completa.
- [ ] T3 [S3] (delegated): Diseñar y construir Paso 1 (Identificación por placa / barcode / grilla) en `check-out-modal` con tests unitarios.
- [ ] T4 [S4] (delegated): Diseñar y construir Paso 2 (Liquidación y desglose de tarifa en tiempo real) en `check-out-modal` con tests unitarios.
- [ ] T5 [S5] (delegated): Diseñar y construir Paso 3 (Selector de métodos de pago y despacho de comprobante) en `check-out-modal` con tests unitarios.
- [ ] T6 [S6] (delegated): Actualizar vistas de Public Ticket y Dashboard de Operaciones con contraste WCAG y branding renovado.
- [ ] T7 [S7] (delegated): Migrar vistas administrativas y landing/auth a los tokens consolidados de Nivo.

## Log
- L1 (2026-10-26): Usuario solicita: "iniciemos con la implementacion del plan con el id 701 en engram"
- L2 (2026-10-26): Recuperada observación #701 de Engram (roadmap/rebranding-and-ux-overhaul) con las 4 fases detalladas. File locator: odd/tasks/rebranding-and-ux-overhaul.md
