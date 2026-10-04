package dev.angelcorzo.nivo.infrastructure.entrypoint.rest.dashboard.sse;

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
@RequestMapping("/dashboard")
@Tag(name = "Dashboard Stream", description = "Server-Sent Events reactive metrics streaming")
@RequiredArgsConstructor
public class DashboardStreamController {

  private final DashboardSseRegistry sseRegistry;

  @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
  @Operation(summary = "Subscribe to SSE dashboard updates", description = "Dual-scope SSE streaming: single facility if parkingId provided, else consolidated global tenant stream")
  public SseEmitter subscribe(@RequestParam(required = false) final UUID parkingId) {
    return sseRegistry.createEmitter(parkingId);
  }
}
