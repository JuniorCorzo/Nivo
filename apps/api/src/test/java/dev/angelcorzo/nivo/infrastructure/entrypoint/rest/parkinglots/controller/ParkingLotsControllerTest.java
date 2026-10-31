package dev.angelcorzo.nivo.infrastructure.entrypoint.rest.parkinglots.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import dev.angelcorzo.nivo.domain.model.authentication.gateway.AuthenticationContextGateway;
import dev.angelcorzo.nivo.domain.model.parkinglots.OccupiedSlotSummary;
import dev.angelcorzo.nivo.domain.model.parkinglots.ParkingLotListItem;
import dev.angelcorzo.nivo.domain.model.parkinglots.ParkingTelemetry;
import dev.angelcorzo.nivo.domain.model.rates.Rates;
import dev.angelcorzo.nivo.domain.usecase.parkinglot.CreateParkingUseCase;
import dev.angelcorzo.nivo.domain.usecase.parkinglot.DeleteParkingLotUseCase;
import dev.angelcorzo.nivo.domain.usecase.parkinglot.GetParkingTelemetryUseCase;
import dev.angelcorzo.nivo.domain.usecase.parkinglot.ListParkingLotsUseCase;
import dev.angelcorzo.nivo.domain.usecase.parkinglot.UpdateParkingLotsUseCase;
import dev.angelcorzo.nivo.domain.usecase.rate.RateConfigurationUseCase;
import dev.angelcorzo.nivo.domain.usecase.rate.ShowRatesByParkingLotUseCase;
import dev.angelcorzo.nivo.domain.usecase.slot.DeleteSlotGroupUseCase;
import dev.angelcorzo.nivo.infrastructure.entrypoint.rest.parkinglots.dto.response.OccupiedSlotResponse;
import dev.angelcorzo.nivo.infrastructure.entrypoint.rest.parkinglots.dto.response.ParkingLotListItemResponse;
import dev.angelcorzo.nivo.infrastructure.entrypoint.rest.parkinglots.dto.response.ParkingTelemetryResponse;
import dev.angelcorzo.nivo.infrastructure.entrypoint.rest.parkinglots.enums.ParkingLotsMessages;
import dev.angelcorzo.nivo.infrastructure.entrypoint.rest.parkinglots.mappers.ParkingLotsMapper;
import dev.angelcorzo.nivo.infrastructure.entrypoint.rest.rates.dto.RatesDTO;
import dev.angelcorzo.nivo.infrastructure.entrypoint.rest.rates.enums.RateMessages;
import dev.angelcorzo.nivo.infrastructure.entrypoint.rest.rates.mappers.RatesMapper;
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

  @Autowired
  private MockMvc mockMvc;

  private final ObjectMapper objectMapper = new ObjectMapper().findAndRegisterModules();

  @MockitoBean
  private AuthenticationContextGateway authenticationContext;

  @MockitoBean
  private ParkingLotsMapper parkingLotsMapper;

  @MockitoBean
  private RatesMapper ratesMapper;

  @MockitoBean
  private CreateParkingUseCase createParkingUseCase;

  @MockitoBean
  private UpdateParkingLotsUseCase updateParkingLotsUseCase;

  @MockitoBean
  private ListParkingLotsUseCase listParkingLotsUseCase;

  @MockitoBean
  private RateConfigurationUseCase rateConfigurationUseCase;

  @MockitoBean
  private ShowRatesByParkingLotUseCase showRatesByParkingLotUseCase;

  @MockitoBean
  private DeleteSlotGroupUseCase deleteSlotGroupUseCase;

  @MockitoBean
  private DeleteParkingLotUseCase deleteParkingLotUseCase;

  @MockitoBean
  private GetParkingTelemetryUseCase getParkingTelemetryUseCase;

  @Test
  @DisplayName("GET /parking-lots/list - Should list all parking lots")
  void shouldListParkingLots() throws Exception {
    UUID tenantId = UUID.randomUUID();
    ParkingLotListItem item = mock(ParkingLotListItem.class);
    ParkingLotListItemResponse response = mock(ParkingLotListItemResponse.class);

    when(authenticationContext.getCurrentTenantId()).thenReturn(tenantId);
    when(listParkingLotsUseCase.listParkingLots(tenantId)).thenReturn(List.of(item));
    when(parkingLotsMapper.toListItemResponse(item)).thenReturn(response);

    mockMvc.perform(get("/parking-lots/list"))
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

    mockMvc.perform(get("/parking-lots/{parkingId}/rates", parkingId))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.message").value(RateMessages.SHOW_RATES_BY_TENANT.format()));
  }

  @Test
  @DisplayName("GET /parking-lots/{parkingId}/telemetry - Should return parking telemetry")
  void shouldReturnParkingTelemetry() throws Exception {
    UUID parkingId = UUID.randomUUID();
    ParkingTelemetry telemetry = ParkingTelemetry.builder()
      .parkingId(parkingId)
      .totalCapacity(100)
      .occupiedSlots(42)
      .availableSlots(58)
      .occupancyRate(42.0)
      .carTotal(70)
      .carOccupied(35)
      .carRate(50.0)
      .motoTotal(30)
      .motoOccupied(7)
      .motoRate(23.3)
      .shiftRevenue(new BigDecimal("150000.00"))
      .averageTicketRevenue(new BigDecimal("5000.00"))
      .totalTicketsToday(45L)
      .activeTickets(15L)
      .completedTicketsToday(30L)
      .avgStayMinutes(75.5)
      .rotationIndex(0.5)
      .moraCount(2L)
      .shiftTargetPercentage(104.0)
      .occupiedSlotsDetail(List.of(
        OccupiedSlotSummary.builder()
          .slotNumber("A-01")
          .zone("Nivel 1")
          .prefix("A")
          .type("CAR")
          .licensePlate("KLM 482")
          .build()))
      .build();

    ParkingTelemetryResponse response = ParkingTelemetryResponse.builder()
      .parkingId(parkingId)
      .totalCapacity(100)
      .occupiedSlots(42)
      .availableSlots(58)
      .occupancyRate(42.0)
      .carTotal(70)
      .carOccupied(35)
      .carRate(50.0)
      .motoTotal(30)
      .motoOccupied(7)
      .motoRate(23.3)
      .shiftRevenue(new BigDecimal("150000.00"))
      .averageTicketRevenue(new BigDecimal("5000.00"))
      .totalTicketsToday(45L)
      .activeTickets(15L)
      .completedTicketsToday(30L)
      .avgStayMinutes(75.5)
      .rotationIndex(0.5)
      .moraCount(2L)
      .shiftTargetPercentage(104.0)
      .occupiedSlotsDetail(List.of(
        OccupiedSlotResponse.builder()
          .slotNumber("A-01")
          .zone("Nivel 1")
          .prefix("A")
          .type("CAR")
          .licensePlate("KLM 482")
          .build()))
      .build();

    when(getParkingTelemetryUseCase.execute(parkingId)).thenReturn(telemetry);
    when(parkingLotsMapper.toTelemetryResponse(telemetry)).thenReturn(response);

    mockMvc.perform(get("/parking-lots/{parkingId}/telemetry", parkingId))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.message").value(ParkingLotsMessages.PARKING_TELEMETRY_RETRIEVED.format()))
      .andExpect(jsonPath("$.data.parkingId").value(parkingId.toString()))
      .andExpect(jsonPath("$.data.totalCapacity").value(100))
      .andExpect(jsonPath("$.data.occupiedSlots").value(42))
      .andExpect(jsonPath("$.data.availableSlots").value(58))
      .andExpect(jsonPath("$.data.occupancyRate").value(42.0))
      .andExpect(jsonPath("$.data.carTotal").value(70))
      .andExpect(jsonPath("$.data.carOccupied").value(35))
      .andExpect(jsonPath("$.data.carRate").value(50.0))
      .andExpect(jsonPath("$.data.motoTotal").value(30))
      .andExpect(jsonPath("$.data.motoOccupied").value(7))
      .andExpect(jsonPath("$.data.motoRate").value(23.3))
      .andExpect(jsonPath("$.data.shiftRevenue").value(150000.00))
      .andExpect(jsonPath("$.data.averageTicketRevenue").value(5000.00))
      .andExpect(jsonPath("$.data.totalTicketsToday").value(45))
      .andExpect(jsonPath("$.data.activeTickets").value(15))
      .andExpect(jsonPath("$.data.completedTicketsToday").value(30))
      .andExpect(jsonPath("$.data.avgStayMinutes").value(75.5))
      .andExpect(jsonPath("$.data.rotationIndex").value(0.5))
      .andExpect(jsonPath("$.data.moraCount").value(2))
      .andExpect(jsonPath("$.data.shiftTargetPercentage").value(104.0))
      .andExpect(jsonPath("$.data.occupiedSlotsDetail[0].slotNumber").value("A-01"))
      .andExpect(jsonPath("$.data.occupiedSlotsDetail[0].zone").value("Nivel 1"))
      .andExpect(jsonPath("$.data.occupiedSlotsDetail[0].prefix").value("A"))
      .andExpect(jsonPath("$.data.occupiedSlotsDetail[0].type").value("CAR"))
      .andExpect(jsonPath("$.data.occupiedSlotsDetail[0].licensePlate").value("KLM 482"));
  }

  @Test
  @DisplayName("DELETE /parking-lots/{parkingId} - Should delete parking lot")
  void shouldDeleteParkingLot() throws Exception {
    UUID tenantId = UUID.randomUUID();
    UUID parkingId = UUID.randomUUID();

    when(authenticationContext.getCurrentTenantId()).thenReturn(tenantId);

    mockMvc.perform(delete("/parking-lots/{parkingId}", parkingId))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.message").value(ParkingLotsMessages.PARKING_LOT_DELETED.format()));

    verify(deleteParkingLotUseCase).execute(parkingId, tenantId);
  }

  @Test
  @DisplayName("DELETE /parking-lots/{parkingId}/slots/groups - Should delete slot group")
  void shouldDeleteSlotGroup() throws Exception {
    UUID parkingId = UUID.randomUUID();

    mockMvc
      .perform(delete("/parking-lots/{parkingId}/slots/groups", parkingId).param("slotType", "CAR")
        .param("prefix", "A")
        .param("zone", "NORTH"))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.message").value(ParkingLotsMessages.SLOT_GROUP_DELETED.format()));

    verify(deleteSlotGroupUseCase).execute(any(DeleteSlotGroupUseCase.DeleteSlotGroupCommand.class));
  }
}
