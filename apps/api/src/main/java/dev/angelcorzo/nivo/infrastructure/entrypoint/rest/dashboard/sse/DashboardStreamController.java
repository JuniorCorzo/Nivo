package dev.angelcorzo.nivo.infrastructure.entrypoint.rest.dashboard.sse;

import dev.angelcorzo.nivo.domain.model.authentication.gateway.AuthenticationContextGateway;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@RestController
@RequestMapping({"/api/v1/dashboard", "/dashboard", "/v1/dashboard"})
@Tag(name = "Dashboard Stream", description = "Server-Sent Events reactive metrics streaming")
@RequiredArgsConstructor
public class DashboardStreamController {

  private final DashboardSseRegistry sseRegistry;
  private final AuthenticationContextGateway authenticationContext;

  @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
  @Operation(summary = "Subscribe to SSE dashboard updates", description = "Dual-scope SSE streaming: single facility if parkingId provided, else consolidated global tenant stream")
  public SseEmitter subscribe(@RequestParam(required = false) UUID parkingId) {
    UUID tenantId = authenticationContext.getCurrentTenantId();
    return sseRegistry.createEmitter(tenantId, parkingId);
  }
}
