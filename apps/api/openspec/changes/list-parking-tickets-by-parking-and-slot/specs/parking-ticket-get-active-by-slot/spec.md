## ADDED Requirements

### Requirement: Get active parking ticket by slot
The system MUST provide an endpoint to query the active (`OPEN`) parking ticket for a given parking slot.

#### Scenario: Slot has an active open ticket
- **WHEN** an authenticated user with role `OPERATOR` performs a `GET /tickets/active?slot={slotId}` for a slot that has an active open ticket
- **THEN** the system returns HTTP 200 OK with `Response<ParkingTicketsDTO>` containing the active ticket information and message `"Active ticket retrieved successfully"`

#### Scenario: Slot has no active open ticket
- **WHEN** an authenticated user with role `OPERATOR` performs a `GET /tickets/active?slot={slotId}` for a slot without any open ticket
- **THEN** the system returns HTTP 200 OK with `Response<ParkingTicketsDTO>` containing `null` data and message `"Active ticket retrieved successfully"`

#### Scenario: Request without valid OPERATOR role
- **WHEN** an unauthenticated user or a user without `OPERATOR` role attempts `GET /tickets/active?slot={slotId}`
- **THEN** the system denies access with HTTP 401 Unauthorized or HTTP 403 Forbidden
