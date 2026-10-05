# Tasks: Slot Infrastructure Metadata Mutation & Ticket Snapshot Integrity

<!-- WORKLOAD_FORECAST_START -->
| Metric | Estimate |
|---|---|
| Total Tasks | 10 tasks |
| Complexity | Medium-High |
| Primary Scope | `apps/api` (Flyway, Domain, Entrypoint, Tests) & `apps/web` (Models, Service, Refactor, Modals, Tests) |
<!-- WORKLOAD_FORECAST_END -->

## Phase 1: Database Schema & JPA Persistence (`apps/api`)

- [ ] 1.1 **Create Flyway Migration V28**
  - Add `has_charger`, `is_accessible`, and `is_active` columns and index to `slots`.
  - Add `slot_snapshot JSONB` column to `parking_tickets`.
- [ ] 1.2 **Update JPA Entities, Projections, and Mappers**
  - Update `SlotsData` and `SlotsMappers` to support `hasCharger`, `isAccessible`, `isActive`.
  - Update `SlotSummaryData` projection interface, `SlotsRepositoryData` queries, and `SlotSummaryDataMapper` to map `hasCharger`, `isAccessible`, `isActive`.
  - Update `ParkingTicketsData` and `ParkingTicketMapper` to persist and map `slotSnapshot`.

## Phase 2: Domain Logic & Use Cases (`apps/api`)

- [ ] 2.1 **Update Domain Model & Exceptions**
  - Add `hasCharger`, `isAccessible`, `isActive` to `Slots.java`.
  - Create immutable value object `SlotSnapshot.java`.
  - Create domain exception `SlotCannotBeModifiedException.java`.
- [ ] 2.2 **Implement `UpdateSlotMetadataUseCase` with Unit Tests (TDD)**
  - Write test suite `UpdateSlotMetadataUseCaseTest` verifying atomic all-or-nothing guard for occupied slots.
  - Implement `UpdateSlotMetadataUseCase` executing batch mutation.
- [ ] 2.3 **Implement `UpdateSlotGroupUseCase` with Unit Tests (TDD)**
  - Write test suite `UpdateSlotGroupUseCaseTest` verifying group series mutation and collision guards.
  - Implement `UpdateSlotGroupUseCase`.
- [ ] 2.4 **Integrate `SlotSnapshot` in `CreateTicketUseCase`**
  - Update `CreateTicketUseCase` to snapshot slot state at ticket opening.
  - Verify via unit tests in `CreateTicketUseCaseTest`.

## Phase 3: REST API & OpenAPI Documentation (`apps/api`)

- [ ] 3.1 **Create DTOs & Endpoints in `SlotsController`**
  - Implement `PATCH /api/v1/slots/metadata` with `@Operation`, `@ApiResponse`, `@Schema`.
  - Implement `PATCH /api/v1/slots/groups` with comprehensive OpenAPI documentation.
  - Update `SlotResponse` and `SlotSummaryResponse` with `hasCharger`, `isAccessible`, `isActive` and complete OpenAPI schema metadata.
  - Update `ParkingTicketsDTO` with `slotSnapshot`.
  - Add slice tests in `SlotsControllerTest`.

## Phase 4: Frontend Web Architecture Refactor & Models (`apps/web`)

- [ ] 4.1 **Folder Structure Refactoring**
  - Reorganize `apps/web/src/app/features/slots` into `components/`, `facades/`, and `page/`.
  - Update routing in `app.routes.ts` and imports across the web application.
  - Run regression test suite (`bun run test`) ensuring 0 breakages.
- [ ] 4.2 **Update Core Models & Slot Service**
  - Update `slot.model.ts` with `hasCharger`, `isAccessible`, `isActive`.
  - Add `updateSlotMetadata` and `updateSlotGroup` methods to `SlotService` with unit tests in `slot-service.spec.ts`.

## Phase 5: UI Modals & Batch Mutation Flows (`apps/web`)

- [ ] 5.1 **Build `SlotMetadataBatchModalComponent` & Badges**
  - Add ⚡ EV and ♿ PMR badges in slot table.
  - Create batch metadata modal using `@nivo-sass/design-system` components (`nv-modal`, `nv-button`, switches).
  - Connect with `SlotsSelectionState` and `parking-slots-list.facade.ts`.
  - Add component unit tests.
- [ ] 5.2 **Build `SlotGroupEditModalComponent`**
  - Create group rename modal for zone/prefix.
  - Add component unit tests.
