# Feature: Nivo Landing Page with Backend Simulator
Objective: Landing page pública de Nivo para pequeños parqueaderos que usan papel, con simulador interactivo conectado al PricingEngine del backend.
Branch: feat/landing-page
Delivery Strategy: ask-on-risk
Test Runners: ./gradlew test (apps/api), bun run --cwd apps/web test (apps/web)

## Specs
- S1: Backend - Exponer endpoint público `POST /api/v1/public/simulator/calculate` (permitAll en Spring Security) que recibe `vehicleType`, `minutesStayed` (o `entryTime`/`exitTime`), `pricePerHour`, `gracePeriodMinutes`, ejecuta `PricingEngine` y retorna `PriceDetailed` (`subtotal`, `ivaAmount`, `total`, `breakpoints`).
- S2: Frontend - Servicio `SimulatorService` en `apps/web` que consume `/api/v1/public/simulator/calculate` con debounce y manejo de errores.
- S3: Frontend - Componente `LandingPageComponent` en `apps/web/src/app/features/landing/` con Navbar pública, Hero ("De talonario de papel a control total en 2 minutos"), Simulador interactivo en vivo, comparativa de papel vs digital, pilares de valor, precios y llamadas a la acción (`/login` y `/register`).
- S4: Frontend Routing - Configurar ruta raíz `/` en `apps/web/src/app/app.routes.ts` cargando `LandingPageComponent` con `publicGuard`.

## Tasks
- [x] T1 [S1] (delegated): Implementar `SimulateRateUseCase`, DTOs de request/response y controller público `PublicSimulatorController` con pruebas unitarias TDD y MockMvc. Commit: e2a9cb8.
- [x] T2 [S1] (inline): Configurar Spring Security para permitir acceso anónimo a `/api/v1/public/**` (verificado vía publicSecurityFilterChain). Commit: e2a9cb8.
- [x] T3 [S2] (delegated): Crear `SimulatorService` y modelos en `apps/web` con pruebas unitarias. Commit: b13380a.
- [x] T4 [S3, S4] (delegated): Desarrollar `LandingPageComponent` y subcomponentes con `@nivo-sass/design-system` y conectar a `/` en `app.routes.ts` con tests unitarios. Commit: b13380a.
- [x] T5 [S1, S2, S3, S4] (inline): Verificación completa de suite backend y frontend (136 suites / 979 tests frontend + JUnit tests backend + ng build exitoso). Commit: b13380a.

## Log
- L1 (2026-10-20): Usuario solicita: "quiero que crees un nuevo worktree centrado en hacer la landing de Nivo, tambien crea la tarea dentro de vikunja y colocala en progress"
- L2 (2026-10-20): Usuario ejecuta `/impeccable shape landing principal de nivo` y define target: pequeños parqueaderos que usan papel sin inversión de hardware.
- L3 (2026-10-20): Usuario indica: "para el simulador preferiria que lo hiciese desde el backend al final ahi tenemos toda la logica del motor"
