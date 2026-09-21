# Proposal: Slot Infrastructure Metadata Mutation & Ticket Snapshot Integrity

## Goal
Enable batch mutation of infrastructure equipment metadata (`hasCharger`, `isAccessible`, `isActive`) and group-level attributes (`zone`, `prefix`) on parking slots under atomic domain guards, preserve ticket historical integrity through an immutable `slot_snapshot` JSONB audit log, and standardize the Angular `features/slots` directory architecture into `components/`, `facades/`, and `page/`.

## Motivation & Rationale
Currently, parking slot models in Nivo lack dedicated infrastructure attributes required to distinguish EV charging stations, accessible spaces for reduced mobility (PMR), and maintenance-disabled slots. Furthermore, any subsequent update to slot topology risks corrupting financial and operational reporting of historical parking tickets because tickets reference mutable slot records via foreign key without capturing a state snapshot. Additionally, the existing `apps/web/src/app/features/slots` directory conflates page-level smart routing, presentational components, and state facades within a single `components/` folder, violating the architectural conventions established across `features/parking` and `features/operations`.

This change resolves these gaps by:
1. Adding `has_charger`, `is_accessible`, and `is_active` flags to the `slots` schema, keeping `vehicle_type` strictly immutable post-creation.
2. Introducing two orthogonal batch API contracts: `PATCH /api/v1/slots/metadata` for individual or multi-selected equipment toggles, and `PATCH /api/v1/slots/groups` for structural zone/prefix series mutations.
3. Enforcing an atomic all-or-nothing domain guard: if any targeted slot is `OCCUPIED` (or has an active ticket), the transaction aborts with HTTP 409 Conflict.
4. Preserving historical consistency by saving an immutable `slot_snapshot JSONB` upon ticket issuance during vehicle check-in.
5. Reorganizing `apps/web/src/app/features/slots` into clean `components/`, `facades/`, and `page/` layers while maximizing code reuse from existing selection states and design system components.
