# Nivo Web - Frontend Application

Multi-tenant web dashboard and operational interface for Nivo Parking Management, built with **Angular 21**, **Signals reactivity**, **TanStack Table**, and **Tailwind CSS v4**.

## Quick Path

### 1. Prerequisites

- **Bun 1.3+**
- Backend API running at `http://localhost:8080/api`

### 2. Run Locally

```bash
# From apps/web directory:
bun run start

# Or from monorepo root:
bun run dev:web
```

Open [http://localhost:4200](http://localhost:4200) in your browser.

---

## Tech Stack & Core Libraries

- **Framework**: **Angular 21** (`@angular/core: ^21.2.6`) with Standalone Components and strict `OnPush` change detection.
- **Reactivity**: Modern Angular Signals (`signal`, `computed`, `linkedSignal`, `resource`).
- **Styling**: **Tailwind CSS v4** (`@tailwindcss/postcss`) coupled with `@nivo-sass/design-system` tokens and components.
- **Data Tables**: **@tanstack/angular-table** for high-performance server-side & client-side filtering, sorting, and pagination.
- **Icons & UI Assets**: `@ng-icons/lucide` and `@ngxpert/hot-toast` notifications.
- **Spatial / Maps**: Leaflet (`leaflet: 1.9.4`) for parking facility layouts and spatial slot representation.
- **API Client Generation**: `ng-openapi-gen` generating typed Angular HTTP services and models directly from the backend OpenAPI 3 contract.
- **Testing**:
  - Unit Tests: **Vitest** (`vitest: ^3.0.7`) + **Happy-DOM** for instant feedback loops.
  - End-to-End: **Playwright** (`@playwright/test: ^1.63.0`) for cross-browser integration journeys.
- **Code Quality**: Ultracite, Oxlint (`oxlint: ^1.81.0`), and Oxfmt (`oxfmt: ^0.66.0`).

---

## Directory Structure

```
src/app/
├── core/                        # Singleton Services & Infrastructure
│   ├── api/                     # Generated OpenAPI client services and models (ng-openapi-gen)
│   ├── guards/                  # Route guards (AuthGuard, TenantGuard)
│   ├── http/                    # HTTP interceptors (JWT bearer token, X-Tenant-Id header, error handling)
│   ├── models/                  # Core frontend models and state types
│   ├── monitoring/              # Sentry initialization and tracing configuration
│   └── services/                # Global services (AuthService, PublicTicketService, TenantService)
├── features/                    # Domain Features
│   ├── auth/                    # Login, user registration, password recovery flows
│   ├── dashboard/               # Operational metrics, occupancy graphs, comparative KPI summaries
│   ├── operations/              # Real-time slot management, active tickets, live facility monitor
│   ├── parking/                 # Parking lot creation, zone configuration, operating hours
│   ├── public-ticket/           # Driver-facing mobile view accessible via QR code scan
│   ├── rates/                   # Dynamic pricing rules (hourly, minute, vehicle-type, 0% IVA resolution)
│   ├── slots/                   # Parking space inventory, TanStack table filtering/search, status toggles
│   ├── tickets/                 # Ticket lifecycle, check-in/out modals, unplated vehicles, photo capture
│   └── users/                   # Tenant operator and role management
├── layouts/                     # Shell layouts
│   ├── layout/                  # Main authenticated application shell with sidebar & navigation
│   └── layout-minimal/          # Minimal layout for public ticket view and authentication pages
└── shared/                      # Reusable components, pipes, directives, and utilities
```

---

## Available Commands

| Command | Purpose |
|---|---|
| `bun run start` | Start Angular development server at `http://localhost:4200` |
| `bun run build` | Compile production build into `dist/web` |
| `bun run watch` | Build with watch mode in development configuration |
| `bun run generated:api` | Regenerate TypeScript API client from OpenAPI spec (`ng-openapi-gen.json`) |
| `bun run test` | Run fast unit tests using Vitest and Happy-DOM |
| `bun run test:e2e` | Run Playwright end-to-end tests across headless browsers |
| `bun run test:e2e:chromium` | Run Playwright tests targeting Chromium exclusively |
| `bun run check` | Run linter and formatting diagnostics (`ultracite check`) |
| `bun run fix` | Automatically fix linting and style errors (`ultracite fix`) |

---

## API Client Synchronization

When backend endpoints or DTO records change in `apps/api`:

1. Ensure the backend is running with OpenAPI enabled (`http://localhost:8080/api/v3/api-docs`).
2. Run the generator script:
   ```bash
   bun run generated:api
   ```
3. Generated services and models will be updated inside `src/app/core/api/`.
