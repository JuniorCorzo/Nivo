# Project Conventions

## Core Engineering Principles

### SOLID Principles (Angular / TypeScript Context)

- **Single Responsibility Principle (SRP):** Each component, service, or directive should have one, and only one, reason to change. Components focus on UI rendering; state and business logic are delegated to facades or services.
- **Open/Closed Principle (OCP):** Entities are open for extension via composition, content projection (`<ng-content>`), directives, and dependency injection, but closed for modification.
- **Liskov Substitution Principle (LSP):** Service implementations and custom controls (e.g. `ControlValueAccessor` / Form controls) must fulfill their contracts without breaking caller expectations.
- **Interface Segregation Principle (ISP):** Depend on lean interfaces and dedicated InjectionTokens rather than monolithic contracts.
- **Dependency Inversion Principle (DIP):** Depend on abstractions (interfaces, abstract classes, `InjectionToken`) and inject dependencies via `inject()` rather than concrete tight-coupling.

### Simplicity & Pragmatism

- **KISS (Keep It Simple, Stupid):** Prefer simple, declarative, and readable solutions over over-engineered abstractions.
- **YAGNI (You Aren't Gonna Need It):** Build only what is needed for the current requirements; avoid premature abstractions.

---

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

---

## Multi-Tenant & Backend Observability Principles

- **Separación de Audiencias en Telemetría:**
  - **Métricas de Negocio de Tenants:** Datos transaccionales de clientes (ocupación en vivo, plazas disponibles, recaudación, permanencia) residen exclusivamente en PostgreSQL (vistas optimizadas), entregadas vía REST y Server-Sent Events (SSE) a la aplicación web.
  - **Observabilidad de Plataforma (Prometheus / Micrometer):** Reservada estrictamente para la salud, rendimiento y resiliencia de la infraestructura del backend (conexiones activas SSE, latencias de consultas a vistas SQL, tasas de error y bloqueos de Rate Limiting).
- **Prohibición de Alta Cardinalidad (High-Cardinality Invariant):**
  - NUNCA registrar etiquetas dinámicas de alta cardinalidad (`tenantId`, `parkingId`, `licensePlate`, `ticketId`, `userId`, marcas temporales) en métricas de Prometheus. Todas las etiquetas deben tener valores acotados y predecibles (ej. `status: 200|404|429`, `view: daily|hourly|ops`).

---

## Multi-Facility Tenant Architecture (Doble Ámbito)

- **Soporte Dual Nativo (Sede Individual vs. Consolidado Global):**
  - Cualquier funcionalidad analítica, financiera u operativa de instalaciones físicas debe soportar consulta unificada por sede puntual (`?parkingId={uuid}`) o agregada de toda la red del tenant (omitiendo `parkingId` o `scope=GLOBAL`).
- **Detección Automática en Frontend:**
  - Si el tenant posee 1 sola sede: el frontend se enfoca directamente en dicha instalación sin selectores redundantes ni opciones de consolidado.
  - Si el tenant posee múltiples sedes (> 1): la navegación y cabecera deben proveer la opción "Todas las Sedes (Consolidado Global)", agregando KPIs corporativos y ofreciendo un widget comparativo entre instalaciones (ranking/gráfico de barras).

---

## Rigor en Pruebas Automatizadas (Anti-Trivial Assertions)

- **Prohibición de Aserciones Pobres:** NUNCA dar por válida una prueba con aserciones triviales como `assertThat(result).isNotNull()`, `expect(result).toBeDefined()` o meras llamadas sin verificación de datos.
- **Validación de Criterios de Aceptación Reales:**
  - **Aislamiento Multi-Tenant:** Fixtures con al menos 2 tenants distintos para comprobar que los datos del Tenant A no se filtran al Tenant B.
  - **Precisión Matemática:** Validar que solo estados completados (ej. `PAID`) sumen a ingresos, descartando transacciones fallidas o pendientes.
  - **Casos Borde:** Probar comportamiento ante listas vacías, sedes sin movimientos y prevención de división por cero en porcentajes.
  - **Limpieza de Recursos:** Comprobar el ciclo de vida y destrucción de recursos (invocación de `chart.destroy()`, cierre de `SseEmitter` ante timeout/error).

---

## Estándar de Documentación OpenSpec y Markdown

- **Legibilidad y Saltos de Línea:** Las propuestas (`proposal.md`) y especificaciones deben estructurarse en párrafos cortos y legibles con saltos de línea explícitos; NUNCA generar bloques corridos en una sola línea.
- **Conformidad con Markdownlint y Prettier:**
  - Rodear siempre los encabezados (`#`, `##`, `###`) y listas con una línea en blanco.
  - Formatear siempre con Prettier antes de commitear.

---

## Backend Java & Clean Architecture Standards

### Reglas Estrictas de Tipado e Inmutabilidad

- **Prohibición de `var`:** Está estrictamente prohibido el uso de `var` en el backend. Toda variable local y parámetro debe especificar su tipo concreto explícitamente.
- **Inmutabilidad Obligatoria (`final`):** Toda variable que no mute y todo parámetro de método DEBE llevar el modificador `final` (ej. `final UUID parkingId`, `final LocalDate today = LocalDate.now();`).

### Controladores REST Delgados (Thin Controllers)

- **Responsabilidad Única de Transporte:** Los controladores REST deben permanecer ultradelgados, limitándose a mapeo de rutas, validación de entrada (`@Valid`), negociación de contenido y métricas de infraestructura.
- **Contexto de Seguridad en Casos de Uso:** Prohibido resolver o extraer `tenantId` en los controladores para pasarlo como parámetro al caso de uso. Inyectar `AuthenticationContextGateway` directamente en el caso de uso y resolver `tenantId` internamente.
- **Manejo Centralizado de Excepciones:** Prohibido definir `@ExceptionHandler` locales en controladores para excepciones genéricas (ej. `IllegalArgumentException`). Todo error de dominio debe modelarse con una excepción personalizada que herede de `dev.angelcorzo.nivo.domain.model.commons.exceptions.AppException`, la cual es gestionada globalmente por `ExceptionHandlerController`.

### Diseño de Casos de Uso y Flujo de Control

- **Métodos `execute` como Orquestadores:** El método `execute` debe limitarse a coordinar el flujo. Si existen bifurcaciones significativas (ej. sede individual vs. consolidado de inquilino), el flujo debe delegarse inmediatamente a métodos privados especializados.
- **Early Returns sin Escaleras de `else`:** Siempre que sea viable, utilizar retornos tempranos (`early returns`) y eliminar bloques `else` redundantes.
- **Estilo Declarativo con Java Streams y Lambdas:** Preferir pipelines de Java Streams (`map`, `filter`, `sum`, `collect`) y lambdas frente a bucles iterativos imperativos (`for`/`while`) con acumuladores mutables.
- **Consultas Optimizadas en Repositorio (Anti-In-Memory Filtering):** Nunca cargar colecciones completas a memoria para filtrar el último registro o calcular métricas agregadas. Diseñar métodos específicos en los repositorios de Spring Data JPA (ej. `findFirstBy...OrderBy...Desc`) y exponerlos en los gateways de dominio.

### Contratos DTO y Documentación OpenAPI

- **Anotaciones `@Schema` Obligatorias:** Todo DTO expuesto a través de endpoints REST debe estar documentado con `@Schema` (`io.swagger.v3.oas.annotations.media.Schema`) tanto a nivel de clase/record como en cada uno de sus campos, incluyendo `description` y `example`. Esto asegura que herramientas como `ng-openapi-gen` en el frontend generen interfaces TypeScript tipadas y documentadas sin tipos `unknown`.
