# vehicle-checkout Specification

## Purpose
Define functional and behavioral requirements for processing zero-payment vehicle departures, validating departure eligibility under grace period or exemption rules, closing tickets, and releasing parking slots.

## Requirements

### Requirement: Ticket Lookup for Departure
The system SHALL retrieve active ticket details using either a scannable ticket barcode/code or the vehicle license plate.

#### Scenario: Successful ticket lookup by barcode
- **GIVEN** an open parking ticket exists with code "TCK-98765"
- **WHEN** the operator scans barcode "TCK-98765"
- **THEN** the system retrieves the ticket, vehicle metadata, entry time, and calculated elapsed duration

#### Scenario: Ticket not found
- **GIVEN** no open ticket exists with code "TCK-00000"
- **WHEN** the operator searches for "TCK-00000"
- **THEN** the system SHALL return a 404 Not Found error and notify the operator

### Requirement: Zero-Payment Eligibility Validation
The system MUST validate that a departing vehicle qualifies for zero-payment clearance (e.g., within grace period, authorized exemption, or 100% complimentary voucher) before permitting zero-cost check-out.

#### Scenario: Departure within grace period
- **GIVEN** a parking lot configured with a 15-minute grace period
- **WHEN** a ticket with 10 minutes elapsed duration is submitted for zero-payment check-out
- **THEN** the system SHALL validate the calculated fee as 0.00 and authorize departure

#### Scenario: Authorized fee exemption
- **GIVEN** an open ticket with elapsed duration exceeding the grace period
- **WHEN** the operator submits zero-payment check-out with an authorized exemption reason
- **THEN** the system SHALL record the exemption reason and authorize departure at zero cost

### Requirement: Payment Required Rejection
The system MUST reject zero-payment check-out when the ticket incurs a balance and no valid exemption is provided.

#### Scenario: Exceeded grace period without exemption
- **GIVEN** an open ticket with elapsed duration exceeding the grace period and an outstanding balance
- **WHEN** a zero-payment check-out request is submitted without exemption authorization
- **THEN** the system SHALL reject the check-out with a 400 Bad Request error indicating payment is required

### Requirement: Ticket Closure and Slot Release
Upon authorized departure, the system SHALL update ticket status to `CLOSED`, record the exit timestamp, and transition the associated parking slot from `OCCUPIED` to `AVAILABLE`.

#### Scenario: Successful zero-payment check-out execution
- **GIVEN** an eligible zero-payment ticket associated with slot "A-12"
- **WHEN** the zero-payment departure is confirmed
- **THEN** the system SHALL set the ticket status to `CLOSED`, set exit timestamp, mark slot "A-12" as `AVAILABLE`, and log the clearance event

### Requirement: Already Closed Ticket Protection
The system SHALL prevent double check-out of previously closed tickets.

#### Scenario: Departure attempt on closed ticket
- **GIVEN** a ticket that is already in status `CLOSED`
- **WHEN** a check-out request is submitted for that ticket
- **THEN** the system MUST return a 409 Conflict or 400 Bad Request error stating the ticket is already closed
