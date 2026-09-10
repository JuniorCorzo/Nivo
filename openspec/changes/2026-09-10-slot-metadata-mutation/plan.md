# Slot Infrastructure Metadata Mutation & Ticket Snapshot Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement batch mutation of infrastructure equipment metadata (`hasCharger`, `isAccessible`, `isActive`) and group-level attributes (`zone`, `prefix`) on parking slots under atomic domain guards, preserve ticket historical integrity through an immutable `slot_snapshot` JSONB audit log, and refactor Angular `features/slots` into `components/`, `facades/`, and `page/`.

**Architecture:** Clean Architecture in Spring Boot `apps/api` with hexagonal separation, Flyway PostgreSQL migrations, atomic all-or-nothing domain guards, and OpenAPI generation. Reactive Angular 19+ in `apps/web` with Signal architecture, Design System components (`@nivo-sass/design-system`), and separated container/presentational layers.

**Tech Stack:** Java 21, Spring Boot 3, Flyway, PostgreSQL (JSONB), JUnit 5, Mockito, AssertJ, TypeScript 5, Angular 19, Vitest, Ultracite.

**Spec:** `openspec/changes/2026-09-10-slot-metadata-mutation/design.md`

## Global Constraints

- Conventional Commits: Use scopes `api(domain)`, `api(usecase)`, `api(adapter)`, `api(entry-point)`, `api(db)`, `web(slots)`, `web(models)`, `web(services)`.
- Caveman Mode Ultra: dense, telegraphic, zero fluff in reasoning.
- All shell commands MUST be prefixed with `rtk` (e.g. `rtk mvn test`, `rtk bun test`).
- Test-Driven Development: Tests MUST be written and verified failing before implementation.
- All-or-Nothing guard: If any slot in a batch request is not `AVAILABLE` / `VACANT`, reject with 409 Conflict.
- Code Writer delegation: Subagent-driven development enforces dedicated delegation.
- Design System Mandate: Use `@nivo-sass/design-system` components in `apps/web` (`nv-badge`, `nv-button`, `nv-modal`, `nv-input`, etc.).

---

### Task 1: Database Schema Migration & JPA Persistence (`apps/api`)

**Files:**
- Create: `apps/api/src/main/resources/db/migration/V28__add_slot_metadata_and_ticket_snapshot.sql`
- Modify: `apps/api/src/main/java/dev/angelcorzo/nivo/infrastructure/adapter/jpa/slot/SlotsData.java`
- Modify: `apps/api/src/main/java/dev/angelcorzo/nivo/infrastructure/adapter/jpa/slot/mappers/SlotsMappers.java`
- Modify: `apps/api/src/main/java/dev/angelcorzo/nivo/infrastructure/adapter/jpa/slot/SlotSummaryData.java`
- Modify: `apps/api/src/main/java/dev/angelcorzo/nivo/infrastructure/adapter/jpa/slot/mappers/SlotSummaryDataMapper.java`
- Modify: `apps/api/src/main/java/dev/angelcorzo/nivo/infrastructure/adapter/jpa/slot/SlotsRepositoryData.java`
- Modify: `apps/api/src/main/java/dev/angelcorzo/nivo/infrastructure/adapter/jpa/parkingtickets/ParkingTicketsData.java`
- Modify: `apps/api/src/main/java/dev/angelcorzo/nivo/infrastructure/adapter/jpa/parkingtickets/mappers/ParkingTicketMapper.java`
- Test: `apps/api/src/test/java/dev/angelcorzo/nivo/infrastructure/adapter/jpa/slot/SlotsRepositoryAdapterTest.java`

**Interfaces:**
- Consumes: PostgreSQL schema V27.
- Produces: `has_charger`, `is_accessible`, `is_active` in `slots` table; `slot_snapshot JSONB` in `parking_tickets`.

- [ ] **Step 1: Write Flyway migration V28**
Create `V28__add_slot_metadata_and_ticket_snapshot.sql`:
```sql
ALTER TABLE slots
  ADD COLUMN has_charger BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN is_accessible BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT TRUE;

CREATE INDEX idx_slots_parking_metadata
  ON slots (parking_id, is_active, has_charger, is_accessible);

ALTER TABLE parking_tickets
  ADD COLUMN slot_snapshot JSONB NULL;

COMMENT ON COLUMN parking_tickets.slot_snapshot IS
  'Immutable JSON snapshot of slot attributes at vehicle entry time';
```

