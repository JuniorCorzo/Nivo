package dev.angelcorzo.nivo.infrastructure.entrypoint.rest.dashboard;

import static org.hamcrest.Matchers.hasSize;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import dev.angelcorzo.nivo.domain.model.authentication.gateway.AuthenticationContextGateway;
import dev.angelcorzo.nivo.domain.usecase.dashboard.GetDashboardSummaryUseCase;
import dev.angelcorzo.nivo.domain.usecase.dashboard.GetHourlyOccupancyUseCase;
import dev.angelcorzo.nivo.domain.usecase.dashboard.GetParkingsComparisonUseCase;
import dev.angelcorzo.nivo.domain.usecase.dashboard.dtos.DashboardSummaryDTO;
import dev.angelcorzo.nivo.domain.usecase.dashboard.dtos.ParkingComparisonDTO;
import dev.angelcorzo.nivo.infrastructure.adapter.metrics.BackendOperationsMetricsManager;
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
@WebMvcTest(DashboardController.class)
@AutoConfigureMockMvc(addFilters = false)
@ContextConfiguration(classes = DashboardController.class)
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
  private AuthenticationContextGateway authContextGateway;

  @MockitoBean
  private BackendOperationsMetricsManager metricsManager;

  @Test
  @DisplayName("GET /api/v1/dashboard/summary con parkingId retorna datos específicos de esa sede")
  void shouldReturnSingleParkingSummaryWhenParkingIdProvided() throws Exception {
    UUID tenantId = UUID.randomUUID();
    UUID parkingId = UUID.randomUUID();
    when(authContextGateway.getCurrentTenantId()).thenReturn(tenantId);

    var mockSummary = DashboardSummaryDTO.builder()
        .scope("SINGLE")
        .parkingId(parkingId)
        .totalCapacity(150)
        .occupiedSlots(108)
        .availableSlots(42)
        .occupancyRate(72.0)
        .todayRevenue(new BigDecimal("145000.00"))
        .currency("COP")
        .build();

    when(summaryUseCase.execute(tenantId, parkingId)).thenReturn(mockSummary);

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
    UUID tenantId = UUID.randomUUID();
    when(authContextGateway.getCurrentTenantId()).thenReturn(tenantId);

    var globalSummary = DashboardSummaryDTO.builder()
        .scope("GLOBAL")
        .parkingId(null)
        .totalCapacity(350)
        .occupiedSlots(200)
        .availableSlots(150)
        .occupancyRate(57.14)
        .todayRevenue(new BigDecimal("500000.00"))
        .currency("COP")
        .build();

    when(summaryUseCase.execute(tenantId, null)).thenReturn(globalSummary);

    mockMvc.perform(get("/api/v1/dashboard/summary"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.scope").value("GLOBAL"))
        .andExpect(jsonPath("$.parkingId").doesNotExist())
        .andExpect(jsonPath("$.totalCapacity").value(350))
        .andExpect(jsonPath("$.todayRevenue").value(500000.00));
  }

  @Test
  @DisplayName("GET /api/v1/dashboard/parkings-comparison retorna lista ordenada de sedes con sus métricas")
  void shouldReturnParkingsComparisonList() throws Exception {
    UUID tenantId = UUID.randomUUID();
    when(authContextGateway.getCurrentTenantId()).thenReturn(tenantId);

    var comparisonList = List.of(
        ParkingComparisonDTO.builder().parkingId(UUID.randomUUID()).parkingName("Sede Centro").occupancyRate(75.0).todayRevenue(new BigDecimal("300000")).build(),
        ParkingComparisonDTO.builder().parkingId(UUID.randomUUID()).parkingName("Sede Norte").occupancyRate(40.0).todayRevenue(new BigDecimal("150000")).build()
    );

    when(comparisonUseCase.execute(eq(tenantId), any(), any())).thenReturn(comparisonList);

    mockMvc.perform(get("/api/v1/dashboard/parkings-comparison"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$", hasSize(2)))
        .andExpect(jsonPath("$[0].parkingName").value("Sede Centro"))
        .andExpect(jsonPath("$[0].occupancyRate").value(75.0))
        .andExpect(jsonPath("$[1].parkingName").value("Sede Norte"));
  }

  @Test
  @DisplayName("Seguridad multi-tenant: solicitar parkingId ajeno retorna 404")
  void shouldRejectCrossTenantParkingAccess() throws Exception {
    UUID tenantA = UUID.randomUUID();
    UUID foreignParking = UUID.randomUUID();
    when(authContextGateway.getCurrentTenantId()).thenReturn(tenantA);
    when(summaryUseCase.execute(tenantA, foreignParking))
        .thenThrow(new IllegalArgumentException("Parking lot does not belong to tenant"));

    mockMvc.perform(get("/api/v1/dashboard/summary").param("parkingId", foreignParking.toString()))
        .andExpect(status().isNotFound());
  }
}
