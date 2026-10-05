# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary users are **Parking Owners and Facility Managers** managing single or multi-facility parking networks. They require executive visibility into operations, real-time occupancy KPIs, revenue analytics, pricing configurations, and facility-level access control.

Secondary users include:
- **On-site Booth Operators:** Responsible for expedited vehicle entry/exit validation, physical and QR ticket processing, cash/card POS payments, and barrier override.
- **End-user Drivers (Customers):** Seeking parking spaces, viewing real-time availability, and making advance reservations.

## Product Purpose

Nivo is a multi-tenant SaaS parking management platform that unifies the complete parking operations lifecycle—from space registration and dynamic rate calculations to QR check-in/out, POS payments, and real-time business intelligence. Success means giving parking operators complete operational control, eliminating manual ticket discrepancies, maximizing space turnover, and providing real-time data isolation between tenants.

## Positioning

Unlike legacy, hardware-locked parking management systems that require proprietary controllers and isolated on-premises servers, Nivo provides a modern, cloud-native, hardware-agnostic platform supporting standard QR scanners, cameras, and IoT sensors, with native dual-scope analytics (individual facility vs. consolidated global multi-facility networks) under strict multi-tenant isolation.

## Operating Context

- Desktop management dashboard used in administrative offices for financial review, tenant management, and rate adjustments.
- High-throughput entry/exit kiosks and tablet/desktop POS terminals in parking booths operated in fast-paced physical environments.
- Mobile browsers used by drivers to inspect space availability and present reservation QR codes.
- Network environments with occasional intermittent connectivity requiring clean operational state management and responsive UI feedback.

## Capabilities and Constraints

- **Multi-Tenant Isolation:** Absolute data isolation enforced at the database and application tier (`tenant_id` invariants).
- **Dual-Scope Operations:** Native support for single-facility focus vs. consolidated multi-facility reporting (`?parkingId={uuid}` vs. `scope=GLOBAL`).
- **Real-Time Data Streaming:** Server-Sent Events (SSE) deliver live occupancy updates to the web interface without polling.
- **Design System Mandate:** All UI surfaces MUST exclusively use `@nivo-sass/design-system` components (`nv-button`, `nv-card`, `nv-badge`, `nv-input`, `nv-typography`, etc.) with `ChangeDetectionStrategy.OnPush`. Raw HTML buttons/inputs are strictly prohibited.
- **Iconography:** Standardized on `@ng-icons/lucide` (`provideIcons`, `NgIcon`); emojis in templates are forbidden.
- **TanStack Table:** Purely declarative table templates without `@if/@else if` column branching ladders.

## Brand Commitments

- **Name:** Nivo.
- **Tone & Voice:** Modern B2B SaaS: Crisp, technical, high-density, data-driven, and professional.
- **Visual Personality:** Clean, utilitarian, structured, high-contrast, and focused on information density and scannability.

## Evidence on Hand

- Functional requirements specification: `docs/requirements.md`
- Use case specifications: `docs/nivo_use_cases.md`
- Architecture and monorepo structure: `ARCHITECTURE.md`
- Design system library and token definitions: `libs/design-system/`
- Strict engineering and architectural conventions: `.agents/rules/`

## Product Principles

1. **Density with Clarity:** Present operational and financial telemetry efficiently with clear visual hierarchy, avoiding superfluous decorative elements or unnecessary whitespace.
2. **Speed in the Loop:** Entry and exit validation, barrier operations, and payment transactions must complete with minimal friction and sub-second UI responsiveness.
3. **Consistency via System:** Every UI surface must derive its components, tokens, and layout strictly from `@nivo-sass/design-system`.
4. **Resilient Dual-Scope Visibility:** The system dynamically adapts its views to whether a tenant operates one facility or a distributed network, maintaining clarity across both single-location operations and global aggregated metrics.

## Accessibility & Inclusion

- Compliance with WCAG 2.1 AA standards.
- High-contrast visual modes and keyboard navigability across all data grids, modal dialogues, and operational POS inputs.
- Semantic HTML and ARIA primitives embedded directly within design system components.