- [ ] **Step 2: Update JPA Entities and Projections**
In `SlotsData.java`:
Add columns:
```java
@Column(name = "has_charger", nullable = false)
@Builder.Default
private Boolean hasCharger = false;

@Column(name = "is_accessible", nullable = false)
@Builder.Default
private Boolean isAccessible = false;

@Column(name = "is_active", nullable = false)
@Builder.Default
private Boolean isActive = true;
```

In `SlotSummaryData.java`:
```java
Boolean getHasCharger();
Boolean getIsAccessible();
Boolean getIsActive();
```

In `SlotsRepositoryData.java`:
Update native/JPQL query to project `s.has_charger AS hasCharger`, `s.is_accessible AS isAccessible`, `s.is_active AS isActive`.

In `ParkingTicketsData.java`:
```java
@Column(name = "slot_snapshot", columnDefinition = "jsonb")
@org.hibernate.annotations.JdbcTypeCode(org.hibernate.type.SqlTypes.JSON)
private String slotSnapshot;
```

- [ ] **Step 3: Update Mappers**
In `SlotsMappers.java` and `SlotSummaryDataMapper.java`:
Map `hasCharger`, `isAccessible`, `isActive` between entities, projection and domain models.
In `ParkingTicketMapper.java`:
Map `slotSnapshot` string/JSON to `ParkingTickets.slotSnapshot`.

- [ ] **Step 4: Run database tests and verify**
Run: `rtk ./mvnw test -pl apps/api -Dtest=SlotsRepositoryAdapterTest`
Expected: PASS

- [ ] **Step 5: Commit**
```bash
rtk git add apps/api/src/main/resources/db/migration/V28__add_slot_metadata_and_ticket_snapshot.sql apps/api/src/main/java/dev/angelcorzo/nivo/infrastructure/adapter/jpa/
rtk git commit -m "feat(api): add slot metadata and ticket snapshot persistence (ANC-80)"
```

---

### Task 2: Domain Model, Value Objects & Exceptions (`apps/api`)

**Files:**
- Modify: `apps/api/src/main/java/dev/angelcorzo/nivo/domain/model/slots/Slots.java`
- Modify: `apps/api/src/main/java/dev/angelcorzo/nivo/domain/model/slots/valueobject/SlotSummary.java`
- Modify: `apps/api/src/main/java/dev/angelcorzo/nivo/domain/model/parkingtickets/ParkingTickets.java`
- Create: `apps/api/src/main/java/dev/angelcorzo/nivo/domain/model/parkingtickets/valueobjects/SlotSnapshot.java`
- Create: `apps/api/src/main/java/dev/angelcorzo/nivo/domain/model/slots/excetions/SlotCannotBeModifiedException.java`

**Interfaces:**
- Consumes: Existing domain enums `SlotType`, `SlotStatus`.
- Produces: `Slots.hasCharger`, `Slots.isAccessible`, `Slots.isActive`, `SlotSnapshot`, `SlotCannotBeModifiedException`.

- [ ] **Step 1: Write Domain Models and Value Objects**
Update `Slots.java`:
```java
@Builder.Default
private boolean hasCharger = false;
@Builder.Default
private boolean isAccessible = false;
@Builder.Default
private boolean isActive = true;
```

Update `SlotSummary.java`:
```java
public record SlotSummary(
    UUID id,
    String parkingName,
    SlotType type,
    String prefix,
    String zone,
    String numberSlot,
    SlotStatus status,
    boolean hasTicket,
    boolean hasHistory,
    boolean hasCharger,
    boolean isAccessible,
    boolean isActive
) {}
```

