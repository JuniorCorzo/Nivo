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

## Tasks
- [x] T1 (linked S1, S2): Implementar Dock Express Superior con Aforo e Ingreso Express y componente/servicio de escaneo QR para check-in. | Route: delegated direct | Commit: implemented
- [x] T2 (linked S3, S4): Rediseñar Grilla de Bahías a Clean Tap Cards táctiles y Salida Express. | Route: delegated direct | Commit: implemented
- [x] T3 (linked S5): Actualizar suite de tests de operaciones y ejecutar verificación completa de regresión. | Route: delegated direct | Commit: implemented

## Log
- L1 (2026-10-27): User requested: "dejemos la propuesta 1, tambien darle soporte a hacer checkin escaneando el codigo qr" after reviewing interactive mockups for dual operations (ordered and unordered parking flows).
- L2 (2026-10-27): Task T1 completed: Created QrScannerModalComponent (WebRTC + BarcodeDetector + physical scanner input + parseScannedData supporting raw plates, JSON, and URLs). Integrated Dock Express Superior into OperationsPageComponent with real-time Aforo meter, express plate input with auto-bay assignment, vehicle type toggle, hotkey Q, and full unit test coverage (128 passing tests).
- L3 (2026-10-27): Task T2 completed: Transformed slot grid into Clean Tap Cards with unified interactive surface (`role="button"`, ARIA labels, visual states for available/occupied/maintenance, occupied license plate lookup via `getActiveTicketForSlot`, and tactile action footers `+ Asignar bahía` / `⏱ Cobrar Salida`). Added `preselectedSlot` input and banner in `CheckInModalComponent`. Implemented Salida Express with Enter trigger and `Cobrar Salida Directa` action (`submitExpressCheckOutByQuery`). Added unit test coverage (139 passing tests). Oxlint and oxfmt verified cleanly.
- L4 (2026-10-27): Task T3 completed: Full verification executed. Operations unit test suite (11 test files, 139 tests) passing 100%. Production build `ng build` passed cleanly with 0 errors. Oxlint and oxfmt passed with 0 warnings/errors across all operations components.
- L5 (2026-10-31): Corrected business logic in QR scanner module: wired QR scan event to checkout settlement and active ticket lookup by ticketId (supporting unplated vehicles via receipt URL /t/:id or UUID) and plate. Notifies error if ticket is not active or already settled without ever creating false check-ins.
