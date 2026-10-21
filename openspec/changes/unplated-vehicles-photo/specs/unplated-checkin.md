# Specification: Unplated Vehicle Check-In & Public Ticket (RF-012)

## 1. Context & Business Rules

### Rule 1: Mandatory Photographic Proof

When `plateCountry == PlateCountry.UNPLATED`, the check-in command MUST provide a non-blank `photoUrl`. If missing, the request is rejected with `UnplatedVehiclePhotoRequiredException` (HTTP 422).

### Rule 2: Synthetic Sequential Code Assignment

The backend issues a unique sequential license identifier with format `SP-{sequenceNumber}` scoped by facility. The vehicle is tracked under this synthetic plate across its entire parking lifecycle.

### Rule 3: Public Digital Ticket Sanitization

The endpoint `GET /api/v1/public/tickets/{ticketId}` allows drivers to view their parking voucher without authentication. The payload is strictly sanitized:

- Exposes: `id`, `plate`, `plateCountry`, `photoUrl`, `slotNumber`, `parkingLotName`, `rateName`, `ratePricePerUnit`, `rateTimeUnit`, `entryTime`, `status`.
- Hides: `tenantId`, `userId`, `financialLedger`, internal operator notes.

### Rule 4: WhatsApp Integration

If the operator inputs a customer phone number during check-in, the UI compiles a direct `https://wa.me/{phone}?text={encodedMessage}` link containing the public ticket URL.

## 2. Gherkin Scenarios

```gherkin
Feature: Unplated Vehicle Check-In and Public Ticket

  Scenario: Successful check-in of motorcycle without license plate
    Given an available slot "M-04" in parking facility "Central"
    When the operator registers check-in with plateCountry "UNPLATED" and valid vehicle photo
    Then the system generates synthetic plate "SP-1042"
    And marks slot "M-04" as OCCUPIED
    And issues a parking ticket with status OPEN containing the photo

  Scenario: Rejection of unplated vehicle registration without photo
    Given an available slot "M-04" in parking facility "Central"
    When the operator attempts check-in with plateCountry "UNPLATED" but photoUrl is null
    Then the system rejects the operation with UnplatedVehiclePhotoRequiredException
    And the slot remains AVAILABLE

  Scenario: Driver inspects public ticket voucher via link or QR
    Given a valid ticket issued with synthetic plate "SP-1042" and photo
    When an unauthenticated client requests GET /api/v1/public/tickets/{ticketId}
    Then the system returns 200 OK with the vehicle photo, slot number, and rate breakdown
    And no tenant or internal security identifiers are present in the response
```
