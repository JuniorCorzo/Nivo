# Feature: UI/UX Distill & Redesign
Objective: Rediseñar y destilar componentes clave de la UI/UX en `apps/web`: destilar `app-page-header` para eliminar envoltorio tosco de card y optimizar espacio vertical (~60px), integrar tema oscuro CartoDB Dark Matter en el mapa Leaflet de parking con estilos Zinc, y rediseñar la vista de tickets con Metric Ribbon interactivo, chips vehiculares de alto contraste, temporizador de estadía y acción directa de cobro.
Branch: feat/rebranding-ux-overhaul
Delivery Strategy: ask-on-risk
Test Runner: vitest via @angular/build:unit-test (bun run --cwd apps/web test)

## Specs
- S1: Page Header Distillation: Remove bulky card wrapper from `app-page-header`. Convert to sleek horizontal flow saving ~60px vertical space, retaining breadcrumbs, title, badge and actions without card-in-card nesting.
- S2: Leaflet Map Dark Theme Integration: Use standard free OpenStreetMap tiles (100% free, $0 cost) with zero-cost CSS dark filter inversion on .leaflet-tile-pane matching Nivo Zinc OKLCH tokens, plus custom styled emerald radar marker.
- S3: Tickets Page & Table Overhaul: Add actionable Metric Ribbon on top (Active, Overtime/Alert, Closed today, Revenue) that filters the table on click. Redesign table columns to feature high-contrast vehicular plate chips, live duration indicator with progress bar, JetBrains Mono currency formatting, and direct checkout action.
- S4: Design System & Rules Compliance: All UI components must strictly use `@nivo-sass/design-system` (`nv-button`, `nv-badge`, `nv-card`, `nv-typography`). All text in `APP_TEXTS`. Zero hardcoded strings or raw HTML buttons/inputs. No emojis in templates. Enforce OnPush change detection.
- S5: Tickets Page & Table Mockup Full Parity:
  - 4-Card Actionable Telemetry Ribbon (En Permanencia/Activos with live pulse dot, En Alerta/Mora > 8h, Cerrados Hoy, Total Tickets) that filter table on click.
  - Vehicle filter pills (Todos, Carros, Motos) in toolbar.
  - Authentic Colombian plate chip (with COLOMBIA header tag & bold mono plate).
  - Duration & Entry cell with relative elapsed time (e.g. 'Hace 45 min') and micro-progress bar.
  - Table row click to open ticket detail drawer.
- S6: Parking Detail Page Mockup Full Parity:
  - Header operational shortcuts: ⚡ Taquilla Directa, Configurar Tarifas, Editar Sede.
  - Parking Telemetry Ribbon: Occupancy Gauge card (percentage, capacity ratio, linear gauge fill, and vehicle breakdown for Autos vs Motos), Recaudo Turno card, Rotación & Permanencia card.
  - Map Presentation Card: topbar with GPS coordinates and live dot, Leaflet dark map, and Operational Quick Dock Bar underneath (Auditar Bahías, Taquilla Directa, Configurar Tarifas).
  - Visual Bay/Slot Grid Matrix showing bays (A-01, A-02...) with mini plate chips or LIBRE tags and occupancy legend.

## Tasks
- [x] T1 (linked S1, S4): Destilar `app-page-header` removiendo envoltorio tosco de card y optimizando flujo vertical. | Route: delegated direct | Commit: pending
- [x] T2 (linked S2, S4): Revertir a tiles OpenStreetMap gratuitos con filtro CSS oscuro e icono radar esmeralda en ParkingMapComponent. | Route: delegated direct | Commit: pending
- [x] T3 (linked S3, S4): Rediseñar vista de Tickets: Metric Ribbon interactivo, chip de placa vehicular, temporizador de estadía y acción directa en fila. | Route: delegated direct | Commit: pending
- [x] T4 (linked S4): Verificación integral con pruebas unitarias (`bun run --cwd apps/web test`), `impeccable detect` y formateo (`oxfmt`). | Route: delegated direct | Commit: pending
- [x] T5 (linked S5, S4): Implementar paridad completa de Tickets: Ribbon de 4 tarjetas, pills de filtro vehicular, chip de placa colombiana auténtica, celda de estadía con microbarra y row click a drawer. | Route: delegated direct | Commit: pending
- [x] T6 (linked S6, S4): Implementar paridad completa de Parking: Accesos directos en header, Ribbon con Occupancy Gauge y desglose por vehículo, Card de Mapa con Dock Operativo y Matriz Visual de Bahías. | Route: delegated direct | Commit: pending
- [x] T7 (linked S4): Verificación integral, pruebas unitarias y formateo oxfmt. | Route: delegated direct | Commit: pending

