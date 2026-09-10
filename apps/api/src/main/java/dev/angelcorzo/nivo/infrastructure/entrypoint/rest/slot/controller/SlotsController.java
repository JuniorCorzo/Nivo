package dev.angelcorzo.nivo.infrastructure.entrypoint.rest.slot.controller;

import dev.angelcorzo.nivo.infrastructure.entrypoint.rest.commons.dto.Response;
import dev.angelcorzo.nivo.infrastructure.entrypoint.rest.slot.dto.BatchCreateSlotRequest;
import dev.angelcorzo.nivo.infrastructure.entrypoint.rest.slot.dto.SlotResponse;
import dev.angelcorzo.nivo.infrastructure.entrypoint.rest.slot.dto.SlotSummaryResponse;
import dev.angelcorzo.nivo.infrastructure.entrypoint.rest.slot.dto.UpdateSlotRequest;
import dev.angelcorzo.nivo.infrastructure.entrypoint.rest.slot.mappers.SlotsMapper;
import dev.angelcorzo.nivo.domain.model.authentication.gateway.AuthenticationContextGateway;
import dev.angelcorzo.nivo.domain.model.parkinglots.ParkingLots;
import dev.angelcorzo.nivo.domain.model.parkinglots.exceptions.ParkingNotExistsException;
import dev.angelcorzo.nivo.domain.model.parkinglots.gateways.ParkingLotsRepository;
import dev.angelcorzo.nivo.domain.model.slots.Slots;
import dev.angelcorzo.nivo.domain.model.slots.valueobject.CreatedSlots;
import dev.angelcorzo.nivo.domain.usecase.slot.BatchDeleteSlotsUseCase;
import dev.angelcorzo.nivo.domain.usecase.slot.BatchUpsertSlotsUseCase;
import dev.angelcorzo.nivo.domain.usecase.slot.EditSlotUseCase;
import dev.angelcorzo.nivo.domain.usecase.slot.ListSlotsUseCase;
import dev.angelcorzo.nivo.domain.usecase.slot.ListSlotsSummaryUseCase;
import dev.angelcorzo.nivo.domain.usecase.slot.RemoveSlotUseCase;
import dev.angelcorzo.nivo.domain.usecase.slot.UpdateSlotGroupUseCase;
import dev.angelcorzo.nivo.domain.usecase.slot.UpdateSlotMetadataUseCase;
import dev.angelcorzo.nivo.infrastructure.entrypoint.rest.slot.dto.UpdateSlotGroupRequest;
import dev.angelcorzo.nivo.infrastructure.entrypoint.rest.slot.dto.UpdateSlotMetadataRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/slots")
@Tag(name = "Slots", description = "Parking slot management, batch creation and updates")
@RequiredArgsConstructor
public class SlotsController {
  private final SlotsMapper slotsMapper;
  private final AuthenticationContextGateway authenticationContext;
  private final ParkingLotsRepository parkingLotsRepository;

  private final ListSlotsUseCase listSlotsUseCase;
  private final ListSlotsSummaryUseCase listSlotsSummaryUseCase;
  private final BatchUpsertSlotsUseCase batchUpsertSlotsUseCase;
  private final EditSlotUseCase editSlotUseCase;
  private final RemoveSlotUseCase removeSlotUseCase;
  private final BatchDeleteSlotsUseCase batchDeleteSlotsUseCase;
  private final UpdateSlotMetadataUseCase updateSlotMetadataUseCase;
  private final UpdateSlotGroupUseCase updateSlotGroupUseCase;

  @Operation(
      summary = "List slots for parking lot",
      description = "Retrieves all parking slots belonging to a specific parking lot")
  @ApiResponses({
    @ApiResponse(responseCode = "200", description = "Slots retrieved successfully"),
    @ApiResponse(responseCode = "403", description = "Forbidden - Operator role required")
  })
  @GetMapping("/list")
  @PreAuthorize("hasRole('OPERATOR')")
  Response<List<SlotResponse>> listSlots(
      @Parameter(description = "Parking lot ID", required = true) @RequestParam("parking") UUID parkingLotId) {
    List<SlotResponse> slots = this.listSlotsUseCase.execute(parkingLotId).stream().map(slotsMapper::toDto).toList();

    return Response.ok(slots, "Slots retrieved successfully");
  }

  @Operation(
      summary = "List slot summaries for parking lot",
      description = "Retrieves aggregated summary statistics for slots in a parking lot")
  @ApiResponses({
    @ApiResponse(responseCode = "200", description = "Slot summaries retrieved successfully"),
    @ApiResponse(responseCode = "403", description = "Forbidden - Operator role required")
  })
  @GetMapping("/list/summary")
  @PreAuthorize("hasRole('OPERATOR')")
  Response<List<SlotSummaryResponse>> listSlotSummaries(
      @Parameter(description = "Parking lot ID", required = true) @RequestParam("parking") UUID parkingLotId) {
    List<SlotSummaryResponse> slots = this.listSlotsSummaryUseCase.execute(parkingLotId).stream()
        .map(slotsMapper::toDto).toList();

    return Response.ok(slots, "Slots retrieved successfully");
  }

