package dev.angelcorzo.nivo.infrastructure.entrypoint.rest.dashboard;

import static org.hamcrest.Matchers.hasSize;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import dev.angelcorzo.nivo.domain.model.parkinglots.exceptions.ParkingNotExistsException;
import dev.angelcorzo.nivo.domain.usecase.dashboard.GetDashboardSummaryUseCase;
import dev.angelcorzo.nivo.domain.usecase.dashboard.GetHourlyOccupancyUseCase;
import dev.angelcorzo.nivo.domain.usecase.dashboard.GetParkingsComparisonUseCase;
import dev.angelcorzo.nivo.domain.usecase.dashboard.dtos.DashboardSummaryDTO;
import dev.angelcorzo.nivo.domain.usecase.dashboard.dtos.HourlyOccupancyDTO;
import dev.angelcorzo.nivo.domain.usecase.dashboard.dtos.ParkingComparisonDTO;
import dev.angelcorzo.nivo.infrastructure.adapter.metrics.BackendOperationsMetricsManager;
import dev.angelcorzo.nivo.infrastructure.entrypoint.rest.exception.ExceptionHandlerController;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
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
@WebMvcTest(DashboardController.class)
@AutoConfigureMockMvc(addFilters = false)
@ContextConfiguration(classes = {DashboardController.class, ExceptionHandlerController.class})
@ExtendWith(MockitoExtension.class)
class DashboardControllerTest {

  @Autowired
  private MockMvc mockMvc;

  @MockitoBean
  private GetDashboardSummaryUseCase summaryUseCase;

  @MockitoBean
  private GetHourlyOccupancyUseCase hourlyUseCase;

  @MockitoBean
  private GetParkingsComparisonUseCase comparisonUseCase;

  @MockitoBean
  private BackendOperationsMetricsManager metricsManager;

  @Test
  @DisplayName("GET /api/v1/dashboard/summary con parkingId retorna datos específicos de esa sede")
  void shouldReturnSingleParkingSummaryWhenParkingIdProvided() throws Exception {
    final UUID parkingId = UUID.randomUUID();

    final DashboardSummaryDTO mockSummary = DashboardSummaryDTO.builder()
        .scope("SINGLE")
        .parkingId(parkingId)
        .totalCapacity(150)
        .occupiedSlots(108)
        .availableSlots(42)
        .occupancyRate(72.0)
        .todayRevenue(new BigDecimal("145000.00"))
        .currency("COP")
        .build();

    when(summaryUseCase.execute(parkingId)).thenReturn(mockSummary);

    mockMvc.perform(get("/api/v1/dashboard/summary").param("parkingId", parkingId.toString()))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.scope").value("SINGLE"))
        .andExpect(jsonPath("$.parkingId").value(parkingId.toString()))
        .andExpect(jsonPath("$.occupancyRate").value(72.0))
        .andExpect(jsonPath("$.totalCapacity").value(150));
  }

  @Test
  @DisplayName("GET /api/v1/dashboard/summary sin parkingId retorna el consolidado global del tenant")
  void shouldReturnGlobalSummaryWhenParkingIdOmitted() throws Exception {
    final DashboardSummaryDTO globalSummary = DashboardSummaryDTO.builder()
        .scope("GLOBAL")
        .parkingId(null)
        .totalCapacity(350)
        .occupiedSlots(200)
        .availableSlots(150)
        .occupancyRate(57.14)
        .todayRevenue(new BigDecimal("500000.00"))
        .currency("COP")
        .build();

    when(summaryUseCase.execute(null)).thenReturn(globalSummary);

    mockMvc.perform(get("/api/v1/dashboard/summary"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.scope").value("GLOBAL"))
        .andExpect(jsonPath("$.parkingId").doesNotExist())
        .andExpect(jsonPath("$.totalCapacity").value(350))
        .andExpect(jsonPath("$.todayRevenue").value(500000.00));
  }

  @Test
  @DisplayName("GET /api/v1/dashboard/occupancy-hourly retorna serie de tiempo")
  void shouldReturnHourlyOccupancySeries() throws Exception {
    final UUID parkingId = UUID.randomUUID();
    final List<HourlyOccupancyDTO> series = List.of(
        HourlyOccupancyDTO.builder()
            .parkingId(parkingId)
            .hourBucket(OffsetDateTime.now())
            .checkins(10L)
            .checkouts(5L)
            .totalCapacity(50L)
            .occupancyRate(20.0)
            .build());

    when(hourlyUseCase.execute(eq(parkingId), any(), any())).thenReturn(series);

    mockMvc.perform(get("/api/v1/dashboard/occupancy-hourly").param("parkingId", parkingId.toString()))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$", hasSize(1)))
        .andExpect(jsonPath("$[0].checkins").value(10))
        .andExpect(jsonPath("$[0].occupancyRate").value(20.0));
  }

  @Test
  @DisplayName("GET /api/v1/dashboard/parkings-comparison retorna lista ordenada de sedes con sus métricas")
  void shouldReturnParkingsComparisonList() throws Exception {
    final List<ParkingComparisonDTO> comparisonList = List.of(
        ParkingComparisonDTO.builder().parkingId(UUID.randomUUID()).parkingName("Sede Centro").occupancyRate(75.0).todayRevenue(new BigDecimal("300000")).build(),
        ParkingComparisonDTO.builder().parkingId(UUID.randomUUID()).parkingName("Sede Norte").occupancyRate(40.0).todayRevenue(new BigDecimal("150000")).build()
    );

    when(comparisonUseCase.execute(any(), any())).thenReturn(comparisonList);

    mockMvc.perform(get("/api/v1/dashboard/parkings-comparison"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$", hasSize(2)))
        .andExpect(jsonPath("$[0].parkingName").value("Sede Centro"))
        .andExpect(jsonPath("$[0].occupancyRate").value(75.0))
        .andExpect(jsonPath("$[1].parkingName").value("Sede Norte"));
  }

  @Test
  @DisplayName("Seguridad multi-tenant: solicitar parkingId ajeno retorna 404 vía ParkingNotExistsException")
  void shouldRejectCrossTenantParkingAccess() throws Exception {
    final UUID foreignParking = UUID.randomUUID();
    when(summaryUseCase.execute(foreignParking))
        .thenThrow(new ParkingNotExistsException(foreignParking));

    mockMvc.perform(get("/api/v1/dashboard/summary").param("parkingId", foreignParking.toString()))
        .andExpect(status().isNotFound());
  }
}
