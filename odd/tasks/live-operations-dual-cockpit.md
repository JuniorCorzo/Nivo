# Feature: Live Operations Dual Cockpit & QR Check-In
Objective: Implement Propuesta 1 (Unified Hybrid Cockpit: Free-floating / Unordered flow + Ordered Bay flow) with QR Code Check-In support in apps/web/src/app/features/operations/.
Branch: feat/rebranding-ux-overhaul
Delivery Strategy: ask-on-risk
Test Runner: bun --cwd apps/web ng test --watch=false --include="src/app/features/operations/**/*.spec.ts"

## Specs
- S1: Dock Express Superior de Cabina Rápida (Flujo Desordenado / Libre): Widget de aforo en vivo (ocupados, disponibles, porcentaje reactivo), formulario de Ingreso Express (Placa con máscara + Tipo de vehículo + Enter = Check-In emitido con auto-asignación de bahía disponible en background sin obligar a seleccionar slot visualmente).
- S2: Soporte de Check-In escaneando Código QR: Botón y atajo "Escanear QR" en el Dock Express, modal con cámara WebRTC y BarcodeDetector (con fallback de input de lector físico USB/Bluetooth) para parsear placa o datos de ticket y ejecutar check-in automático.
- S3: Dock Express de Salida Rápida: Input de búsqueda por placa o escaneo de ticket QR con liquidación y apertura directa del modal de cobro.
- S4: Grilla de Bahías Limpia (Flujo Ordenado / Clean Tap Cards): Rediseño de tarjetas de slots eliminando micro-botones; toda la tarjeta es el área de toque (Verde libre abre check-in para ese slot puntual; Azul/Roja ocupada abre cobro de ese slot).
- S5: Pruebas unitarias de operaciones en vivo: Verificación rigurosa en operations-page.spec.ts cubriendo aforo, ingreso express, escaneo QR, tap en slots ordenados y cobro express.
- S6: Consolidación UI Propuesta A (Cockpit Omnibar): Eliminación de botones de acción duplicados del app-page-header (conservando Ver Tickets y atajos globales I, O, Q); Ribbon de Métricas Unificado (Capacidad global con mini barra, cupos Carros, cupos Motos y vehículos activos en una sola fila compacta); Omnibar Táctico de Taquilla que integra Ingreso Exprés (flujo libre) y Cobro/Salida Exprés lado a lado.
- S7: Refinamiento de Flujos Operativos: Reubicación del botón "Escanear QR" a la sección de Cobro & Salida Exprés (para liquidación rápida de tickets por código QR/barras) e integración del flujo de ingreso para vehículos "Sin Placa" (botón dedicado en Ingreso Exprés que abre el modal con modalidad unplated y captura fotográfica obligatoria activa).

## Tasks
- [x] T1 (linked S1, S2): Implementar Dock Express Superior con Aforo e Ingreso Express y componente/servicio de escaneo QR para check-in. | Route: delegated direct | Commit: implemented
- [x] T2 (linked S3, S4): Rediseñar Grilla de Bahías a Clean Tap Cards táctiles y Salida Express. | Route: delegated direct | Commit: implemented
- [x] T3 (linked S5): Actualizar suite de tests de operaciones y ejecutar verificación completa de regresión. | Route: delegated direct | Commit: implemented
- [x] T4 (linked S6): Implementar Propuesta A en operations-page (HTML, CSS, TS) y actualizar suite de tests en operations-page.spec.ts. | Route: delegated direct | Commit: implemented
- [x] T5 (linked S7): Reubicar botón QR a sección de salida, agregar soporte initialUnplated en check-in modal e integrar botón "Sin Placa" en Ingreso Exprés. Actualizar tests unitarios. | Route: delegated direct | Commit: implemented

## Log
- L1 (2026-10-27): User requested: "dejemos la propuesta 1, tambien darle soporte a hacer checkin escaneando el codigo qr" after reviewing interactive mockups for dual operations (ordered and unordered parking flows).
- L2 (2026-10-27): Task T1 completed: Created QrScannerModalComponent (WebRTC + BarcodeDetector + physical scanner input + parseScannedData supporting raw plates, JSON, and URLs). Integrated Dock Express Superior into OperationsPageComponent with real-time Aforo meter, express plate input with auto-bay assignment, vehicle type toggle, hotkey Q, and full unit test coverage (128 passing tests).
- L3 (2026-10-27): Task T2 completed: Transformed slot grid into Clean Tap Cards with unified interactive surface (`role="button"`, ARIA labels, visual states for available/occupied/maintenance, occupied license plate lookup via `getActiveTicketForSlot`, and tactile action footers `+ Asignar bahía` / `⏱ Cobrar Salida`). Added `preselectedSlot` input and banner in `CheckInModalComponent`. Implemented Salida Express with Enter trigger and `Cobrar Salida Directa` action (`submitExpressCheckOutByQuery`). Added unit test coverage (139 passing tests). Oxlint and oxfmt verified cleanly.
- L4 (2026-10-27): Task T3 completed: Full verification executed. Operations unit test suite (11 test files, 139 tests) passing 100%. Production build `ng build` passed cleanly with 0 errors. Oxlint and oxfmt passed with 0 warnings/errors across all operations components.
- L5 (2026-10-27): User approved Propuesta A (Cockpit Omnibar) to fix UI collision between PageHeader actions, Express Dock, and 4 duplicate KPI cards. Implemented unified KPI ribbon, clean header, and dual omnibar for express in/out while preserving ordered bay grid and active tickets table.
- L6 (2026-10-27): User requested moving QR scan button to exit section for ticket checkout and adding unplated vehicle entry flow. Implemented initialUnplated in CheckInModalComponent, added "Sin Placa" button in Ingreso Exprés, moved Escanear QR to Cobro & Salida Exprés with active ticket resolution, and updated unit tests.

