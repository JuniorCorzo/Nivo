package dev.angelcorzo.nivo.infrastructure.entrypoint.rest.slot.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import dev.angelcorzo.nivo.infrastructure.entrypoint.rest.slot.dto.SlotResponse;
import dev.angelcorzo.nivo.infrastructure.entrypoint.rest.slot.dto.SlotSummaryResponse;
import dev.angelcorzo.nivo.infrastructure.entrypoint.rest.slot.mappers.SlotsMapper;
import dev.angelcorzo.nivo.domain.model.authentication.gateway.AuthenticationContextGateway;
import dev.angelcorzo.nivo.domain.model.parkinglots.gateways.ParkingLotsRepository;
import dev.angelcorzo.nivo.domain.model.slots.Slots;
import dev.angelcorzo.nivo.domain.model.slots.valueobject.SlotSummary;
import dev.angelcorzo.nivo.domain.model.slots.excetions.SlotCannotBeModifiedException;
import dev.angelcorzo.nivo.domain.usecase.slot.BatchDeleteSlotsUseCase;
import dev.angelcorzo.nivo.domain.usecase.slot.BatchUpsertSlotsUseCase;
import dev.angelcorzo.nivo.domain.usecase.slot.EditSlotUseCase;
import dev.angelcorzo.nivo.domain.usecase.slot.ListSlotsUseCase;
import dev.angelcorzo.nivo.domain.usecase.slot.ListSlotsSummaryUseCase;
import dev.angelcorzo.nivo.domain.usecase.slot.RemoveSlotUseCase;
import dev.angelcorzo.nivo.domain.usecase.slot.UpdateSlotGroupUseCase;
import dev.angelcorzo.nivo.domain.usecase.slot.UpdateSlotMetadataUseCase;
import dev.angelcorzo.nivo.infrastructure.entrypoint.rest.exception.ExceptionHandlerController;
import dev.angelcorzo.nivo.infrastructure.entrypoint.rest.slot.dto.UpdateSlotGroupRequest;
import dev.angelcorzo.nivo.infrastructure.entrypoint.rest.slot.dto.UpdateSlotMetadataRequest;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@ActiveProfiles("test")
@WebMvcTest(SlotsController.class)
@AutoConfigureMockMvc(addFilters = false)
@ContextConfiguration(classes = {SlotsController.class, ExceptionHandlerController.class})
@ExtendWith(MockitoExtension.class)
@DisplayName("SlotsController Unit Tests")
class SlotsControllerTest {

  @Autowired private MockMvc mockMvc;

  private final ObjectMapper objectMapper = new ObjectMapper().findAndRegisterModules();

  @MockitoBean private SlotsMapper slotsMapper;
  @MockitoBean private AuthenticationContextGateway authenticationContext;
  @MockitoBean private ParkingLotsRepository parkingLotsRepository;
  @MockitoBean private ListSlotsUseCase listSlotsUseCase;
  @MockitoBean private ListSlotsSummaryUseCase listSlotsSummaryUseCase;
  @MockitoBean private BatchUpsertSlotsUseCase batchUpsertSlotsUseCase;
  @MockitoBean private EditSlotUseCase editSlotUseCase;
  @MockitoBean private RemoveSlotUseCase removeSlotUseCase;
  @MockitoBean private BatchDeleteSlotsUseCase batchDeleteSlotsUseCase;
  @MockitoBean private UpdateSlotMetadataUseCase updateSlotMetadataUseCase;
  @MockitoBean private UpdateSlotGroupUseCase updateSlotGroupUseCase;

  @Test
  @DisplayName("GET /slots/list - Should list slots for parking lot")
  void shouldListSlots() throws Exception {
    UUID parkingId = UUID.randomUUID();
    Slots slot = Slots.builder().id(UUID.randomUUID()).build();
    SlotResponse response = mock(SlotResponse.class);

    when(listSlotsUseCase.execute(parkingId)).thenReturn(List.of(slot));
    when(slotsMapper.toDto(slot)).thenReturn(response);

    mockMvc
        .perform(get("/slots/list").param("parking", parkingId.toString()))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.message").value("Slots retrieved successfully"));
  }

  @Test
  @DisplayName("GET /slots/list/summary - Should list slot summaries")
  void shouldListSlotSummaries() throws Exception {
    UUID parkingId = UUID.randomUUID();
    SlotSummary summary = mock(SlotSummary.class);
    SlotSummaryResponse response = mock(SlotSummaryResponse.class);

    when(listSlotsSummaryUseCase.execute(parkingId)).thenReturn(List.of(summary));
    when(slotsMapper.toDto(summary)).thenReturn(response);

    mockMvc
        .perform(get("/slots/list/summary").param("parking", parkingId.toString()))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.message").value("Slots retrieved successfully"));
  }

  @Test
  @DisplayName("DELETE /slots/delete/{slotId} - Should delete single slot")
  void shouldDeleteSlot() throws Exception {
    UUID slotId = UUID.randomUUID();

    mockMvc
        .perform(delete("/slots/delete/{slotId}", slotId))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.message").value("Slot deleted successfully"));

    verify(removeSlotUseCase).execute(slotId);
  }

