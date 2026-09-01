# Nivo - Multi-Tenant SaaS Parking Management System

## 1. Executive Summary

Nivo is a **multi-tenant SaaS web platform** designed for the comprehensive management of parking lots. Each parking lot owner (tenant) can manage their facilities independently, with their data securely isolated from other tenants.

The system provides a complete solution covering the entire parking lifecycle: from the initial registration and configuration of parking lots and individual spaces to real-time control of vehicle entry and exit using QR codes or physical tickets. It supports advance reservations, on-site payment processing, and the generation of digital receipts. Additionally, the platform features a powerful dashboard and reporting tools to monitor key metrics like occupancy and revenue.

Built on a scalable, cloud-based and self-hostable architecture, Nivo is designed for high reliability and performance, offering responsive web interfaces and public APIs for third-party integrations.

---

## 2. Technology Stack

- **Frontend**: Modern **Angular 20+** Standalone Components, Signal-based reactivity, OnPush change detection, SCSS design tokens, and Storybook design system.
- **Backend**: **Java 25 / Spring Boot 4** with Virtual Threads enabled, Clean Architecture layer separation (Domain, Use Cases, Driven Adapters, Entry Points), Log4j2, and Flyway database migrations.
- **Database**: **PostgreSQL 16 with PostGIS** spatial extension for geographic slot and parking lot boundaries.
- **Documentation**: OpenAPI 3 with interactive **Scalar** UI.
- **Deployment**: Docker & Docker Compose with multi-stage production builds and health checks.

---

## 3. Documentation & Guides

- 🛠️ [Local Development Setup Guide](docs/development-setup.md): Complete steps for running PostGIS, Spring Boot API, and Angular Web UI locally.
- 🚀 [Homelab & Production Deployment Guide](docs/deployment-homelab.md): Comprehensive guide for containerized deployment, SSL reverse proxies, backups, and health monitoring.
- 📋 [Requirements Specification](docs/requirements.md): In-depth functional and non-functional requirements.
- 📖 [Use Cases](docs/nivo_use_cases.md): Detailed use case specifications and user flows.

---

## 4. Key Features

- **Multi-Tenant Architecture:** Secure data isolation ensures that each tenant (parking owner) can only access their own information.
- **Parking Lot Management:** Create and configure multiple parking lots, including their layout, zones, and operating hours.
- **Space (Slot) Management:** Define and manage individual parking spaces, specifying type (car, motorcycle, EV, disabled) and status.
- **Rate Configuration:** Set up flexible pricing rules based on time (per minute/hour), vehicle type, or specific zones.
- **Check-in / Check-out Control:** Seamlessly manage vehicle entry and exit by scanning QR codes from reservations or issuing digital tickets.
- **Advance Reservations:** Allow drivers to book a parking space for a future date and time, with automatic space blocking.
- **On-Site Payments:** Process payments directly at the exit based on the duration of the stay and the applicable rate.
- **Dashboard and Reporting:** Access real-time metrics on occupancy and revenue, and generate detailed reports on daily operations, income, and average stay duration.
- **Public API:** Expose a public endpoint for querying parking space availability, allowing for integration with third-party applications.
- **Hardware Integration:** Designed to be compatible with standard industry hardware, including QR code scanners, automatic barriers, occupancy sensors, and payment terminals.

---

## 5. Quick Start

```bash
# 1. Start local PostGIS database
bun run dev:db

# 2. Run Backend API (in apps/api)
./apps/api/gradlew -p apps/api :app-service:bootRun

# 3. Run Frontend Web UI
bun run dev:web
```

For detailed instructions, refer to the [Development Setup Guide](docs/development-setup.md).
