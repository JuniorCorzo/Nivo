<!-- TAG: ADDED -->
# Delta Spec: API Slot Metadata & Group Mutation Endpoints

## Motivation
Expose dedicated endpoints for batch updating slot equipment metadata and slot family topology with atomic transactional guarantees.

## Requirements
1. **Endpoint `PATCH /api/v1/slots/metadata`**:
   - Accepts a list of slot UUIDs and optional flags: `hasCharger`, `isAccessible`, `isActive`.
   - Rejects the operation with `409 Conflict` if any slot in `slotIds` has `status != AVAILABLE`.
   - Returns updated `List<SlotResponse>` upon success.
2. **Endpoint `PATCH /api/v1/slots/groups`**:
   - Accepts `parkingId`, `currentZone`, `currentPrefix`, and optional `newZone`, `newPrefix`.
   - Rejects with `409 Conflict` if any slot in the group is occupied or if target group collides.
   - Renames all matching slots atomically.
3. **OpenAPI Compliance**:
   - All DTOs and endpoints must include `@Operation`, `@ApiResponse`, and `@Schema` definitions.\n