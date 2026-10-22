package dev.angelcorzo.nivo.infrastructure.entrypoint.rest.publicapi;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.math.BigDecimal;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import dev.angelcorzo.nivo.domain.model.rates.enums.TimeUnitsRate;
import dev.angelcorzo.nivo.domain.model.rates.enums.VehicleType;
import dev.angelcorzo.nivo.domain.usecase.rate.SimulateRateUseCase;
import dev.angelcorzo.nivo.domain.usecase.rate.dtos.PriceDetailed;
import dev.angelcorzo.nivo.domain.usecase.rate.dtos.PriceLine;
import dev.angelcorzo.nivo.domain.usecase.rate.dtos.SimulateRateCommand;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@TestPropertySource(properties = {"spring.flyway.enabled=false"})
class PublicSimulatorControllerTest {

  @Autowired
  private MockMvc mockMvc;

  @MockitoBean
  private SimulateRateUseCase simulateRateUseCase;

  @Test
  @DisplayName("POST /public/simulator/calculate should be publicly accessible without authentication")
  void shouldCalculateRateWithoutAuth() throws Exception {
    final PriceDetailed priceDetailed = PriceDetailed.of("Simulador Nivo");
    priceDetailed.addLine(
      PriceLine.of("Tarifa CAR (2 Horas * 4000 COP/Horas)", new BigDecimal("8000.00")));
    priceDetailed.setIvaRate(new BigDecimal("0.19"));

    when(this.simulateRateUseCase.execute(any())).thenReturn(priceDetailed);

    final String payload = """
      {
        "vehicleType": "CAR",
        "minutesStayed": 90,
        "pricePerUnit": 4000.00,
        "timeUnit": "HOURS",
        "gracePeriodMinutes": 15,
        "ivaRate": 0.19
      }
      """;

    this.mockMvc
      .perform(
        post("/public/simulator/calculate")
          .contentType(MediaType.APPLICATION_JSON)
          .content(payload))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.name").value("Simulador Nivo"))
      .andExpect(jsonPath("$.subtotal").value(8000.00))
      .andExpect(jsonPath("$.ivaAmount").value(1520.00))
      .andExpect(jsonPath("$.total").value(9520.00))
      .andExpect(jsonPath("$.breakpoints").isArray())
      .andExpect(
        jsonPath("$.breakpoints[0].concept")
          .value("Tarifa CAR (2 Horas * 4000 COP/Horas)"))
      .andExpect(jsonPath("$.breakpoints[0].amount").value(8000.00));

    final ArgumentCaptor<SimulateRateCommand> captor = ArgumentCaptor.forClass(SimulateRateCommand.class);
    verify(this.simulateRateUseCase).execute(captor.capture());

    final SimulateRateCommand command = captor.getValue();
    assertNotNull(command);
    assertEquals(VehicleType.CAR, command.vehicleType());
    assertEquals(90L, command.minutesStayed());
    assertEquals(new BigDecimal("4000.00"), command.pricePerUnit());
    assertEquals(TimeUnitsRate.HOURS, command.timeUnit());
    assertEquals(15, command.gracePeriodMinutes());
    assertEquals(new BigDecimal("0.19"), command.ivaRate());
  }
}
