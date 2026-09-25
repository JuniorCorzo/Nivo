package dev.angelcorzo.nivo.infrastructure.entrypoint.rest.reports;

import static org.hamcrest.Matchers.containsString;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import dev.angelcorzo.nivo.domain.model.authentication.gateway.AuthenticationContextGateway;
import dev.angelcorzo.nivo.domain.usecase.dashboard.GetOperationalReportUseCase;
import dev.angelcorzo.nivo.domain.usecase.dashboard.dtos.OperationalReportDTO;
import dev.angelcorzo.nivo.infrastructure.adapter.metrics.BackendOperationsMetricsManager;
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
@WebMvcTest(ReportsController.class)
@AutoConfigureMockMvc(addFilters = false)
@ContextConfiguration(classes = ReportsController.class)
@ExtendWith(MockitoExtension.class)
class ReportsControllerTest {

  @Autowired
  private MockMvc mockMvc;

  @MockitoBean
  private GetOperationalReportUseCase reportUseCase;

  @MockitoBean
  private AuthenticationContextGateway authContextGateway;

  @MockitoBean
  private BackendOperationsMetricsManager metricsManager;

  @Test
  @DisplayName("GET /api/v1/reports/operational/csv debe emitir stream CSV con cabeceras correctas y columnas requeridas")
  void shouldStreamCsvWithCorrectHeadersAndFormat() throws Exception {
    final UUID tenantId = UUID.randomUUID();
    when(authContextGateway.getCurrentTenantId()).thenReturn(tenantId);

    final OperationalReportDTO sampleReport = OperationalReportDTO.builder()
        .ticketId(UUID.randomUUID())
        .licensePlate("ABC-123")
        .slotNumber("10")
        .slotType("CAR")
        .entryTime(OffsetDateTime.now())
        .exitTime(OffsetDateTime.now())
        .durationMinutes(60.0)
        .ticketStatus("CLOSED")
        .totalToCharge(new BigDecimal("10000"))
        .paymentMethod("EFFECTIVE")
        .parkingName("Sede Centro")
        .build();

    when(reportUseCase.executeForExport(eq(tenantId), any())).thenReturn(List.of(sampleReport));

    mockMvc.perform(get("/api/v1/reports/operational/csv"))
        .andExpect(status().isOk())
        .andExpect(header().string("Content-Type", "text/csv;charset=UTF-8"))
        .andExpect(header().string("Content-Disposition", containsString("attachment; filename=\"operational-report-")))
        .andExpect(content().string(containsString("Ticket ID,Placa,Plaza,Tipo,Entrada,Salida,Minutos,Estado,Total,Metodo Pago,Sede")))
        .andExpect(content().string(containsString("ABC-123")))
        .andExpect(content().string(containsString("Sede Centro")));
  }
}