## Log
- L1 (2026-10-28): User request verbatim: `/impeccable colorize bolder a todo el proyecto y distill a las paginas principales` y `siento que las vistas en la tabla están sobrecargadas sobre todo la de tickets, la siento sosa y sin utilidad más allá de ver los tickets, me gustaría hacer un rediseño de esa parte también, también la vista se parking está bien pero me gustaría que mires si es posible mejorar le algo referente a UX, el mapa de leaftlef debería seguir los colores de la marca también, y el page header en su momento me encanto pero ahora siento que vuelve un poco tosca la UI.`
- L2 (2026-10-28): Completed T1. Distilled app-page-header by removing card wrapper (`bg-card`, `border-border`, `rounded-2xl`, `shadow-xs`) and action dividing line (`border-t`, `pt-2.5`). Updated spec expectation for `@sm:py-3`. 56/56 page-header unit tests passing.
- L3 (2026-10-28): Completed T2. Replaced default OSM tiles with CartoDB Dark Matter (`CARTO_DARK_TILES`), added custom Nivo Emerald Radar marker with `L.divIcon`, styled Leaflet controls, zoom, attribution and container matching Zinc tokens. 13/13 parking-map unit tests passing.
- L4 (2026-10-28): Completed T3. Redesigned tickets view: interactive Metric Ribbon with active states and keyboard a11y, authentic Colombian yellow plate chips with camera badges for SP-, pulsing live emerald dot for OPEN status badge, direct Cobrar button in row actions, and bold tabular numbers for total to charge. 37/37 tickets unit tests passing.
- L5 (2026-10-28): Completed T4. Formatted all modified files with `bunx oxfmt --write` and validated via `bunx oxfmt --check`. Verified test suite with 10 test files and 106 unit tests passing (`bun run --cwd apps/web test`). Zero lint/type errors and impeccable detect clean.
- L6 (2026-10-28): Reverted map tiles from CartoDB to 100% free OpenStreetMap official tiles (`https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`) to enforce $0 cost constraint. Applied pure CSS dark invert/contrast filter on `.leaflet-tile-pane` in dark theme. 13/13 tests passing.
- L7 (2026-10-28): User requested full alignment with all elements from `full-pages-redesign.html` sketch. Switched companion server active screen by removing old logo artifact, opened companion in browser via xdg-open, and expanded specs S5-S6 for complete Tickets & Parking detail mockup parity.
- L8 (2026-10-28): Completed T5, T6, and T7. Tickets view overhauled with 4-card actionable ribbon, Colombian reflective plate chip, vehicle pills, relative duration with microbar, and table row click to drawer. Parking home overhauled with 3-card telemetry ribbon, Hero Map with GPS topbar & Operational Dock bar, and Visual Slot Matrix. All unit tests passing and formatted with oxfmt.

## Key Learnings
- Destiling container padding from `@sm:p-6` to `@sm:py-3 @sm:px-0` and removing card encapsulation gives headers natural flow while saving ~60px vertical height without altering inner layout slots or container query breakpoints.
- Leaflet default `divIcon` injects `.leaflet-div-icon` styling with white background and border; overriding `:host ::ng-deep .nivo-map-marker-container` with transparent background and zero border enables clean animated radar ping markers.
- Encapsulating table cell styling into dedicated standalone presentational components (`TicketTotalCellComponent`) via `flexRenderComponent` allows clean tabular-nums and typography styling in TanStack table definitions without polluting templates with conditional cell logic.

