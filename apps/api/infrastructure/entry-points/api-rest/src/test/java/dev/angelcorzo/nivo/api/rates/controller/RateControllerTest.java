package dev.angelcorzo.nivo.api.rates.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import dev.angelcorzo.nivo.api.rates.dto.RatesDTO;
import dev.angelcorzo.nivo.api.rates.dto.UpdateRate;
import dev.angelcorzo.nivo.api.rates.enums.RateMessages;
import dev.angelcorzo.nivo.api.rates.mappers.RatesMapper;
import dev.angelcorzo.nivo.model.rates.Rates;
import dev.angelcorzo.nivo.model.rates.enums.TimeUnitsRate;
import dev.angelcorzo.nivo.model.rates.enums.VehicleType;
import dev.angelcorzo.nivo.usecase.calculaterate.CalculateRateUseCase;
import dev.angelcorzo.nivo.usecase.calculaterate.dtos.PriceDetailed;
import dev.angelcorzo.nivo.usecase.deleterate.DeleteRateUseCase;
import dev.angelcorzo.nivo.usecase.updaterate.UpdateRateUseCase;
import java.math.BigDecimal;
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
@WebMvcTest(RateController.class)
@AutoConfigureMockMvc(addFilters = false)
@ContextConfiguration(classes = RateController.class)
@ExtendWith(MockitoExtension.class)
@DisplayName("RateController Unit Tests")
class RateControllerTest {

  @Autowired private MockMvc mockMvc;

  private final ObjectMapper objectMapper = new ObjectMapper().findAndRegisterModules();

  @MockitoBean private RatesMapper ratesMapper;
  @MockitoBean private UpdateRateUseCase updateRateUseCase;
  @MockitoBean private DeleteRateUseCase deleteRateUseCase;
  @MockitoBean private CalculateRateUseCase calculateRateUseCase;

  @Test
  @DisplayName("GET /rates/{ticketId}/calculate - Should calculate ticket price")
  void shouldCalculatePrice() throws Exception {
    UUID ticketId = UUID.randomUUID();
    PriceDetailed price = PriceDetailed.of("Standard Rate");

    when(calculateRateUseCase.execute(ticketId)).thenReturn(price);

    mockMvc
        .perform(get("/rates/{ticketId}/calculate", ticketId))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.message").value(RateMessages.CALCULATE_PRICE.format()));
  }

  @Test
  @DisplayName("PUT /rates/update - Should update tariff rate")
  void shouldUpdateRate() throws Exception {
    UUID rateId = UUID.randomUUID();
    UpdateRate request =
        UpdateRate.builder()
            .id(rateId)
            .name("Day Rate")
            .description("Daytime rate")
            .pricePerUnit(BigDecimal.valueOf(5000))
            .timeUnit(TimeUnitsRate.HOURS)
            .minChargeTimeMinutes("15")
            .vehicleType(VehicleType.CAR)
            .build();

    UpdateRateUseCase.UpdateRate domainCommand = mock(UpdateRateUseCase.UpdateRate.class);
    Rates updatedRate = Rates.builder().id(rateId).build();
    RatesDTO responseDto = mock(RatesDTO.class);

    when(ratesMapper.toModel(any(UpdateRate.class))).thenReturn(domainCommand);
    when(updateRateUseCase.execute(domainCommand)).thenReturn(updatedRate);
    when(ratesMapper.toDTO(updatedRate)).thenReturn(responseDto);

    mockMvc
        .perform(
            put("/rates/update")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.message").value(RateMessages.UPDATED_RATE_SUCCESSFULLY.format()));
  }

  @Test
  @DisplayName("DELETE /rates/{id}/delete - Should delete rate")
  void shouldDeleteRate() throws Exception {
    UUID rateId = UUID.randomUUID();

    mockMvc
        .perform(delete("/rates/{id}/delete", rateId))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.message").value(RateMessages.DELETE_RATE_SUCCESSFULLY.format()));

    verify(deleteRateUseCase).execute(rateId);
  }
}
