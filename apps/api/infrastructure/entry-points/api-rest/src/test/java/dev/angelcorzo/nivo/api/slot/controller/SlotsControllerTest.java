package dev.angelcorzo.nivo.api.slot.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import dev.angelcorzo.nivo.api.slot.dto.SlotResponse;
import dev.angelcorzo.nivo.api.slot.dto.SlotSummaryResponse;
import dev.angelcorzo.nivo.api.slot.mappers.SlotsMapper;
import dev.angelcorzo.nivo.model.authentication.gateway.AuthenticationContextGateway;
import dev.angelcorzo.nivo.model.parkinglots.gateways.ParkingLotsRepository;
import dev.angelcorzo.nivo.model.slots.Slots;
import dev.angelcorzo.nivo.model.slots.valueobject.SlotSummary;
import dev.angelcorzo.nivo.usecase.batchdeleteslots.BatchDeleteSlotsUseCase;
import dev.angelcorzo.nivo.usecase.batchupsertslots.BatchUpsertSlotsUseCase;
import dev.angelcorzo.nivo.usecase.editslot.EditSlotUseCase;
import dev.angelcorzo.nivo.usecase.listslots.ListSlotsUseCase;
import dev.angelcorzo.nivo.usecase.listslotsummary.ListSlotsSummaryUseCase;
import dev.angelcorzo.nivo.usecase.removeslot.RemoveSlotUseCase;
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
@ContextConfiguration(classes = SlotsController.class)
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
}
