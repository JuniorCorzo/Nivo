package dev.angelcorzo.neoparking.commons.applicationeventbus;

import dev.angelcorzo.neoparking.model.commons.events.Event;
import dev.angelcorzo.neoparking.model.commons.events.EventBus;
import java.util.concurrent.CompletableFuture;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class SpringEventBus implements EventBus {
  private final ApplicationEventPublisher applicationEventPublisher;

  @Async
  @Override
  public CompletableFuture<Void> publish(Event event) {
    return CompletableFuture.runAsync(() -> applicationEventPublisher.publishEvent(event));
  }
}
