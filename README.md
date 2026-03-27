# Nivo - Multi-Tenant SaaS Parking Management System

## 1. Executive Summary

Nivo is a proposed **multi-tenant SaaS web platform** designed for the comprehensive management of parking lots. Each parking lot owner (tenant) can manage their facilities independently, with their data securely isolated from other tenants.

The system provides a complete solution covering the entire parking lifecycle: from the initial registration and configuration of parking lots and individual spaces to real-time control of vehicle entry and exit using QR codes or physical tickets. It supports advance reservations, on-site payment processing, and the generation of digital receipts. Additionally, the platform features a powerful dashboard and reporting tools to monitor key metrics like occupancy and revenue.

Built on a scalable, cloud-based architecture, Nivo is designed for reliability and performance, offering responsive web interfaces and public APIs for third-party integrations (e.g., availability checking).

## 2. Key Features

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

## 3. Roles and Actors

The system defines several user roles to ensure proper access control (RBAC):

- **Superadministrator:** Manages tenants, global settings, and system-wide data.
- **Parking Owner:** Manages their own parking lots, configures rates, and oversees their staff (Managers, Operators).
- **Manager:** Assists the Owner with daily operations and report visualization.
- **On-site Operator:** Handles vehicle check-in/check-out and payment processing at the physical location.
- **Driver (Customer):** The end-user who searches for parking, makes reservations, and pays for services.
- **Auditor:** A read-only role for reviewing transactions and operational logs.
- **Hardware Integrator:** A technical role responsible for setting up and connecting physical devices to the system.
- **Payment Provider:** An external payment gateway service (e.g., Stripe, PayPal) integrated via API.

## 4. Architecture and Tech Stack

### Architecture

Nivo is built on a **multi-tenant SaaS model**, where a single application instance serves multiple tenants. Data isolation is achieved at the logical level using a shared database schema with a `tenant_id` discriminator in relevant tables. This approach ensures confidentiality while simplifying deployment and maintenance.

### Technology Stack

- **Backend:** Java with the Spring Boot framework.
- **Frontend:** To be defined.
- **Database:** PostgreSQL.
- **Deployment:** Cloud-based infrastructure for scalability and high availability.

## 5. Project Scope (MVP)

### In Scope:

- Multi-tenant user registration and login.
- Full management of parking lots and spaces.
- Rate configuration.
- Check-in/check-out via QR code or digital ticket.
- Advance reservations.
- Basic payment processing and transaction logging.
- Operational dashboard and key reports.
- Public API for availability.
- Integration with standard hardware.

### Out of Scope:

- Recurring subscription/payment modules.
- Loyalty programs or CRM features.
- Advanced fiscal invoicing.
- Predictive analytics.

This README provides a high-level overview of the Nivo project. For more detailed functional and non-functional requirements, please refer to the `requirements.md` document.
