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
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/slots")
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

  @GetMapping("/list")
  @PreAuthorize("hasRole('OPERATOR')")
  Response<List<SlotResponse>> listSlots(@RequestParam("parking") UUID parkingLotId) {
    List<SlotResponse> slots = this.listSlotsUseCase.execute(parkingLotId).stream().map(slotsMapper::toDto).toList();

    return Response.ok(slots, "Slots retrieved successfully");
  }

  @GetMapping("/list/summary")
  @PreAuthorize("hasRole('OPERATOR')")
  Response<List<SlotSummaryResponse>> listSlotSummaries(@RequestParam("parking") UUID parkingLotId) {
    List<SlotSummaryResponse> slots = this.listSlotsSummaryUseCase.execute(parkingLotId).stream()
        .map(slotsMapper::toDto).toList();

    return Response.ok(slots, "Slots retrieved successfully");
  }

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

  @PutMapping("/update")
  @PreAuthorize("hasRole('MANAGER')")
  Response<SlotResponse> updateSlot(@RequestBody UpdateSlotRequest request) {
    final EditSlotUseCase.UpdateSlotCommand slot = this.slotsMapper.toModel(request);
    final Slots updatedSlot = this.editSlotUseCase.execute(slot);

    return Response.ok(this.slotsMapper.toDto(updatedSlot), "Slot updated successfully");
  }

  @DeleteMapping("/delete/{slotId}")
  @PreAuthorize("hasRole('MANAGER')")
  Response<Void> deleteSlot(@PathVariable UUID slotId) {
    this.removeSlotUseCase.execute(slotId);
    return Response.ok(null, "Slot deleted successfully");
  }

  @PostMapping("/delete-batch")
  Response<?> batchDelete(@RequestBody List<UUID> ids) {
    this.batchDeleteSlotsUseCase.execute(ids);
    return Response.ok(null, "");
  }

  private UUID getTenantId() {
    return this.authenticationContext.getCurrentTenantId();
  }
}
