# Frontend Angular Standards

## Angular Component Principles

- **Single Responsibility:** One UI task or logic block per component. Standalone components stay lightweight; delegate side effects to services.
- **Reusability & Dynamic Inputs:** Use dynamic signal inputs (`input()`, `input.required()`, `model()`) to adapt across views.
- **Unidirectional Data Flow & Signals:** Data flows down via Signal inputs; state changes flow up via `output()`. Use Angular Signals (`computed()`, `linkedSignal()`) for fine-grained reactivity.
- **Encapsulation & Performance:** Enforce `ChangeDetectionStrategy.OnPush` across all components. Keep component styles scoped (`ViewEncapsulation.Emulated`).
- **Composition & Modern Control Flow:** Compose complex UIs nesting standalone components with native template control flow (`@if`, `@for`, `@switch`, `@defer`).
- **Separation of Concerns (Container / Presentational):** Decouple presentational components (pure UI, signal inputs/outputs) from container components/facades managing state, injection (`inject()`), async data streams (`resource()`, `rxResource()`, RxJS).
- **Design System Mandate (MANDATORY):** ALWAYS use design system components (`@nivo-sass/design-system` such as `nv-button`, `nv-card`, `nv-badge`, `nv-input`, `nv-typography`, etc.) instead of raw HTML elements (`<button>`, `<input>`, raw custom container divs, etc.). Never bypass design system.
  - Distinct styling needed: modify CSS or add reusable variant to design system component when reusable across views.
  - Never write ad-hoc raw HTML replacements when design system component exists.
- **Accessibility (a11y):** Embed semantic HTML, appropriate ARIA attributes, focus management, Angular CDK primitives into component structure.
- **TanStack Table Principles:** Never nest `@if / @else if (column.id === ...)` in table templates (`.html`). Encapsulate column headers and cell rendering in column definitions via TanStack `cell` / `header` definitions or inject presentational components via `flexRenderComponent`. Templates stay declarative with `*flexRender` delegation.
- **Section-Level Page Decomposition:** Page templates (`*-page.html`) strictly high-level orchestrators (<100 lines of template markup). Decompose complex pages into focused section subcomponents with typed inputs and outputs (e.g. `*-header`, `*-kpi-grid`, `*-charts-section`, `*-operations-section`, `*-reports-section`).
- **Non-Obscuring Page Headers:** Prohibit compound sticky headers pinning toolbars, breadcrumbs, selectors over content (>15% viewport height). Headers stay in natural document flow (`flex flex-col gap-4`) to protect viewport.
- **Empty State Discipline:** All charts, graphs, metric widgets must provide explicit, styled empty states (icons and copy from `APP_TEXTS`) when dataset empty. Never leave blank canvases or voids.

## Frontend Angular, Facades y Servicios

### Delegación Obligatoria a Clientes Generados (`ng-openapi-gen`)

- **Prohibición de `HttpClient` en Facades y Componentes:** Prohibido inyectar `HttpClient` o construir URLs HTTP manualmente en componentes o facades.
- **Servicios de Dominio Dedicados:** Encapsular llamadas HTTP en servicio de dominio (`@core/services/<domain>-api.service.ts`) inyectando servicios `ng-openapi-gen` (`@core/api/generated/services/`), aplicando `HttpContext` con `AUTHORIZED, true` y retornando observables tipados a modelos de dominio.

### Aislamiento de Modelos y Mappers

- **Prohibición de Tipos Inline:** Prohibido definir interfaces de datos o DTOs inline en facades o componentes.
- **Ubicación Canónica de Modelos:** Modelos residen exclusivamente en `@core/models/<domain>.model.ts`.
- **Mappers con Validación de Tipos:** Transformaciones y type guards TypeScript residen en `@core/mappers/<domain>.mapper.ts` con cobertura de pruebas unitarias.

### Aislamiento de SSE (Server-Sent Events) y Proxy de Desarrollo

- **Servicio SSE Dedicado:** Lógica de streaming reactivo (EventSource o fetch con ReadableStream, reconexión, backoff, tokens) en servicio dedicado (`@core/services/<domain>-sse.service.ts`). Facades solo orquestan señales.
- **Construcción de URL de Streaming:** Endpoints de streaming o API construyen ruta con `ApiConfiguration.rootUrl` (o proxy angular) para evitar 404 contra dev server (`localhost:4200`).
- **Proxy de Desarrollo:** En `apps/web/angular.json`, configurar `proxyConfig: "proxy.conf.json"` para redirigir `/api` al backend en desarrollo local.

### Control de Flujo Limpio en Signals (Anti-Nested-Ifs)

- **Eliminación de `if` Anidados:** Prohibidas escaleras de `if` anidados (`if (a) { if (b) { ... } }`) en facades o señales computadas. Usar retornos tempranos (`early returns`), booleanos planos y computeds explícitos de estado (ej. `isGlobalScope = computed(...)`, `isSingleScope = computed(...)`).

### Iconografía Unificada con Lucide

- **Prohibición de Emojis:** Prohibido emojis planos en plantillas (`.html`) para representar UI o sedes (ej. `🏢`).
- **Iconos Lucide:** Usar exclusivamente `@ng-icons/lucide` integrados con `NgIcon` y `provideIcons` en tarjetas KPI, botones y encabezados.

### Caché en Memoria con TTL (Deathtime) para Telemetría y Consultas

- **Caché en Servicios de Dominio API:** Servicios cliente de telemetría, dashboards o métricas deben cachear en memoria con expiración por TTL explícito (deathtime, ej. 30–60s) para evitar HTTP duplicado ante cambios rápidos de filtros o sedes.
- **Invalidación Manual y Streaming:** Refresco manual ("Sincronizar") invoca `clearCache()`. Actualizaciones push en tiempo real (SSE) actualizan o invalidan caché.

## UI Copy, Shell & Precision Invariants

### UI Copy Source of Truth (`APP_TEXTS`)

- All frontend text must live in `apps/web/src/app/shared/constants/app-texts.constant.ts` (`APP_TEXTS`).
- Zero hardcoded strings in Angular templates or components.

### Shell Containment & Numeric Precision

- Root app shell `<main>` must maintain `h-dvh max-h-dvh overflow-hidden` with content section scrolling (`overflow-y-auto`).
- Never print unrounded division/modulo floating-point numbers in UI (e.g. `15.300000000000011m`). Use explicit rounding (`Math.round`, `Math.floor`, `DecimalPipe`).

## Temporal Parameters & API Contracts

### Spring Boot / Angular Temporal Parameters

- Endpoints expecting `LocalDate` (e.g. `/dashboard/parkings-comparison`) accept `YYYY-MM-DD`. Do not send ISO DateTime with `T` or timezone offset.
- Endpoints expecting `OffsetDateTime` (e.g. `/dashboard/occupancy-hourly`) accept full ISO DateTime string.
- API client services must implement defensive parameter sanitization (`toLocalDateString`).
