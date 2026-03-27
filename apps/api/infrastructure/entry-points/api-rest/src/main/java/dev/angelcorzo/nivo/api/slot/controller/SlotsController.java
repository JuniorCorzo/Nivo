package dev.angelcorzo.nivo.api.slot.controller;

import dev.angelcorzo.nivo.api.commons.dto.Response;
import dev.angelcorzo.nivo.api.slot.dto.CreateSlotRequest;
import dev.angelcorzo.nivo.api.slot.dto.SlotResponse;
import dev.angelcorzo.nivo.api.slot.dto.UpdateSlotRequest;
import dev.angelcorzo.nivo.api.slot.mappers.SlotsMapper;
import dev.angelcorzo.nivo.model.authentication.gateway.AuthenticationContextGateway;
import dev.angelcorzo.nivo.model.slots.Slots;
import dev.angelcorzo.nivo.usecase.createslot.CreateSlotUseCase;
import dev.angelcorzo.nivo.usecase.editslot.EditSlotUseCase;
import dev.angelcorzo.nivo.usecase.listslots.ListSlotsUseCase;
import dev.angelcorzo.nivo.usecase.removeslot.RemoveSlotUseCase;
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

  private final ListSlotsUseCase listSlotsUseCase;
  private final CreateSlotUseCase createSlotUseCase;
  private final EditSlotUseCase editSlotUseCase;
  private final RemoveSlotUseCase removeSlotUseCase;

  @GetMapping("/list")
  @PreAuthorize("hasRole('OPERATOR')")
  Response<List<SlotResponse>> listSlots(@RequestParam("parking") UUID parkingLotId) {
    List<SlotResponse> slots =
        this.listSlotsUseCase.execute(parkingLotId).stream().map(slotsMapper::toDto).toList();

    return Response.ok(slots, "Slots retrieved successfully");
  }

  @PostMapping("/create")
  @PreAuthorize("hasRole('MANAGER')")
  Response<SlotResponse> createSlot(@RequestBody CreateSlotRequest request) {
    final CreateSlotUseCase.CreateSlotCommand slot =
        this.slotsMapper.toModel(request).toBuilder().tenantId(this.getTenantId()).build();

    final Slots createdSlot = this.createSlotUseCase.execute(slot);

    return Response.created(this.slotsMapper.toDto(createdSlot), "Slot created successfully");
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
  Response<Void> deleteSlot(@PathVariable("slotId") UUID slotId) {
    this.removeSlotUseCase.execute(slotId);

    return Response.ok(null, "Slot deleted successfully");
  }

  private UUID getTenantId() {
    return this.authenticationContext.getCurrentTenantId();
  }
}
