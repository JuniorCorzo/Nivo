# vehicle-checkin Specification

## Purpose
Define the functional and behavioral requirements for registering incoming vehicles, allocating available parking slots, issuing active tickets, and updating slot occupancy in real time.

## Requirements

### Requirement: Vehicle Entry Registration
The system SHALL register a vehicle entry by capturing the license plate, vehicle type, and current entry timestamp, creating an active parking ticket with status `OPEN`.

#### Scenario: Successful vehicle check-in
- **GIVEN** an active parking lot with available slots for the selected vehicle type
- **WHEN** the operator submits a valid license plate and vehicle type
- **THEN** the system creates a new ticket with status `OPEN`, assigns an available slot, marks the slot as `OCCUPIED`, and returns ticket details within 3 seconds

### Requirement: Active Ticket Duplicate Prevention
The system SHALL reject check-in if a vehicle with the same license plate already has an open ticket within the parking lot.

#### Scenario: Duplicate license plate check-in attempt
- **GIVEN** an active ticket with status `OPEN` already exists for license plate "ABC-123"
- **WHEN** an operator attempts to check in license plate "ABC-123"
- **THEN** the system MUST reject the registration, return a 409 Conflict error, and leave slot allocations unchanged

### Requirement: Slot Capacity and Availability Validation
The system MUST verify slot availability for the specified vehicle type before finalizing check-in.

#### Scenario: No available slots for vehicle type
- **GIVEN** all slots for vehicle type "TRUCK" are currently `OCCUPIED` or `MAINTENANCE`
- **WHEN** the operator attempts to check in a "TRUCK"
- **THEN** the system SHALL reject the check-in with a 422 Unprocessable Entity error indicating no capacity

#### Scenario: Concurrent slot allocation race condition
- **GIVEN** a single available slot remains for a vehicle type
- **WHEN** two check-in requests compete for the same slot simultaneously
- **THEN** the system MUST serialize allocation so one check-in succeeds and the other fails or dynamically selects an alternative slot

### Requirement: Ticket Emission
Upon successful check-in, the system SHALL generate a unique ticket identifier and barcode representation for digital display or printing.

#### Scenario: Ticket generation and output
- **GIVEN** a completed check-in transaction
- **WHEN** the ticket is issued
- **THEN** the response MUST contain the ticket ID, plate number, vehicle type, assigned slot identifier, entry datetime, and scannable barcode string

### Requirement: Operator Check-in Interface
The operator UI SHALL provide a rapid check-in form supporting uppercase license plate normalization, vehicle type selection, and keyboard submission shortcuts.

#### Scenario: Rapid keyboard entry and submission
- **GIVEN** the operator is on the Check-in modal
- **WHEN** the operator types a lowercase plate string and presses Enter
- **THEN** the UI transforms the input to uppercase, submits the check-in request, displays the issued ticket preview, and refocuses the input for the next entry
