package dev.angelcorzo.nivo.infrastructure.entrypoint.rest.publicapi;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import dev.angelcorzo.nivo.domain.usecase.dashboard.GetPublicParkingAvailabilityUseCase;
import dev.angelcorzo.nivo.domain.usecase.dashboard.dtos.PublicParkingAvailabilityDTO;
import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@TestPropertySource(properties = {"spring.flyway.enabled=false"})
class PublicAvailabilityControllerTest {

  @Autowired
  private MockMvc mockMvc;

  @MockitoBean
  private GetPublicParkingAvailabilityUseCase availabilityUseCase;

  @Test
  @DisplayName("Endpoint público no requiere cabecera Authorization y devuelve JSON sanitizado sin datos privados")
  void shouldReturnSanitizedAvailabilityWithoutAuth() throws Exception {
    final UUID parkingId = UUID.randomUUID();
    final PublicParkingAvailabilityDTO dto = PublicParkingAvailabilityDTO.builder()
        .parkingId(parkingId)
        .parkingName("Sede Central")
        .totalSlots(100)
        .availableSlots(40)
        .occupiedSlots(60)
        .timestamp(OffsetDateTime.now())
        .build();

    when(availabilityUseCase.execute(parkingId)).thenReturn(Optional.of(dto));

    mockMvc.perform(get("/public/parkings/" + parkingId + "/availability")
            .with(request -> {
              request.setRemoteAddr("10.0.0.1");
              return request;
            }))
        .andExpect(status().isOk())
        .andExpect(header().string("Cache-Control", org.hamcrest.Matchers.containsString("max-age=30")))
        .andExpect(header().string("Cache-Control", org.hamcrest.Matchers.containsString("public")))
        .andExpect(jsonPath("$.parkingId").value(parkingId.toString()))
        .andExpect(jsonPath("$.parkingName").value("Sede Central"))
        .andExpect(jsonPath("$.totalSlots").value(100))
        .andExpect(jsonPath("$.availableSlots").value(40))
        .andExpect(jsonPath("$.occupiedSlots").value(60))
        .andExpect(jsonPath("$.tenantId").doesNotExist())
        .andExpect(jsonPath("$.revenue").doesNotExist())
        .andExpect(jsonPath("$.tickets").doesNotExist());
  }

  @Test
  @DisplayName("Parqueadero inexistente retorna HTTP 404")
  void shouldReturn404ForNonExistentParking() throws Exception {
    final UUID nonExistent = UUID.randomUUID();
    when(availabilityUseCase.execute(nonExistent)).thenReturn(Optional.empty());

    mockMvc.perform(get("/public/parkings/" + nonExistent + "/availability")
            .with(request -> {
              request.setRemoteAddr("10.0.0.2");
              return request;
            }))
        .andExpect(status().isNotFound());
  }

  @Test
  @DisplayName("Exceder tasa de 60 req/min genera HTTP 429 con Retry-After")
  void shouldReturn429WhenRateLimitExceeded() throws Exception {
    final UUID parkingId = UUID.randomUUID();
    final PublicParkingAvailabilityDTO dto = PublicParkingAvailabilityDTO.builder()
        .parkingId(parkingId)
        .parkingName("Sede Rate Limit")
        .totalSlots(50)
        .availableSlots(20)
        .occupiedSlots(30)
        .timestamp(OffsetDateTime.now())
        .build();

    when(availabilityUseCase.execute(parkingId)).thenReturn(Optional.of(dto));

    final String clientIp = "192.168.100.50";

    // Consumir 60 peticiones
    for (int i = 0; i < 60; i++) {
      mockMvc.perform(get("/public/parkings/" + parkingId + "/availability")
              .with(request -> {
                request.setRemoteAddr(clientIp);
                return request;
              }))
          .andExpect(status().isOk());
    }

    // Petición 61 debe ser 429
    mockMvc.perform(get("/public/parkings/" + parkingId + "/availability")
            .with(request -> {
              request.setRemoteAddr(clientIp);
              return request;
            }))
        .andExpect(status().isTooManyRequests())
        .andExpect(header().exists("Retry-After"))
        .andExpect(header().string("X-RateLimit-Remaining", "0"));
  }
}
