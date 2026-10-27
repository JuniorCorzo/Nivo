# Nivo API - Backend Service

Multi-tenant backend service for Nivo Parking Management, built with **Java 25** and **Spring Boot 4.0** following **Clean Architecture** principles.

## Quick Path

### 1. Prerequisites

- **JDK 25**
- **Docker** running PostGIS (from monorepo root: `bun run dev:db`)
- **RSA Keypair** for JWT signing and verification

```bash
# Generate keys if not already present
mkdir -p src/main/resources/keys
openssl genrsa -out src/main/resources/keys/private.pem 2048
openssl rsa -in src/main/resources/keys/private.pem -pubout -out src/main/resources/keys/public.pem
```

### 2. Run Locally

```bash
# From apps/api directory:
./gradlew bootRun

# Or from monorepo root:
bun run dev:api
```

### 3. Verify Endpoints

- **Interactive API Documentation (Scalar)**: [http://localhost:8080/api/scalar](http://localhost:8080/api/scalar)
- **OpenAPI 3 JSON Specification**: [http://localhost:8080/api/v3/api-docs](http://localhost:8080/api/v3/api-docs)
- **Actuator Health & Metrics**: [http://localhost:8081/actuator/health](http://localhost:8081/actuator/health) (Management port `8081`)

---

## Architecture

Nivo API implements Clean Architecture within a single Gradle module structure (`dev.angelcorzo.nivo`), ensuring strict dependency inversion: domain logic remains completely decoupled from framework and infrastructure concerns.

```
src/main/java/dev/angelcorzo/nivo/
├── domain/                      # Core Business Logic (Zero framework dependencies)
│   ├── model/                   # Entities, Value Objects, Domain Events, Gateway Interfaces
│   └── usecase/                 # Orchestration use cases (Rates, Tickets, Dashboard, Slots)
├── infrastructure/              # Outer Technology Adapters
│   ├── adapter/                 # Driven Adapters: JPA Repositories, PostGIS queries, DB functions, Sentry
│   ├── entrypoint/              # Driving Adapters: Spring MVC Controllers, DTO records, WebSockets
│   └── security/                # JWT Authentication Filter, Tenant Context Resolver, Spring Security
└── config/                      # Spring @Configuration beans, Flyway, Jackson JSR-310, Scalar/OpenAPI
```

### Package Responsibilities

| Package | Layer | Responsibilities | Key Rules |
|---|---|---|---|
| `domain.model` | Domain | `ParkingLot`, `Vehicle`, `Ticket`, `Slot`, `RatePolicy`, `Tenant` entities and repository gateways | No Spring, JPA, or external framework imports |
| `domain.usecase` | Use Cases | `CalculateRateUseCase`, `CheckInVehicleUseCase`, `CheckOutVehicleUseCase`, `GetDashboardSummaryUseCase` | Orchestrates entities and calls domain gateways |
| `infrastructure.adapter` | Driven Adapter | PostgreSQL repositories, PostGIS spatial queries, `fn_get_dashboard_summary` SQL delegation, Brevo email, ePayco payment | Implements domain gateway interfaces |
| `infrastructure.entrypoint` | Driving Adapter | REST controllers under `/api/v1/...`, request/response records, DTO mappers, WebSocket handlers | Converts HTTP to domain commands; documents with OpenAPI |
| `infrastructure.security` | Security / Filter | Multi-tenant context extraction (`X-Tenant-Id`), JWT bearer validation, role authorization | Injects authenticated context into request scope |
| `config` | Configuration | DataSource HikariCP, Flyway migration runner, Scalar UI, Sentry integration | Wiring Spring Boot beans |

---

## Tech Stack & Highlights

- **Runtime & Framework**: Java 25 with Virtual Threads enabled (`spring.threads.virtual.enabled: true`), Spring Boot 4.0.3.
- **Security**: Spring Security 7 with OAuth2 Resource Server, asymmetric RSA JWT verification, and multi-tenant data boundary validation.
- **Database**: PostgreSQL 16 with PostGIS extension for spatial boundaries, managed via Flyway migrations under schema `nivo`.
- **Database Aggregation**: Single-query operational KPI calculation offloaded to PostgreSQL table-valued function `nivo.fn_get_dashboard_summary`.
- **API Documentation**: Scalar UI (`com.scalar.maven:scalar-webmvc`) + Springdoc OpenAPI 3.
- **Observability**: Sentry 8.3 SDK, Micrometer Prometheus metrics on port `8081`.
- **Formatting**: Spotless 7 with Eclipse Java Formatter.

---

## Development Commands

| Command | Purpose |
|---|---|
| `./gradlew bootRun` | Run API server in local dev profile (port `8080`) |
| `./gradlew test` | Run JUnit 5, MockMvc, ArchUnit, and Testcontainers test suite |
| `./gradlew jacocoTestReport` | Generate code coverage HTML report (`build/reports/jacocoHtml/index.html`) |
| `./gradlew spotlessCheck` | Verify Java code formatting standards |
| `./gradlew spotlessApply` | Automatically format Java files |
| `./gradlew bootJar` | Build production executable fat JAR (`build/libs/Nivo.jar`) |

---

## Configuration Reference

Key environment variables configurable in `.env` or system environment:

| Variable | Default (Dev) | Description |
|---|---|---|
| `API_PORT` | `8080` | HTTP port for REST and Scalar endpoints |
| `MANAGEMENT_PORT` | `8081` | Actuator and Prometheus metrics port |
| `DB_HOST` | `localhost` | PostgreSQL host |
| `DB_PORT` | `5432` | PostgreSQL port |
| `DB_NAME` | `nivo_db` | Database name |
| `DB_USERNAME` | `postgres` | Database user |
| `DB_PASSWORD` | `postgres` | Database password |
| `RSA_PUBLIC_KEY_LOCATION` | `classpath:keys/public.pem` | RSA public key for JWT validation |
| `RSA_PRIVATE_KEY_LOCATION` | `classpath:keys/private.pem` | RSA private key for JWT signing |
| `JWT_ISSUE` | `https://api.nivo.dev` | Expected JWT issuer |
| `JWT_ACCESS_TOKEN_EXPIRATION` | `900` | Token expiration in seconds (15 minutes) |
| `SCALAR_ENABLED` | `true` | Enable/disable interactive Scalar API docs |
