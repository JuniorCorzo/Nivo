# Nivo - Multi-Tenant SaaS Parking Management System

Nivo is a multi-tenant SaaS platform engineered for complete parking lifecycle operations—from slot boundary and rate configuration to real-time QR check-in/out, automated fee calculation, occupancy dashboards, and public ticket tracking.

## Prerequisites & Package Manager

- **Node.js**: 22+
- **PNPM**: 12+ (`mise use -g pnpm` or `npm install -g pnpm`)
- **Java**: 25 (Temurin)
- **Docker**: Docker Compose v2+

### Why PNPM?
- **Content-Addressable Store (Hardlinks)**: Packages are stored in a single global content-addressable store and hardlinked across workspaces and Git Worktrees. This enables instant zero-copy worktree environments without duplicating disk storage.
- **Phantom Dependencies Prevention**: Enforces a strict, non-flat `node_modules` structure, preventing accidental access to undeclared indirect dependencies.
- **Native Angular Compatibility**: Full ecosystem support for Angular CLI, Vite, Vitest, and ng-packagr.

---

## Quick Path

Run the entire development stack with a single command:

```bash
# Install dependencies
pnpm install

# Start all services (Database, API, Web, Mockups)
./dev.sh
# Or using PNPM:
pnpm run dev
```

Inspect service health and port allocation:

```bash
./dev.sh status
```

Or run individual services:

```bash
# 1. Start local PostGIS, Prometheus & Grafana
pnpm run dev:db

# 2. Run Spring Boot API
pnpm run dev:api

# 3. Run Angular Web UI
pnpm run dev:web

# 4. Run Design System Storybook
pnpm run dev:design-system
```

---

## Service Endpoints & Ports

| Service | Port | Local URL | Health / Docs |
|---|---|---|---|
| **Frontend Web** | `4200` | http://localhost:4200 | Angular 21 Application |
| **Backend API** | `8080` | http://localhost:8080/api | Base API Path |
| **Interactive API Docs** | `8080` | http://localhost:8080/api/scalar | Scalar OpenAPI UI |
| **OpenAPI Spec** | `8080` | http://localhost:8080/api/v3/api-docs | OpenAPI 3 JSON |
| **Actuator & Metrics** | `8081` | http://localhost:8081/actuator/health | Prometheus & Health Probes |
| **Storybook** | `6006` | http://localhost:6006 | Design System Catalog |
| **PostgreSQL / PostGIS** | `5432` | `localhost:5432` (db: `nivo_db`) | `pg_isready -U postgres` |
| **Prometheus** | `9090` | http://localhost:9090 | Metrics Scraper |
| **Grafana** | `3000` | http://localhost:3000 | Dashboards |
| **Mockups Suite** | `8085` | http://localhost:8085 | UI Prototypes Server |

---

## Monorepo Architecture

```
Nivo/
├── apps/
│   ├── api/             # Java 25 / Spring Boot 4 Clean Architecture Backend
│   └── web/             # Angular 21 Standalone / Signal-based Web Application
├── libs/
│   └── design-system/   # @nivo-sass/design-system (OKLCH tokens, Storybook 10)
├── deployment/          # Docker Compose configurations (dev, build, e2e, prod)
├── docs/                # Architecture specs, requirements, and deployment guides
└── dev.sh               # Unified development orchestration CLI
```

### Module Breakdown

| Workspace / Module | Core Technologies | Responsibility | Readme |
|---|---|---|---|
| [`apps/api`](apps/api/README.md) | Java 25, Spring Boot 4.0, Virtual Threads, PostGIS, Flyway, Spring Security 7, Scalar | Domain business logic, multi-tenant data isolation, rate engine, REST APIs | [API Docs](apps/api/README.md) |
| [`apps/web`](apps/web/README.md) | Angular 21, Signals, TanStack Table, Tailwind CSS v4, Vitest, Playwright | Operator dashboard, live slot grid, vehicle check-in/out, public ticket view | [Web Docs](apps/web/README.md) |
| [`libs/design-system`](libs/design-system/README.md) | Angular 21, OKLCH Tokens, Storybook 10, ng-packagr | Reusable UI components (`@nivo-sass/design-system`), accessible design tokens | [Design System Docs](libs/design-system/README.md) |

---

## Technology Stack

- **Backend Platform**: **Java 25** with Virtual Threads enabled, **Spring Boot 4.0**, Spring Security 7 (OAuth2 Resource Server with JWT & RSA public/private key pairs).
- **Architecture**: Single-module **Clean Architecture** separating `domain` (models & use cases) from `infrastructure` (driven adapters, entrypoint controllers, security).
- **Data Persistence**: **PostgreSQL 16** with **PostGIS** spatial extension for geographic parking slot coordinates and boundaries, managed via **Flyway** migrations.
- **Frontend Platform**: **Angular 21** Standalone Components, Signal-based reactivity (`linkedSignal`, `resource`), `OnPush` change detection, and `@tanstack/angular-table`.
- **Styling & UI**: **Tailwind CSS v4** with `@tailwindcss/postcss`, Lucide icons (`@ng-icons/lucide`), OKLCH color palettes, and Storybook 10.
- **Code Generation & Contracts**: OpenAPI 3 with **Scalar** interactive UI and client generation via `ng-openapi-gen`.
- **Testing & Quality**:
  - Backend: JUnit 5, MockMvc, Testcontainers PostgreSQL, ArchUnit, JaCoCo, Spotless.
  - Frontend: Vitest, Happy-DOM, Playwright E2E, Oxlint, Oxfmt, Ultracite.
- **Observability**: Sentry error tracking, Micrometer Prometheus metrics, and Grafana dashboards.

---

## Key Workflows & Scripts

All common workflows are orchestrated from the root using PNPM:

```bash
# Development Orchestration
./dev.sh start [service]       # Start all or specific service (api, web, db, mockups)
./dev.sh stop [service]        # Stop services and release ports
./dev.sh restart [service]     # Restart services
./dev.sh status                # Live status table of running services
./dev.sh logs <service>        # Follow service logs (api, web, db, mockups)

# Testing
pnpm run test:e2e               # Run Playwright E2E test suite
pnpm run test:e2e:chromium      # Run Playwright with Chromium browser

# Code Formatting & Verification
pnpm run format:all:check       # Check Java (Spotless) and TS/CSS (Oxfmt)
pnpm run format:all:fix         # Fix formatting across the entire monorepo
pnpm run format:api:fix         # Spotless apply on apps/api
pnpm run format:fix             # Oxfmt write on apps/web & libs/design-system

# Design System & Tokens
pnpm run dev:tokens             # Rebuild OKLCH design tokens
pnpm run dev:build              # Compile @nivo-sass/design-system library
```

---

## Detailed Documentation

- 🛠️ [Local Development Setup Guide](docs/development-setup.md): Environment prerequisites, RSA key generation, and troubleshooting.
- 🚀 [Homelab & Production Deployment Guide](docs/deployment-homelab.md): Docker Compose multi-stage builds, reverse proxies, and backup routines.
- 📋 [Requirements Specification](docs/requirements.md): System functional and non-functional requirements.
- 📖 [Use Cases Specification](docs/nivo_use_cases.md): User flows, rate calculation rules, and ticket lifecycle.
- 🎨 [Logo & Brand Assets Guide](libs/design-system/docs/assets/logos/nivo/README.md): Master SVG logo variants, optical compensation rules, and usage specifications.
