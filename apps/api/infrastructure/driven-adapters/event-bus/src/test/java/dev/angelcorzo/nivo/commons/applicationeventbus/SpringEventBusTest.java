package dev.angelcorzo.nivo.commons.applicationeventbus;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;

import dev.angelcorzo.nivo.model.commons.events.Event;
import java.time.LocalDateTime;
import java.util.concurrent.CompletableFuture;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;

@ExtendWith(MockitoExtension.class)
@DisplayName("SpringEventBus Unit Tests")
class SpringEventBusTest {

  @Mock private ApplicationEventPublisher applicationEventPublisher;

  @InjectMocks private SpringEventBus springEventBus;

  @Test
  @DisplayName("Should publish event asynchronously through ApplicationEventPublisher")
  void shouldPublishEvent() {
    Event event = new Event() {
      @Override
      public String event() {
        return "TEST_EVENT";
      }

      @Override
      public LocalDateTime occurredAt() {
        return LocalDateTime.now();
      }
    };

    CompletableFuture<Void> future = springEventBus.publish(event);
    future.join();

    assertThat(future).isCompleted();
    verify(applicationEventPublisher).publishEvent(event);
  }
}
