# Design: Slot Infrastructure Metadata Mutation & Ticket Snapshot Integrity

## 1. Overview & Context

This design implements Linear issue **ANC-80** (Vikunja Task ID: 49) by establishing fine-grained infrastructure metadata for parking slots, atomic domain guards preventing mutation of occupied slots, and historical ticket snapshot retention. It also refactors `apps/web/src/app/features/slots` to adhere to the project conventions of isolating `components/`, `facades/`, and `page/`.

### Core Architectural Decisions
- **`vehicle_type` Immutability**: Slot vehicle type is strictly immutable post-creation to prevent discrepancies in parking lot physical capacity, rates engine mapping, and historical analytics. Converting a space requires deleting and recreating the slot.
- **Contract Separation**:
  - `PATCH /api/v1/slots/metadata`: Focuses on equipment and availability (`hasCharger`, `isAccessible`, `isActive`) for targeted slot IDs.
  - `PATCH /api/v1/slots/groups`: Focuses on topology series renaming (`zone`, `prefix`) across all slots belonging to a group.
- **Atomic All-or-Nothing Guards**: If any slot in a requested batch operation is `OCCUPIED` (or has an open parking ticket), the use case rejects the entire transaction with `SlotCannotBeModifiedException` (HTTP 409 Conflict), specifying the conflicting slot identifiers and numbers.
- **JSONB Snapshot for Tickets**: `parking_tickets.slot_snapshot` captures the exact slot state at check-in time (`slotNumber`, `zone`, `prefix`, `type`, `hasCharger`, `isAccessible`), ensuring immutability against subsequent slot changes without database schema bloat.

---

## 2. Database Schema (Flyway Migration V28)

Location: `apps/api/src/main/resources/db/migration/V28__add_slot_metadata_and_ticket_snapshot.sql`

```sql
-- 1. Add equipment metadata and soft-status flags to slots
ALTER TABLE slots
  ADD COLUMN has_charger BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN is_accessible BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT TRUE;

CREATE INDEX idx_slots_parking_metadata
  ON slots (parking_id, is_active, has_charger, is_accessible);

-- 2. Add historical snapshot JSONB to parking tickets
ALTER TABLE parking_tickets
  ADD COLUMN slot_snapshot JSONB NULL;

COMMENT ON COLUMN parking_tickets.slot_snapshot IS
  'Immutable JSON snapshot of slot attributes at vehicle entry time';
```

---

## 3. Domain Model (`apps/api`)

### 3.1 Entity Updates: `Slots`
File: `dev.angelcorzo.nivo.domain.model.slots.Slots`
- Added properties:
  - `boolean hasCharger`
  - `boolean isAccessible`
  - `boolean isActive`
- Preserved existing invariants and builder methods.

### 3.2 Value Object: `SlotSnapshot`
File: `dev.angelcorzo.nivo.domain.model.parkingtickets.valueobjects.SlotSnapshot`
- Record containing:
  - `UUID id`
  - `String slotNumber`
  - `String zone`
  - `String prefix`
  - `SlotType type`
  - `boolean hasCharger`
  - `boolean isAccessible`
- Factory method: `SlotSnapshot.from(Slots slot)`

### 3.3 Domain Exception: `SlotCannotBeModifiedException`
File: `dev.angelcorzo.nivo.domain.model.slots.excetions.SlotCannotBeModifiedException`
- Extends standard runtime domain exception.
- Carries: `List<ConflictingSlot> conflictingSlots` (with ID and slotNumber).
- Mapped in REST exception handler to HTTP 409 Conflict with standard problem detail.

---

## 4. Domain Use Cases (`apps/api`)

### 4.1 `UpdateSlotMetadataUseCase`
- Location: `dev.angelcorzo.nivo.domain.usecase.slot.UpdateSlotMetadataUseCase`
- Command:
  ```java
  // Tenant is resolved internally via injected AuthenticationContextGateway
  public record UpdateSlotMetadataCommand(
      List<UUID> slotIds,
      Boolean hasCharger,
      Boolean isAccessible,
      Boolean isActive
  ) {}
  ```
- Workflow:
  1. Resolve `tenant` from `authenticationContext.getCurrentTenant()`, then query slots matching `slotIds` and `tenant`. If any ID is missing, throw `SlotNotFoundException`.
  2. Guard Check: For each slot, verify `status == SlotStatus.AVAILABLE` (and no active ticket exists).
  3. If one or more slots are `OCCUPIED`: throw `SlotCannotBeModifiedException(conflicts)`.
  4. For each slot, apply partial updates using `toBuilder()`:
     - `hasCharger` if non-null
     - `isAccessible` if non-null
     - `isActive` if non-null
  5. Save batch via `slotsRepository.saveAll(updatedSlots)`.
  6. Return updated list of `Slots`.

### 4.2 `UpdateSlotGroupUseCase`
- Location: `dev.angelcorzo.nivo.domain.usecase.slot.UpdateSlotGroupUseCase`
- Command:
  ```java
  // Tenant is resolved internally via injected AuthenticationContextGateway
  public record UpdateSlotGroupCommand(
      UUID parkingId,
      String currentZone,
      String currentPrefix,
      String newZone,
      String newPrefix
  ) {}
  ```