Create `SlotSnapshot.java`:
```java
package dev.angelcorzo.nivo.domain.model.parkingtickets.valueobjects;

import dev.angelcorzo.nivo.domain.model.slots.Slots;
import dev.angelcorzo.nivo.domain.model.slots.enums.SlotType;
import java.util.UUID;
import lombok.Builder;

@Builder(toBuilder = true)
public record SlotSnapshot(
    UUID id,
    String slotNumber,
    String zone,
    String prefix,
    SlotType type,
    boolean hasCharger,
    boolean isAccessible
) {
  public static SlotSnapshot from(Slots slot) {
    return new SlotSnapshot(
        slot.getId(),
        slot.getSlotNumber(),
        slot.getZone(),
        slot.getPrefix(),
        slot.getType(),
        slot.isHasCharger(),
        slot.isAccessible()
    );
  }
}
```

Update `ParkingTickets.java`:
```java
private SlotSnapshot slotSnapshot;
```

Create `SlotCannotBeModifiedException.java`:
```java
package dev.angelcorzo.nivo.domain.model.slots.excetions;

import java.util.List;
import java.util.UUID;

public class SlotCannotBeModifiedException extends RuntimeException {
  private final List<UUID> conflictingSlotIds;

  public SlotCannotBeModifiedException(List<UUID> conflictingSlotIds) {
    super("Slots cannot be modified because one or more are not available: " + conflictingSlotIds);
    this.conflictingSlotIds = conflictingSlotIds;
  }

  public List<UUID> getConflictingSlotIds() {
    return conflictingSlotIds;
  }
}
```

- [ ] **Step 2: Commit**
```bash
rtk git add apps/api/src/main/java/dev/angelcorzo/nivo/domain/model/
rtk git commit -m "feat(domain): add slot equipment metadata, snapshot VO, and domain exceptions (ANC-80)"
```

---

### Task 3: `UpdateSlotMetadataUseCase` with Strict TDD (`apps/api`)

**Files:**
- Create: `apps/api/src/test/java/dev/angelcorzo/nivo/domain/usecase/slot/UpdateSlotMetadataUseCaseTest.java`
- Create: `apps/api/src/main/java/dev/angelcorzo/nivo/domain/usecase/slot/UpdateSlotMetadataUseCase.java`

**Interfaces:**
- Consumes: `SlotsRepository`, `AuthenticationContextGateway`.
- Produces: `UpdateSlotMetadataUseCase.execute(UpdateSlotMetadataCommand)`.

- [ ] **Step 1: Write failing unit test**
Create `UpdateSlotMetadataUseCaseTest.java`:
Verify:
1. `shouldUpdateMetadataWhenAllSlotsAvailable`: returns updated slots with new flags.
2. `shouldFailAtomicallyWhenAnySlotOccupied`: throws `SlotCannotBeModifiedException` and does not persist any slot.
3. `shouldPreserveExistingValuesWhenFieldsNull`: partial update maintains untouched fields.

- [ ] **Step 2: Run test to verify it fails**
Run: `rtk ./mvnw test -pl apps/api -Dtest=UpdateSlotMetadataUseCaseTest`
Expected: FAIL (class not found / compilation error).

- [ ] **Step 3: Implement `UpdateSlotMetadataUseCase`**
```java
package dev.angelcorzo.nivo.domain.usecase.slot;

import dev.angelcorzo.nivo.domain.model.authentication.gateway.AuthenticationContextGateway;
import dev.angelcorzo.nivo.domain.model.slots.Slots;
import dev.angelcorzo.nivo.domain.model.slots.enums.SlotStatus;
import dev.angelcorzo.nivo.domain.model.slots.excetions.SlotCannotBeModifiedException;
import dev.angelcorzo.nivo.domain.model.slots.excetions.SlotNotFoundException;
import dev.angelcorzo.nivo.domain.model.slots.gateways.SlotsRepository;
import dev.angelcorzo.nivo.domain.model.tenants.Tenants;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import lombok.Builder;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public class UpdateSlotMetadataUseCase {
  private final SlotsRepository slotsRepository;
  private final AuthenticationContextGateway authenticationContext;

  public List<Slots> execute(UpdateSlotMetadataCommand command) {
    final Tenants tenant = this.authenticationContext.getCurrentTenant();
    final List<Slots> slots = this.slotsRepository.findAllById(command.slotIds());

    if (slots.size() != command.slotIds().size()) {
      throw new SlotNotFoundException(command.slotIds().get(0));
    }

    final List<UUID> conflictingIds = slots.stream()
        .filter(s -> s.getStatus() != SlotStatus.AVAILABLE)
        .map(Slots::getId)
        .toList();

    if (!conflictingIds.isEmpty()) {
      throw new SlotCannotBeModifiedException(conflictingIds);
    }

    final List<Slots> updatedSlots = slots.stream()
        .map(s -> {
          Slots.SlotsBuilder builder = s.toBuilder();
          if (command.hasCharger() != null) builder.hasCharger(command.hasCharger());
          if (command.isAccessible() != null) builder.isAccessible(command.isAccessible());
          if (command.isActive() != null) builder.isActive(command.isActive());
          return builder.build();
        })
        .toList();

    return this.slotsRepository.saveAll(updatedSlots);
  }

  @Builder(toBuilder = true)
  public record UpdateSlotMetadataCommand(
      List<UUID> slotIds,
      Boolean hasCharger,
      Boolean isAccessible,
      Boolean isActive
  ) {}
}
```

