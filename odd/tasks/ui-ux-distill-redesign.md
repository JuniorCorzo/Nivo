# Feature: UI/UX Distill & Redesign
Objective: Rediseñar y destilar componentes clave de la UI/UX en `apps/web`: destilar `app-page-header` para eliminar envoltorio tosco de card y optimizar espacio vertical (~60px), integrar tema oscuro CartoDB Dark Matter en el mapa Leaflet de parking con estilos Zinc, y rediseñar la vista de tickets con Metric Ribbon interactivo, chips vehiculares de alto contraste, temporizador de estadía y acción directa de cobro.
Branch: feat/rebranding-ux-overhaul
Delivery Strategy: ask-on-risk
Test Runner: vitest via @angular/build:unit-test (bun run --cwd apps/web test)

## Specs
- S1: Page Header Distillation: Remove bulky card wrapper from `app-page-header`. Convert to sleek horizontal flow saving ~60px vertical space, retaining breadcrumbs, title, badge and actions without card-in-card nesting.
- S2: Leaflet Map Dark Theme Integration: Replace default bright OpenStreetMap tiles in `ParkingMapComponent` with CartoDB Dark Matter / Positron tiles matching Nivo Zinc OKLCH tokens, plus custom styled marker and popup.
- S3: Tickets Page & Table Overhaul: Add actionable Metric Ribbon on top (Active, Overtime/Alert, Closed today, Revenue) that filters the table on click. Redesign table columns to feature high-contrast vehicular plate chips, live duration indicator with progress bar, JetBrains Mono currency formatting, and direct checkout action.
- S4: Design System & Rules Compliance: All UI components must strictly use `@nivo-sass/design-system` (`nv-button`, `nv-badge`, `nv-card`, `nv-typography`). All text in `APP_TEXTS`. Zero hardcoded strings or raw HTML buttons/inputs. No emojis in templates. Enforce OnPush change detection.

## Tasks
- [x] T1 (linked S1, S4): Destilar `app-page-header` removiendo envoltorio tosco de card y optimizando flujo vertical. | Route: delegated direct | Commit: pending
- [x] T2 (linked S2, S4): Integrar tiles CartoDB Dark Matter y estilo Zinc en ParkingMapComponent. | Route: delegated direct | Commit: pending
- [x] T3 (linked S3, S4): Rediseñar vista de Tickets: Metric Ribbon interactivo, chip de placa vehicular, temporizador de estadía y acción directa en fila. | Route: delegated direct | Commit: pending
- [x] T4 (linked S4): Verificación integral con pruebas unitarias (`bun run --cwd apps/web test`), `impeccable detect` y formateo (`oxfmt`). | Route: delegated direct | Commit: pending

## Log
- L1 (2026-10-28): User request verbatim: `/impeccable colorize bolder a todo el proyecto y distill a las paginas principales` y `siento que las vistas en la tabla están sobrecargadas sobre todo la de tickets, la siento sosa y sin utilidad más allá de ver los tickets, me gustaría hacer un rediseño de esa parte también, también la vista se parking está bien pero me gustaría que mires si es posible mejorar le algo referente a UX, el mapa de leaftlef debería seguir los colores de la marca también, y el page header en su momento me encanto pero ahora siento que vuelve un poco tosca la UI.`
- L2 (2026-10-28): Completed T1. Distilled app-page-header by removing card wrapper (`bg-card`, `border-border`, `rounded-2xl`, `shadow-xs`) and action dividing line (`border-t`, `pt-2.5`). Updated spec expectation for `@sm:py-3`. 56/56 page-header unit tests passing.
- L3 (2026-10-28): Completed T2. Replaced default OSM tiles with CartoDB Dark Matter (`CARTO_DARK_TILES`), added custom Nivo Emerald Radar marker with `L.divIcon`, styled Leaflet controls, zoom, attribution and container matching Zinc tokens. 13/13 parking-map unit tests passing.
- L4 (2026-10-28): Completed T3. Redesigned tickets view: interactive Metric Ribbon with active states and keyboard a11y, authentic Colombian yellow plate chips with camera badges for SP-, pulsing live emerald dot for OPEN status badge, direct Cobrar button in row actions, and bold tabular numbers for total to charge. 37/37 tickets unit tests passing.
- L5 (2026-10-28): Completed T4. Formatted all modified files with `bunx oxfmt --write` and validated via `bunx oxfmt --check`. Verified test suite with 10 test files and 106 unit tests passing (`bun run --cwd apps/web test`). Zero lint/type errors and impeccable detect clean.

## Key Learnings
- Destiling container padding from `@sm:p-6` to `@sm:py-3 @sm:px-0` and removing card encapsulation gives headers natural flow while saving ~60px vertical height without altering inner layout slots or container query breakpoints.
- Leaflet default `divIcon` injects `.leaflet-div-icon` styling with white background and border; overriding `:host ::ng-deep .nivo-map-marker-container` with transparent background and zero border enables clean animated radar ping markers.
- Encapsulating table cell styling into dedicated standalone presentational components (`TicketTotalCellComponent`) via `flexRenderComponent` allows clean tabular-nums and typography styling in TanStack table definitions without polluting templates with conditional cell logic.
