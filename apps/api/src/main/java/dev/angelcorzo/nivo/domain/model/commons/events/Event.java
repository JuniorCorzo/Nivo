package dev.angelcorzo.nivo.domain.model.commons.events;

import java.time.LocalDateTime;

public interface Event {
  String event();

  LocalDateTime occurredAt();
}