- [ ] **Step 4: Run test to verify it passes**
Run: `rtk ./mvnw test -pl apps/api -Dtest=UpdateSlotMetadataUseCaseTest`
Expected: PASS

- [ ] **Step 5: Commit**
```bash
rtk git add apps/api/src/main/java/dev/angelcorzo/nivo/domain/usecase/slot/UpdateSlotMetadataUseCase.java apps/api/src/test/java/dev/angelcorzo/nivo/domain/usecase/slot/UpdateSlotMetadataUseCaseTest.java
rtk git commit -m "feat(usecase): implement UpdateSlotMetadataUseCase with atomic vacant guard (ANC-80)"
```

---

### Task 4: `UpdateSlotGroupUseCase` with Strict TDD (`apps/api`)

**Files:**
- Create: `apps/api/src/test/java/dev/angelcorzo/nivo/domain/usecase/slot/UpdateSlotGroupUseCaseTest.java`
- Create: `apps/api/src/main/java/dev/angelcorzo/nivo/domain/usecase/slot/UpdateSlotGroupUseCase.java`

**Interfaces:**
- Consumes: `SlotsRepository`, `AuthenticationContextGateway`.
- Produces: `UpdateSlotGroupUseCase.execute(UpdateSlotGroupCommand)`.

- [ ] **Step 1: Write failing unit test**
Create `UpdateSlotGroupUseCaseTest.java`:
Verify:
1. `shouldRenameGroupWhenAllSlotsAvailable`: updates `zone` and `prefix` across all group slots.
2. `shouldFailWhenAnyGroupSlotOccupied`: throws `SlotCannotBeModifiedException` if 1 slot in group is OCCUPIED.
3. `shouldRecalculateSlotNumberWhenPrefixChanges`: updates numbering prefix consistently.

- [ ] **Step 2: Run test to verify it fails**
Run: `rtk ./mvnw test -pl apps/api -Dtest=UpdateSlotGroupUseCaseTest`
Expected: FAIL.

- [ ] **Step 3: Implement `UpdateSlotGroupUseCase`**
Implement use case with atomic validation on entire group, prefix replacement, and batch persistence.

- [ ] **Step 4: Run test to verify it passes**
Run: `rtk ./mvnw test -pl apps/api -Dtest=UpdateSlotGroupUseCaseTest`
Expected: PASS.

- [ ] **Step 5: Commit**
```bash
rtk git add apps/api/src/main/java/dev/angelcorzo/nivo/domain/usecase/slot/UpdateSlotGroupUseCase.java apps/api/src/test/java/dev/angelcorzo/nivo/domain/usecase/slot/UpdateSlotGroupUseCaseTest.java
rtk git commit -m "feat(usecase): implement UpdateSlotGroupUseCase with series rename and vacant guard (ANC-80)"
```

---

### Task 5: `CreateTicketUseCase` Snapshot Capture with TDD (`apps/api`)

