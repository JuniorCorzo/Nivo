package dev.angelcorzo.nivo.api.slot.controller;

import dev.angelcorzo.nivo.api.commons.dto.Response;
import dev.angelcorzo.nivo.api.slot.dto.BatchCreateSlotRequest;
import dev.angelcorzo.nivo.api.slot.dto.SlotResponse;
import dev.angelcorzo.nivo.api.slot.dto.SlotSummaryResponse;
import dev.angelcorzo.nivo.api.slot.dto.UpdateSlotRequest;
import dev.angelcorzo.nivo.api.slot.mappers.SlotsMapper;
import dev.angelcorzo.nivo.model.authentication.gateway.AuthenticationContextGateway;
import dev.angelcorzo.nivo.model.parkinglots.ParkingLots;
import dev.angelcorzo.nivo.model.parkinglots.exceptions.ParkingNotExistsException;
import dev.angelcorzo.nivo.model.parkinglots.gateways.ParkingLotsRepository;
import dev.angelcorzo.nivo.model.slots.Slots;
import dev.angelcorzo.nivo.model.slots.valueobject.CreatedSlots;
import dev.angelcorzo.nivo.usecase.batchdeleteslots.BatchDeleteSlotsUseCase;
import dev.angelcorzo.nivo.usecase.batchupsertslots.BatchUpsertSlotsUseCase;
import dev.angelcorzo.nivo.usecase.editslot.EditSlotUseCase;
import dev.angelcorzo.nivo.usecase.listslots.ListSlotsUseCase;
import dev.angelcorzo.nivo.usecase.listslotsummary.ListSlotsSummaryUseCase;
import dev.angelcorzo.nivo.usecase.removeslot.RemoveSlotUseCase;
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

  private UUID getTenantId() {
    return this.authenticationContext.getCurrentTenantId();
  }
}
