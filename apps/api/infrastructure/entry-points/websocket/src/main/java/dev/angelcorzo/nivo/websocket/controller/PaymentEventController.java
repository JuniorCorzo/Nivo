package dev.angelcorzo.nivo.websocket.controller;

import dev.angelcorzo.nivo.model.payments.observer.PaymentEventBroker;
import dev.angelcorzo.nivo.websocket.publisher.PaymentEventObservable;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class PaymentEventController {
  private final PaymentEventBroker paymentEventBroker;
  private final SimpMessagingTemplate template;

  @MessageMapping("/payments.info/{paymentId}")
  void status(@DestinationVariable("paymentId") String paymentId) {

    PaymentEventObservable observable =
        new PaymentEventObservable(UUID.fromString(paymentId), template);

    paymentEventBroker.subscribe(paymentId, observable);
  }
}
