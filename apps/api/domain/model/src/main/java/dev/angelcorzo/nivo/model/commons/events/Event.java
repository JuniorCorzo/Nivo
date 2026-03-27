package dev.angelcorzo.nivo.model.commons.events;

import java.time.LocalDateTime;

public interface Event {
  String event();

  LocalDateTime occurredAt();
}
