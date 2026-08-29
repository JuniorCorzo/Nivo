## Why

Operators and management systems need the ability to query parking tickets efficiently:
1. To view all parking tickets associated with a specific parking lot (for auditing, history, and monitoring occupancy).
2. To check if a specific parking slot currently has an active (`OPEN`) ticket (for real-time slot status inspection and validation during check-in/check-out workflows).

Previously, the `ParkingTicketsController` only provided operations for check-in and check-out, lacking dedicated query endpoints for parking lot-level ticket listings and slot-level active ticket resolution.

## What Changes

- **Domain Model Gateway**: Extended `ParkingTicketsRepository` with `findAllByParkingLotId(UUID parkingLotId)` and `findActiveBySlotId(UUID slotId)`.
- **Domain Use Cases**:
  - `ListParkingTicketsByParkingLotUseCase`: Queries all tickets belonging to a specific parking lot.
  - `GetActiveParkingTicketBySlotUseCase`: Retrieves the active (`OPEN`) parking ticket for a given slot.
- **JPA Driven Adapter**:
  - Added query methods in `ParkingTicketsRepositoryData`: `findAllBySlot_Parking_Id(UUID parkingLotId)` and `@Query` `findActiveBySlotId(UUID slotId)`.
  - Implemented the methods in `ParkingTicketsAdapter` mapping data entities to domain entities.
- **REST Entry Points**:
  - Added `GET /tickets/list?parking={parkingLotId}` in `ParkingTicketsController` with `@PreAuthorize("hasRole('OPERATOR')")`.
  - Added `GET /tickets/active?slot={slotId}` in `ParkingTicketsController` with `@PreAuthorize("hasRole('OPERATOR')")`.
  - Documented OpenAPI annotations with response contracts.
- **Testing**:
  - Unit tests for both use cases (`ListParkingTicketsByParkingLotUseCaseTest`, `GetActiveParkingTicketBySlotUseCaseTest`).
  - Unit tests for adapter methods in `ParkingTicketsAdapterTest`.
  - MockMvc controller unit tests in `ParkingTicketsControllerTest`.

## Capabilities

### New Capabilities
- `parking-ticket-list-by-parking-lot`: Ability for operators to retrieve all parking tickets of a given parking lot.
- `parking-ticket-get-active-by-slot`: Ability for operators to retrieve the active open ticket associated with a specific slot.

### Modified Capabilities
- None.

## Impact

- **Domain Layer**: `domain/model` and `domain/usecase` extended with new query gateways and use cases.
- **Infrastructure Driven Adapter**: `jpa-repository` updated with repository query methods and adapter implementations.
- **Infrastructure Entry Points**: `api-rest` exposed two new endpoints on `ParkingTicketsController`.
- **Security**: Both endpoints protected with role requirement `OPERATOR`.