**Files:**
- Modify: `apps/api/src/main/java/dev/angelcorzo/nivo/domain/usecase/ticket/CreateTicketUseCase.java`
- Test: `apps/api/src/test/java/dev/angelcorzo/nivo/domain/usecase/ticket/CreateTicketUseCaseTest.java`

- [ ] **Step 1: Write test assertion verifying `slotSnapshot` on ticket creation**
- [ ] **Step 2: Run test to verify failure**
- [ ] **Step 3: Implement `SlotSnapshot.from(slot)` capture into ticket**
- [ ] **Step 4: Run test to verify PASS**
- [ ] **Step 5: Commit**
```bash
rtk git add apps/api/src/main/java/dev/angelcorzo/nivo/domain/usecase/ticket/ apps/api/src/test/java/dev/angelcorzo/nivo/domain/usecase/ticket/
rtk git commit -m "feat(usecase): capture immutable slot snapshot on ticket creation (ANC-80)"
```

---

### Task 6: REST Controller, DTOs & OpenAPI Documentation (`apps/api`)

**Files:**
- Create: `apps/api/src/main/java/dev/angelcorzo/nivo/infrastructure/entrypoint/rest/slot/dto/UpdateSlotMetadataRequest.java`
- Create: `apps/api/src/main/java/dev/angelcorzo/nivo/infrastructure/entrypoint/rest/slot/dto/UpdateSlotGroupRequest.java`
- Modify: `apps/api/src/main/java/dev/angelcorzo/nivo/infrastructure/entrypoint/rest/slot/dto/SlotResponse.java`
- Modify: `apps/api/src/main/java/dev/angelcorzo/nivo/infrastructure/entrypoint/rest/slot/dto/SlotSummaryResponse.java`
- Modify: `apps/api/src/main/java/dev/angelcorzo/nivo/infrastructure/entrypoint/rest/slot/mappers/SlotsMapper.java`
- Modify: `apps/api/src/main/java/dev/angelcorzo/nivo/infrastructure/entrypoint/rest/slot/controller/SlotsController.java`
- Test: `apps/api/src/test/java/dev/angelcorzo/nivo/infrastructure/entrypoint/rest/slot/controller/SlotsControllerTest.java`

- [ ] **Step 1: Create Request and Response DTOs with OpenAPI annotations**
Define `UpdateSlotMetadataRequest` and `UpdateSlotGroupRequest`.
Add `hasCharger`, `isAccessible`, `isActive` to `SlotResponse` and `SlotSummaryResponse` with `@Schema`.

- [ ] **Step 2: Add Endpoints in `SlotsController`**
Add:
- `PATCH /slots/metadata`
- `PATCH /slots/groups`
Annotate with `@Operation`, `@ApiResponse(200, 404, 409)`.

- [ ] **Step 3: Write controller tests**
Verify HTTP 200 on success and HTTP 409 when `SlotCannotBeModifiedException` is thrown.

- [ ] **Step 4: Run controller test suite**
Run: `rtk ./mvnw test -pl apps/api -Dtest=SlotsControllerTest`
Expected: PASS.

- [ ] **Step 5: Commit**
```bash
rtk git add apps/api/src/main/java/dev/angelcorzo/nivo/infrastructure/entrypoint/rest/slot/
rtk git commit -m "feat(entry-point): expose slot metadata and group mutation endpoints (ANC-80)"
```

---

### Task 7: Frontend Web Directory Architecture Refactoring (`apps/web`)

**Files:**
- Move: `apps/web/src/app/features/slots/components/parking-slots-list/` -> `apps/web/src/app/features/slots/page/parking-slots-list/`
- Move: `apps/web/src/app/features/slots/components/parking-slot-form/` -> `apps/web/src/app/features/slots/page/parking-slot-form/`
- Move: Facades to `apps/web/src/app/features/slots/facades/`
- Modify: `apps/web/src/app/app.routes.ts`

- [ ] **Step 1: Relocate directories to clean `components/`, `facades/`, `page/` structure**
- [ ] **Step 2: Update router configuration and imports**
- [ ] **Step 3: Run Vitest test runner across web app**
Run: `rtk bun run --cwd apps/web test`
Expected: All existing tests pass without regressions.

