# Frontend Angular Standards

## Angular Component Principles

- **Single Responsibility:** One component fulfills one specific UI task or logic block. Standalone components stay lightweight and delegate side effects to services.
- **Reusability & Dynamic Inputs:** Driven by dynamic signal inputs (`input()`, `input.required()`, `model()`) to adapt across different views.
- **Unidirectional Data Flow & Signals:** Data flows down via Signal inputs; state changes flow up via `output()`. Leverage Angular Signals (`computed()`, `linkedSignal()`) for fine-grained reactivity.
- **Encapsulation & Performance:** Enforce `ChangeDetectionStrategy.OnPush` across all components. Keep component styles scoped (`ViewEncapsulation.Emulated`).
- **Composition & Modern Control Flow:** Compose complex UIs by nesting smaller standalone components using native template control flow (`@if`, `@for`, `@switch`, `@defer`).
- **Separation of Concerns (Container / Presentational):** Decouple presentational (dumb) components (pure UI, signal inputs/outputs) from container (smart) components or facades managing state, injection (`inject()`), and async data streams (`resource()`, `rxResource()`, RxJS).
- **Design System Mandate (MANDATORY):** ALWAYS use design system components (`@nivo-sass/design-system` such as `nv-button`, `nv-card`, `nv-badge`, `nv-input`, `nv-typography`, etc.) instead of raw HTML elements (`<button>`, `<input>`, raw custom container divs, etc.). Design system components exist to ensure consistency across the entire application and MUST NOT be ignored or bypassed.
  - If a specific screen or interaction requires distinct styling: modify the CSS or add a reusable variant to the design system component when the pattern is or can be used on more than one occasion.
  - Never write ad-hoc raw HTML replacements when a design system component exists for that purpose.
- **Accessibility (a11y):** Embed semantic HTML, appropriate ARIA attributes, focus management, and Angular CDK primitives directly into the component structure.
- **TanStack Table Principles:** Never nest `@if / @else if (column.id === ...)` branching ladders in table templates (`.html`). Encapsulate column headers and cell rendering directly in the column definitions using TanStack's `cell` and `header` definitions or inject dedicated presentational components via `flexRenderComponent`. Templates must remain purely declarative with simple `*flexRender` delegation.

## Frontend Angular, Facades y Servicios

### Delegación Obligatoria a Clientes Generados (`ng-openapi-gen`)

- **Prohibición de `HttpClient` en Facades y Componentes:** Prohibido inyectar `HttpClient` o construir URLs HTTP manualmente en componentes o facades.
- **Servicios de Dominio Dedicados:** Toda llamada HTTP debe encapsularse en un servicio de dominio (`@core/services/<domain>-api.service.ts`) que inyecte los servicios generados por `ng-openapi-gen` (`@core/api/generated/services/`), aplique `HttpContext` con el token `AUTHORIZED, true` y retorne observables tipados hacia modelos de dominio.

### Aislamiento de Modelos y Mappers

- **Prohibición de Tipos Inline:** Prohibido definir interfaces de datos o DTOs inline en facades o componentes.
- **Ubicación Canónica de Modelos:** Los modelos residen exclusivamente en `@core/models/<domain>.model.ts`.
- **Mappers con Validación de Tipos:** Las transformaciones y validaciones de tipos en tiempo de ejecución (type guards con TypeScript) residen en `@core/mappers/<domain>.mapper.ts` y deben contar con cobertura de pruebas unitarias.

### Aislamiento de SSE (Server-Sent Events) y Proxy de Desarrollo

- **Servicio SSE Dedicado:** La lógica de streaming reactivo (EventSource o fetch con ReadableStream, reconexión, backoff y tokens) debe residir en un servicio dedicado (`@core/services/<domain>-sse.service.ts`), manteniendo las facades puramente como orquestadoras de señales.
- **Construcción de URL de Streaming:** Todo endpoint de streaming o API debe construir su ruta utilizando `ApiConfiguration.rootUrl` (o proxy angular) para evitar peticiones fallidas (404) contra el servidor de desarrollo (`localhost:4200`).
- **Proxy de Desarrollo:** En `apps/web/angular.json`, la opción `proxyConfig: "proxy.conf.json"` debe estar configurada para redirigir `/api` hacia el backend en desarrollo local.

### Control de Flujo Limpio en Signals (Anti-Nested-Ifs)

- **Eliminación de `if` Anidados:** Prohibidas las escaleras de `if` anidados (`if (a) { if (b) { ... } }`) en facades o señales computadas. Utilizar retornos tempranos (`early returns`), booleanos planos y computeds explícitos de estado (ej. `isGlobalScope = computed(...)`, `isSingleScope = computed(...)`).

### Iconografía Unificada con Lucide

- **Prohibición de Emojis:** Prohibido el uso de emojis planos en plantillas (`.html`) para representar elementos de UI o sedes (ej. `🏢`).
- **Iconos Lucide:** Utilizar exclusivamente iconos de `@ng-icons/lucide` integrados con `NgIcon` y `provideIcons` en tarjetas KPI, botones y encabezados.