  @Operation(
      summary = "Batch create slots",
      description = "Creates multiple slots for a parking lot in a single batch operation")
  @ApiResponses({
    @ApiResponse(responseCode = "200", description = "Slots created successfully"),
    @ApiResponse(responseCode = "400", description = "Invalid payload or parking lot not found"),
    @ApiResponse(responseCode = "403", description = "Forbidden - Manager role required")
  })
  @PostMapping("/create")
  @PreAuthorize("hasRole('MANAGER')")
  Response<Void> createSlots(@Valid @RequestBody BatchCreateSlotRequest request) {
    ParkingLots parking = this.parkingLotsRepository.findById(request.parkingLotId())
        .orElseThrow(() -> new ParkingNotExistsException(request.parkingLotId()));

    List<CreatedSlots> incomingSlots = request.slots().stream()
        .map(this.slotsMapper::toModel)
        .toList();

    this.batchUpsertSlotsUseCase.execute(
        incomingSlots,
        parking,
        this.authenticationContext.getCurrentTenant());

    return Response.ok(null, "Slots created successfully");
  }

  @Operation(
      summary = "Update slot",
      description = "Updates an existing slot's configuration, number, type or status")
  @ApiResponses({
    @ApiResponse(responseCode = "200", description = "Slot updated successfully"),
    @ApiResponse(responseCode = "400", description = "Invalid slot payload"),
    @ApiResponse(responseCode = "403", description = "Forbidden - Manager role required")
  })
  @PutMapping("/update")
  @PreAuthorize("hasRole('MANAGER')")
  Response<SlotResponse> updateSlot(@Valid @RequestBody UpdateSlotRequest request) {
    final EditSlotUseCase.UpdateSlotCommand slot = this.slotsMapper.toModel(request);
    final Slots updatedSlot = this.editSlotUseCase.execute(slot);

    return Response.ok(this.slotsMapper.toDto(updatedSlot), "Slot updated successfully");
  }

  @Operation(
      summary = "Delete slot",
      description = "Deletes a single slot by its ID")
  @ApiResponses({
    @ApiResponse(responseCode = "200", description = "Slot deleted successfully"),
    @ApiResponse(responseCode = "403", description = "Forbidden - Manager role required")
  })
  @DeleteMapping("/delete/{slotId}")
  @PreAuthorize("hasRole('MANAGER')")
  Response<Void> deleteSlot(
      @Parameter(description = "Slot ID", required = true) @PathVariable UUID slotId) {
    this.removeSlotUseCase.execute(slotId);
    return Response.ok(null, "Slot deleted successfully");
  }

  @Operation(
      summary = "Batch delete slots",
      description = "Deletes multiple slots by their IDs in a single batch operation")
  @ApiResponses({
    @ApiResponse(responseCode = "200", description = "Slots deleted successfully"),
    @ApiResponse(responseCode = "400", description = "Invalid IDs list")
  })
  @PostMapping("/delete-batch")
  Response<?> batchDelete(@RequestBody List<UUID> ids) {
    this.batchDeleteSlotsUseCase.execute(ids);
    return Response.ok(null, "Slots deleted successfully");
  }

  @Operation(
      summary = "Batch update equipment metadata for selected slots",
      description = "Batch update equipment metadata for selected slots")
  @ApiResponses({
    @ApiResponse(responseCode = "200", description = "Slot metadata updated successfully"),
    @ApiResponse(responseCode = "400", description = "Invalid request payload"),
    @ApiResponse(responseCode = "404", description = "Slot not found"),
    @ApiResponse(responseCode = "409", description = "Slot cannot be modified because one or more are not available")
  })
  @PatchMapping("/metadata")
  @PreAuthorize("hasRole('MANAGER')")
  Response<List<SlotResponse>> updateSlotMetadata(@Valid @RequestBody UpdateSlotMetadataRequest request) {
    List<Slots> updatedSlots = this.updateSlotMetadataUseCase.execute(this.slotsMapper.toCommand(request));
    List<SlotResponse> responses = updatedSlots.stream().map(this.slotsMapper::toDto).toList();
    return Response.ok(responses, "Slot metadata updated successfully");
  }

  @Operation(
      summary = "Rename zone and/or prefix for an entire slot family",
      description = "Rename zone and/or prefix for an entire slot family")
  @ApiResponses({
    @ApiResponse(responseCode = "200", description = "Slot group updated successfully"),
    @ApiResponse(responseCode = "400", description = "Invalid request payload"),
    @ApiResponse(responseCode = "409", description = "Slot cannot be modified because one or more are not available")
  })
  @PatchMapping("/groups")
  @PreAuthorize("hasRole('MANAGER')")
  Response<List<SlotResponse>> updateSlotGroup(@Valid @RequestBody UpdateSlotGroupRequest request) {
    List<Slots> updatedSlots = this.updateSlotGroupUseCase.execute(this.slotsMapper.toCommand(request));
    List<SlotResponse> responses = updatedSlots.stream().map(this.slotsMapper::toDto).toList();
    return Response.ok(responses, "Slot group updated successfully");
  }

  private UUID getTenantId() {
    return this.authenticationContext.getCurrentTenantId();
  }
}