  @Test
  @DisplayName("POST /slots/delete-batch - Should batch delete slots")
  void shouldBatchDeleteSlots() throws Exception {
    List<UUID> ids = List.of(UUID.randomUUID(), UUID.randomUUID());

    mockMvc
        .perform(
            post("/slots/delete-batch")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(ids)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.message").value("Slots deleted successfully"));

    verify(batchDeleteSlotsUseCase).execute(ids);
  }

  @Test
  @DisplayName("PATCH /slots/metadata - Should update slot metadata successfully")
  void shouldUpdateSlotMetadata() throws Exception {
    UUID slotId = UUID.randomUUID();
    UpdateSlotMetadataRequest request = new UpdateSlotMetadataRequest(
        List.of(slotId),
        true,
        false,
        true
    );
    UpdateSlotMetadataUseCase.UpdateSlotMetadataCommand command =
        UpdateSlotMetadataUseCase.UpdateSlotMetadataCommand.builder()
            .slotIds(List.of(slotId))
            .hasCharger(true)
            .isAccessible(false)
            .isActive(true)
            .build();
    Slots updatedSlot = Slots.builder().id(slotId).hasCharger(true).isActive(true).build();
    SlotResponse slotResponse = mock(SlotResponse.class);

    when(slotsMapper.toCommand(request)).thenReturn(command);
    when(updateSlotMetadataUseCase.execute(command)).thenReturn(List.of(updatedSlot));
    when(slotsMapper.toDto(updatedSlot)).thenReturn(slotResponse);

    mockMvc
        .perform(
            patch("/slots/metadata")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.message").value("Slot metadata updated successfully"));

    verify(updateSlotMetadataUseCase).execute(command);
  }

  @Test
  @DisplayName("PATCH /slots/metadata - Should return 409 Conflict when SlotCannotBeModifiedException thrown")
  void shouldReturn409WhenSlotCannotBeModified() throws Exception {
    UUID slotId = UUID.randomUUID();
    UpdateSlotMetadataRequest request = new UpdateSlotMetadataRequest(
        List.of(slotId),
        true,
        null,
        null
    );
    UpdateSlotMetadataUseCase.UpdateSlotMetadataCommand command =
        UpdateSlotMetadataUseCase.UpdateSlotMetadataCommand.builder()
            .slotIds(List.of(slotId))
            .hasCharger(true)
            .build();

    when(slotsMapper.toCommand(request)).thenReturn(command);
    when(updateSlotMetadataUseCase.execute(command))
        .thenThrow(new SlotCannotBeModifiedException(List.of(slotId)));

    mockMvc
        .perform(
            patch("/slots/metadata")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
        .andExpect(status().isConflict());
  }

  @Test
  @DisplayName("PATCH /slots/groups - Should rename slot group successfully")
  void shouldUpdateSlotGroup() throws Exception {
    UUID parkingId = UUID.randomUUID();
    UpdateSlotGroupRequest request = new UpdateSlotGroupRequest(
        parkingId,
        "ZONE-A",
        "A",
        "ZONE-B",
        "B"
    );
    UpdateSlotGroupUseCase.UpdateSlotGroupCommand command =
        UpdateSlotGroupUseCase.UpdateSlotGroupCommand.builder()
            .parkingId(parkingId)
            .currentZone("ZONE-A")
            .currentPrefix("A")
            .newZone("ZONE-B")
            .newPrefix("B")
            .build();
    Slots updatedSlot = Slots.builder().id(UUID.randomUUID()).zone("ZONE-B").prefix("B").build();
    SlotResponse slotResponse = mock(SlotResponse.class);

    when(slotsMapper.toCommand(request)).thenReturn(command);
    when(updateSlotGroupUseCase.execute(command)).thenReturn(List.of(updatedSlot));
    when(slotsMapper.toDto(updatedSlot)).thenReturn(slotResponse);

    mockMvc
        .perform(
            patch("/slots/groups")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
        .andExpect(status().isOk());

    verify(updateSlotGroupUseCase).execute(command);
  }

  @Test
  @DisplayName("PATCH /slots/groups - Should succeed when currentPrefix and currentZone are empty strings")
  void shouldUpdateSlotGroupWithEmptyZoneAndPrefix() throws Exception {
    UUID parkingId = UUID.randomUUID();
    UpdateSlotGroupRequest request = new UpdateSlotGroupRequest(
        parkingId,
        "",
        "",
        "ZONE-A",
        "A"
    );
    UpdateSlotGroupUseCase.UpdateSlotGroupCommand command =
        UpdateSlotGroupUseCase.UpdateSlotGroupCommand.builder()
            .parkingId(parkingId)
            .currentZone("")
            .currentPrefix("")
            .newZone("ZONE-A")
            .newPrefix("A")
            .build();
    Slots updatedSlot = Slots.builder().id(UUID.randomUUID()).zone("ZONE-A").prefix("A").build();
    SlotResponse slotResponse = mock(SlotResponse.class);

    when(slotsMapper.toCommand(request)).thenReturn(command);
    when(updateSlotGroupUseCase.execute(command)).thenReturn(List.of(updatedSlot));
    when(slotsMapper.toDto(updatedSlot)).thenReturn(slotResponse);

    mockMvc
        .perform(
            patch("/slots/groups")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.message").value("Slot group updated successfully"));

    verify(updateSlotGroupUseCase).execute(command);
  }
}
