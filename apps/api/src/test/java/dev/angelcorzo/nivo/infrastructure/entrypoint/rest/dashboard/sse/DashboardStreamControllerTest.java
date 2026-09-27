package dev.angelcorzo.nivo.infrastructure.entrypoint.rest.dashboard.sse;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

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
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@ActiveProfiles("test")
@WebMvcTest(DashboardStreamController.class)
@AutoConfigureMockMvc(addFilters = false)
@ContextConfiguration(classes = DashboardStreamController.class)
@ExtendWith(MockitoExtension.class)
class DashboardStreamControllerTest {

  @Autowired
  private MockMvc mockMvc;

  @MockitoBean
  private DashboardSseRegistry sseRegistry;

  @Test
  @DisplayName("GET /dashboard/stream sin parkingId suscribe stream SSE global del tenant")
  void shouldSubscribeGlobalTenantSseStream() throws Exception {
    final SseEmitter emitter = new SseEmitter();

    when(sseRegistry.createEmitter((UUID) null)).thenReturn(emitter);

    mockMvc.perform(get("/dashboard/stream")
            .accept(MediaType.TEXT_EVENT_STREAM_VALUE))
        .andExpect(status().isOk());

    verify(sseRegistry).createEmitter((UUID) null);
  }

  @Test
  @DisplayName("GET /dashboard/stream con parkingId suscribe stream SSE de sede puntual")
  void shouldSubscribeSingleParkingSseStream() throws Exception {
    final UUID parkingId = UUID.randomUUID();
    final SseEmitter emitter = new SseEmitter();

    when(sseRegistry.createEmitter(parkingId)).thenReturn(emitter);

    mockMvc.perform(get("/dashboard/stream")
            .param("parkingId", parkingId.toString())
            .accept(MediaType.TEXT_EVENT_STREAM_VALUE))
        .andExpect(status().isOk());

    verify(sseRegistry).createEmitter(parkingId);
  }
}
