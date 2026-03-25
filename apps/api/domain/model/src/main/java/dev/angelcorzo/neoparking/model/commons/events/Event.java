package dev.angelcorzo.neoparking.model.commons.events;

import java.time.LocalDateTime;

public interface Event {
  String event();

  LocalDateTime occurredAt();
}
