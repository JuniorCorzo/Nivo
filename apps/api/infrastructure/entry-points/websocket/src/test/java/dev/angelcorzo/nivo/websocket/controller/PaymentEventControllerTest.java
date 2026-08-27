package dev.angelcorzo.nivo.websocket.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

import dev.angelcorzo.nivo.model.payments.observer.PaymentEventBroker;
import dev.angelcorzo.nivo.websocket.publisher.PaymentEventObservable;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.messaging.simp.SimpMessagingTemplate;

@DisplayName("PaymentEventController Unit Tests")
class PaymentEventControllerTest {

  private PaymentEventBroker paymentEventBroker;
  private SimpMessagingTemplate template;
  private PaymentEventController controller;

  @BeforeEach
  void setUp() {
    paymentEventBroker = mock(PaymentEventBroker.class);
    template = mock(SimpMessagingTemplate.class);
    controller = new PaymentEventController(paymentEventBroker, template);
  }

  @Test
  @DisplayName("Should subscribe observable to payment event broker")
  void shouldSubscribeToPaymentEventBroker() {
    UUID paymentId = UUID.randomUUID();

    controller.status(paymentId.toString());

    verify(paymentEventBroker).subscribe(eq(paymentId.toString()), any(PaymentEventObservable.class));
  }
}
