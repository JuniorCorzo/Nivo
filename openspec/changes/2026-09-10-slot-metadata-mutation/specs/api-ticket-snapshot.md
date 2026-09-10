<!-- TAG: MODIFIED -->
# Delta Spec: Ticket Slot Snapshot Integrity

## Motivation
Prevent changes to slot infrastructure metadata from mutating historical records of parking sessions and accounting tickets.

## Requirements
1. **Ticket Snapshot Persistence**:
   - Add `slot_snapshot JSONB` to `parking_tickets` table and `ParkingTickets` domain model.
   - When a ticket is issued in `CreateTicketUseCase`, capture `SlotSnapshot.from(slot)` containing `slotNumber`, `zone`, `prefix`, `type`, `hasCharger`, and `isAccessible`.
2. **Historical Querying**:
   - When retrieving ticket details, use `slotSnapshot` data for slot details to preserve historical integrity.\n