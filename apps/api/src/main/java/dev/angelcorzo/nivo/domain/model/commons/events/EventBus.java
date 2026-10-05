package dev.angelcorzo.nivo.domain.model.commons.events;

import java.util.concurrent.CompletableFuture;

public interface EventBus {
  CompletableFuture<Void> publish(Event event);
}
