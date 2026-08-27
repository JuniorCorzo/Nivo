package dev.angelcorzo.nivo.api.parkinglots.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import dev.angelcorzo.nivo.api.parkinglots.dto.ParkingLotListItemResponse;
import dev.angelcorzo.nivo.api.parkinglots.dto.ParkingLotsResponse;
import dev.angelcorzo.nivo.api.parkinglots.dto.UpsertParkingLotsRequest;
import dev.angelcorzo.nivo.api.parkinglots.enums.ParkingLotsMessages;
import dev.angelcorzo.nivo.api.parkinglots.mappers.ParkingLotsMapper;
import dev.angelcorzo.nivo.api.rates.dto.CreateRate;
import dev.angelcorzo.nivo.api.rates.dto.RatesDTO;
import dev.angelcorzo.nivo.api.rates.enums.RateMessages;
import dev.angelcorzo.nivo.api.rates.mappers.RatesMapper;
import dev.angelcorzo.nivo.model.authentication.gateway.AuthenticationContextGateway;
import dev.angelcorzo.nivo.model.parkinglots.ParkingLotListItem;
import dev.angelcorzo.nivo.model.parkinglots.ParkingLots;
import dev.angelcorzo.nivo.model.parkinglots.dto.UpsertParkingLotsDTO;
import dev.angelcorzo.nivo.model.rates.Rates;
import dev.angelcorzo.nivo.model.slots.enums.SlotType;
import dev.angelcorzo.nivo.usecase.createparking.CreateParkingUseCase;
import dev.angelcorzo.nivo.usecase.deleteparkinglot.DeleteParkingLotUseCase;
import dev.angelcorzo.nivo.usecase.deleteslotgroup.DeleteSlotGroupUseCase;
import dev.angelcorzo.nivo.usecase.listparkinglots.ListParkingLotsUseCase;
import dev.angelcorzo.nivo.usecase.rateconfiguration.RateConfigurationUseCase;
import dev.angelcorzo.nivo.usecase.showratesbyparkinglot.ShowRatesByParkingLotUseCase;
import dev.angelcorzo.nivo.usecase.updateparking.UpdateParkingLotsUseCase;
import java.math.BigDecimal;
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
@WebMvcTest(ParkingLotsController.class)
@AutoConfigureMockMvc(addFilters = false)
@ContextConfiguration(classes = ParkingLotsController.class)
@ExtendWith(MockitoExtension.class)
@DisplayName("ParkingLotsController Unit Tests")
class ParkingLotsControllerTest {

  @Autowired private MockMvc mockMvc;

  private final ObjectMapper objectMapper = new ObjectMapper().findAndRegisterModules();

  @MockitoBean private AuthenticationContextGateway authenticationContext;
  @MockitoBean private ParkingLotsMapper parkingLotsMapper;
  @MockitoBean private RatesMapper ratesMapper;
  @MockitoBean private CreateParkingUseCase createParkingUseCase;
  @MockitoBean private UpdateParkingLotsUseCase updateParkingLotsUseCase;
  @MockitoBean private ListParkingLotsUseCase listParkingLotsUseCase;
  @MockitoBean private RateConfigurationUseCase rateConfigurationUseCase;
  @MockitoBean private ShowRatesByParkingLotUseCase showRatesByParkingLotUseCase;
  @MockitoBean private DeleteSlotGroupUseCase deleteSlotGroupUseCase;
  @MockitoBean private DeleteParkingLotUseCase deleteParkingLotUseCase;

  @Test
  @DisplayName("GET /parking-lots/list - Should list all parking lots")
  void shouldListParkingLots() throws Exception {
    UUID tenantId = UUID.randomUUID();
    ParkingLotListItem item = mock(ParkingLotListItem.class);
    ParkingLotListItemResponse response = mock(ParkingLotListItemResponse.class);

    when(authenticationContext.getCurrentTenantId()).thenReturn(tenantId);
    when(listParkingLotsUseCase.listParkingLots(tenantId)).thenReturn(List.of(item));
    when(parkingLotsMapper.toListItemResponse(item)).thenReturn(response);

    mockMvc
        .perform(get("/parking-lots/list"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.message").value(ParkingLotsMessages.PARKING_LOTS_LIST.format()));
  }

  @Test
  @DisplayName("GET /parking-lots/{parkingId}/rates - Should show rates by parking lot")
  void shouldShowRatesByParkingId() throws Exception {
    UUID parkingId = UUID.randomUUID();
    Rates rate = Rates.builder().id(UUID.randomUUID()).build();
    RatesDTO dto = mock(RatesDTO.class);

    when(showRatesByParkingLotUseCase.execute(parkingId)).thenReturn(List.of(rate));
    when(ratesMapper.toDTO(rate)).thenReturn(dto);

    mockMvc
        .perform(get("/parking-lots/{parkingId}/rates", parkingId))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.message").value(RateMessages.SHOW_RATES_BY_TENANT.format()));
  }

  @Test
  @DisplayName("DELETE /parking-lots/{parkingId} - Should delete parking lot")
  void shouldDeleteParkingLot() throws Exception {
    UUID parkingId = UUID.randomUUID();

    mockMvc
        .perform(delete("/parking-lots/{parkingId}", parkingId))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.message").value(ParkingLotsMessages.PARKING_LOT_DELETED.format()));

    verify(deleteParkingLotUseCase).execute(parkingId);
  }

  @Test
  @DisplayName("DELETE /parking-lots/{parkingId}/slots/groups - Should delete slot group")
  void shouldDeleteSlotGroup() throws Exception {
    UUID parkingId = UUID.randomUUID();

    mockMvc
        .perform(
            delete("/parking-lots/{parkingId}/slots/groups", parkingId)
                .param("slotType", "CAR")
                .param("prefix", "A")
                .param("zone", "NORTH"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.message").value(ParkingLotsMessages.SLOT_GROUP_DELETED.format()));

    verify(deleteSlotGroupUseCase).execute(any(DeleteSlotGroupUseCase.DeleteSlotGroupCommand.class));
  }
}
