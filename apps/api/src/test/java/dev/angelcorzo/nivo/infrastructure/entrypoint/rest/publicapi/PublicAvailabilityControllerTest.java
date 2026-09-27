package dev.angelcorzo.nivo.infrastructure.entrypoint.rest.publicapi;

import static org.assertj.core.api.Assertions.assertThat;
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
import org.springframework.test.web.servlet.MvcResult;

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
    boolean rateLimitHit = false;

    // Consumir el bucket (60 req/min) de forma tolerante a tiempos de ejecución lentos en CI.
    // Se itera hasta alcanzar 429 (ocurre normalmente entre la petición 61 y 65 si se rellenan tokens).
    for (int i = 1; i <= 70; i++) {
      final MvcResult result =
          mockMvc
              .perform(
                  get("/public/parkings/" + parkingId + "/availability")
                      .with(
                          request -> {
                            request.setRemoteAddr(clientIp);
                            return request;
                          }))
              .andReturn();

      final int status = result.getResponse().getStatus();
      if (status == 429) {
        rateLimitHit = true;
        assertThat(i).isGreaterThanOrEqualTo(61);
        assertThat(result.getResponse().getHeader("Retry-After")).isNotNull();
        assertThat(result.getResponse().getHeader("X-RateLimit-Remaining")).isEqualTo("0");
        assertThat(result.getResponse().getContentAsString())
            .contains("Rate limit of 60 requests per minute exceeded");
        break;
      }
      assertThat(status).isEqualTo(200);
    }

    assertThat(rateLimitHit).isTrue();
  }
}
