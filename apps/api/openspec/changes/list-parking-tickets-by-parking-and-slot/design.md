## Context

The Nivo API manages parking operations including slots, rates, vehicles, and parking tickets. Operators managing lots need real-time visibility into tickets per parking lot and active ticket status per slot.

## Goals / Non-Goals

**Goals:**
- Provide an endpoint to list all parking tickets for a given parking lot (`GET /tickets/list?parking={parkingLotId}`).
- Provide an endpoint to retrieve the active open parking ticket for a given slot (`GET /tickets/active?slot={slotId}`).
- Secure both endpoints requiring the `OPERATOR` role.
- Maintain Clean Architecture layers: domain isolation, driven JPA adapters, and Spring REST entry points.

**Non-Goals:**
- Pagination / infinite scrolling for tickets in this initial iteration.
- Modifying ticket creation or checkout workflows.

## Decisions

### Domain Layer
- Gateway: `ParkingTicketsRepository`
  - `List<ParkingTickets> findAllByParkingLotId(UUID parkingLotId);`
  - `Optional<ParkingTickets> findActiveBySlotId(UUID slotId);`
- Use Cases:
  - `ListParkingTicketsByParkingLotUseCase`
  - `GetActiveParkingTicketBySlotUseCase`

### Driven Adapter (JPA)
- In `ParkingTicketsRepositoryData`:
  - `findAllBySlot_Parking_Id(UUID parkingLotId)` navigates `slot -> parking -> id`.
  - `@Query("SELECT p FROM ParkingTicketsData p WHERE p.slot.id = ?1 AND p.status = 'OPEN'") Optional<ParkingTicketsData> findActiveBySlotId(UUID slotId);`
- In `ParkingTicketsAdapter`:
  - Maps JPA entities to domain entities via `super::toEntity`.

### Entry Points (REST API)
- Controller: `ParkingTicketsController`
  - `@GetMapping("/list")` with `@RequestParam("parking") UUID parkingLotId`
  - `@GetMapping("/active")` with `@RequestParam("slot") UUID slotId`
- Security: `@PreAuthorize("hasRole('OPERATOR')")` on both endpoints.
- Response Envelope: `Response<List<ParkingTicketsDTO>>` and `Response<ParkingTicketsDTO>`.