- [ ] **Step 4: Commit**
```bash
rtk git add apps/web/src/app/features/slots/ apps/web/src/app/app.routes.ts
rtk git commit -m "refactor(web): reorganize slots feature into components, facades, and page (ANC-80)"
```

---

### Task 8: Frontend Web Models & SlotService Extension (`apps/web`)

**Files:**
- Modify: `apps/web/src/app/core/models/slot.model.ts`
- Modify: `apps/web/src/app/core/services/slot-service.ts`
- Test: `apps/web/src/app/core/services/slot-service.spec.ts`

- [ ] **Step 1: Update Slot models**
Add `hasCharger: boolean`, `isAccessible: boolean`, `isActive: boolean` to `Slot` and `SlotSummary`.

- [ ] **Step 2: Add API methods to `SlotService`**
Add:
- `updateSlotMetadata(payload: { slotIds: string[], hasCharger?: boolean, isAccessible?: boolean, isActive?: boolean })`
- `updateSlotGroup(payload: { parkingId: string, currentZone: string, currentPrefix: string, newZone?: string, newPrefix?: string })`

- [ ] **Step 3: Write tests in `slot-service.spec.ts`**
- [ ] **Step 4: Run tests**
Run: `rtk bun run --cwd apps/web test`
Expected: PASS.

- [ ] **Step 5: Commit**
```bash
rtk git add apps/web/src/app/core/models/slot.model.ts apps/web/src/app/core/services/slot-service*
rtk git commit -m "feat(web): add slot metadata models and service operations (ANC-80)"
```

---

### Task 9: Frontend Badges & Multi-Selection Batch Metadata Modal (`apps/web`)

**Files:**
- Create: `apps/web/src/app/features/slots/components/slot-metadata-batch-modal/slot-metadata-batch-modal.component.ts`
- Create: `apps/web/src/app/features/slots/components/slot-metadata-batch-modal/slot-metadata-batch-modal.component.html`
- Create: `apps/web/src/app/features/slots/components/slot-metadata-batch-modal/slot-metadata-batch-modal.component.spec.ts`
- Modify: `apps/web/src/app/features/slots/page/parking-slots-list/parking-slots-list.html`
- Modify: `apps/web/src/app/features/slots/page/parking-slots-list/parking-slots-list.ts`

- [ ] **Step 1: Write component unit test for batch modal**
- [ ] **Step 2: Implement batch modal using `@nivo-sass/design-system` (`nv-modal`, `nv-button`, switches)**
- [ ] **Step 3: Add EV ⚡ and PMR ♿ badges to slot table**
- [ ] **Step 4: Integrate with `SlotsSelectionState`**
- [ ] **Step 5: Run tests and verify**
Run: `rtk bun run --cwd apps/web test`
Expected: PASS.

- [ ] **Step 6: Commit**
```bash
rtk git add apps/web/src/app/features/slots/
rtk git commit -m "feat(web): add slot metadata batch modal and EV/PMR badges (ANC-80)"
```

---

### Task 10: Frontend Slot Group Edit Modal (`apps/web`)

**Files:**
- Create: `apps/web/src/app/features/slots/components/slot-group-edit-modal/slot-group-edit-modal.component.ts`
- Create: `apps/web/src/app/features/slots/components/slot-group-edit-modal/slot-group-edit-modal.component.html`
- Create: `apps/web/src/app/features/slots/components/slot-group-edit-modal/slot-group-edit-modal.component.spec.ts`
- Modify: `apps/web/src/app/features/slots/facades/parking-slots-list.facade.ts`

- [ ] **Step 1: Write component unit tests for group edit modal**
- [ ] **Step 2: Implement group rename modal with `nv-input` and confirmation prompt**
- [ ] **Step 3: Connect to `parking-slots-list.facade.ts`**
- [ ] **Step 4: Run all unit tests and linter**
Run: `rtk bun run --cwd apps/web check` and `rtk bun run --cwd apps/web test`
Expected: Clean check, all tests passing.

- [ ] **Step 5: Commit**
```bash
rtk git add apps/web/src/app/features/slots/
rtk git commit -m "feat(web): add slot group edit modal and facade integration (ANC-80)"
```
