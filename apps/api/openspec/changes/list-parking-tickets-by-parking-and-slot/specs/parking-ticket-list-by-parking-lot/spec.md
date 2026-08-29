## ADDED Requirements

### Requirement: List parking tickets by parking lot
The system MUST provide an endpoint to list all parking tickets associated with a specified parking lot.

#### Scenario: Successfully retrieve tickets for a parking lot
- **WHEN** an authenticated user with role `OPERATOR` performs a `GET /tickets/list?parking={parkingLotId}` with a valid parking lot ID
- **THEN** the system returns HTTP 200 OK with `Response<List<ParkingTicketsDTO>>` containing all matching tickets for that parking lot and message `"Tickets retrieved successfully"`

#### Scenario: Request without valid OPERATOR role
- **WHEN** an unauthenticated user or a user without `OPERATOR` role attempts `GET /tickets/list?parking={parkingLotId}`
- **THEN** the system denies access with HTTP 401 Unauthorized or HTTP 403 Forbidden