- Workflow:
  1. Resolve `tenant` from `authenticationContext.getCurrentTenant()`, then query all slots matching `(parkingId, currentZone, currentPrefix)` under `tenant`.
  2. Guard Check: Verify 100% of slots in group have `status == SlotStatus.AVAILABLE`.
  3. Validate that target `(parkingId, newZone, newPrefix)` does not collide with existing slots unless identical.
  4. Mutate `zone` and `prefix`. If `newPrefix` changed, regenerate `slotNumber`.
  5. Save batch and return summary.

### 4.3 Ticket Issuance Integration (`CreateTicketUseCase`)
- Capture `SlotSnapshot.from(slot)` upon ticket creation.
- Persist `ParkingTickets.slotSnapshot` alongside ticket entity.

---

## 5. REST Entry Points & OpenAPI (`apps/api`)

Controller: `dev.angelcorzo.nivo.infrastructure.entrypoint.rest.slot.controller.SlotsController`

### 5.1 `PATCH /api/v1/slots/metadata`
- **Operation**: `updateSlotMetadata`
- **Annotations**:
  - `@Operation(summary = "Batch update equipment metadata for selected slots")`
  - `@ApiResponse(responseCode = "200", description = "Slots metadata updated successfully")`
  - `@ApiResponse(responseCode = "404", description = "One or more slots not found")`
  - `@ApiResponse(responseCode = "409", description = "One or more slots are occupied and cannot be modified")`
- **Request DTO**: `UpdateSlotMetadataRequest`
  - `List<UUID> slotIds` (required)
  - `Boolean hasCharger` (optional)
  - `Boolean isAccessible` (optional)
  - `Boolean isActive` (optional)
- **Response DTO**: `List<SlotResponse>` (updated with `hasCharger`, `isAccessible`, `isActive`)

### 5.2 `PATCH /api/v1/slots/groups`
- **Operation**: `updateSlotGroup`
- **Annotations**:
  - `@Operation(summary = "Rename zone and/or prefix for an entire slot family")`
  - `@ApiResponse(responseCode = "200", description = "Slot group renamed successfully")`
  - `@ApiResponse(responseCode = "409", description = "Group contains occupied slots or target group exists")`
- **Request DTO**: `UpdateSlotGroupRequest`
  - `UUID parkingId` (required)
  - `String currentZone` (required)
  - `String currentPrefix` (required)
  - `String newZone` (optional)
  - `String newPrefix` (optional)

### 5.3 Updated Response DTOs & Projections (OpenAPI & JPA)
1. **`SlotResponse`**:
   - Added fields: `boolean hasCharger`, `boolean isAccessible`, `boolean isActive`.
   - Updated `@Schema` annotations with descriptions, required modes, and OpenAPI examples.
2. **`SlotSummaryResponse` & `SlotSummary` (Domain Value Object)**:
   - Added fields: `boolean hasCharger`, `boolean isAccessible`, `boolean isActive`.
   - Used directly by `GET /slots/list/summary` to feed the web table with EV/PMR badges and operational status.
3. **`SlotSummaryData` (JPA projection interface)** & `SlotSummaryDataMapper`:
   - Updated SQL select/projection in `SlotsRepositoryData` to fetch `s.has_charger`, `s.is_accessible`, `s.is_active`.
   - Mapped to domain `SlotSummary` and REST `SlotSummaryResponse`.

---

## 6. Frontend Architecture & Folder Refactoring (`apps/web`)

### 6.1 Folder Structure Standard
Restructure `apps/web/src/app/features/slots` to match project conventions:
```
apps/web/src/app/features/slots/
├── components/
│   ├── parking-slot-table/              # Presentational table
│   ├── slot-delete-modal/               # Single/Group delete modal
│   ├── slot-detail-drawer/              # Slot detail drawer
│   ├── slot-metadata-batch-modal/       # NEW: Batch equipment editor modal
│   └── slot-group-edit-modal/           # NEW: Group rename modal
├── facades/
│   ├── parking-slots-list.facade.ts     # Extracted list state facade
│   └── parking-slot-form.facade.ts      # Extracted form state facade
├── page/
│   ├── parking-slots-list/              # Routed smart list container
│   └── parking-slot-form/               # Routed smart form container
└── shared/
    └── constants/
```

### 6.2 Service & Model Extensions
- `apps/web/src/app/core/models/slot.model.ts`:
  - `Slot` & `SlotSummary` extended with `hasCharger: boolean`, `isAccessible: boolean`, `isActive: boolean`.
- `apps/web/src/app/core/services/slot-service.ts`:
  - Methods: `updateSlotMetadata(...)` and `updateSlotGroup(...)`.

### 6.3 UI Components & Reusability
- Use Design System components (`@nivo-sass/design-system`):
  - `nv-badge` for EV charger ⚡ and PMR accessibility ♿.
  - `nv-modal`, `nv-button`, and form toggles for batch modals.
- Reuse `SlotsSelectionState` directly for multi-slot action triggering.
