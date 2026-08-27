package dev.angelcorzo.nivo.websocket.listeners;

import static org.mockito.Mockito.*;

import dev.angelcorzo.nivo.model.payments.observer.PaymentEventBroker;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.messaging.Message;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.MessageBuilder;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;
import org.springframework.web.socket.messaging.SessionSubscribeEvent;
import org.springframework.web.socket.messaging.SessionUnsubscribeEvent;

@DisplayName("PaymentSubscriptionEventListener Unit Tests")
class PaymentSubscriptionEventListenerTest {

  private PaymentEventBroker broker;
  private PaymentSubscriptionEventListener listener;

  @BeforeEach
  void setUp() {
    broker = mock(PaymentEventBroker.class);
    listener = new PaymentSubscriptionEventListener(broker);
  }

  @Test
  @DisplayName("Should handle subscribe, unsubscribe and disconnect lifecycle")
  void shouldHandleSubscriptionLifecycle() {
    String sessionId = "session-123";
    String subId = "sub-1";
    UUID paymentId = UUID.randomUUID();

    // Subscribe
    StompHeaderAccessor subAccessor = StompHeaderAccessor.create(StompCommand.SUBSCRIBE);
    subAccessor.setSessionId(sessionId);
    subAccessor.setSubscriptionId(subId);
    subAccessor.setDestination("/topic/payment/" + paymentId);
    Message<byte[]> subMessage = MessageBuilder.createMessage(new byte[0], subAccessor.getMessageHeaders());
    SessionSubscribeEvent subEvent = new SessionSubscribeEvent(this, subMessage);

    listener.handleSessionSubscribe(subEvent);

    // Unsubscribe
    StompHeaderAccessor unsubAccessor = StompHeaderAccessor.create(StompCommand.UNSUBSCRIBE);
    unsubAccessor.setSessionId(sessionId);
    unsubAccessor.setSubscriptionId(subId);
    Message<byte[]> unsubMessage = MessageBuilder.createMessage(new byte[0], unsubAccessor.getMessageHeaders());
    SessionUnsubscribeEvent unsubEvent = new SessionUnsubscribeEvent(this, unsubMessage);

    listener.handleSessionUnsubscribe(unsubEvent);
    verify(broker).unsubscribe(paymentId.toString());

    // Disconnect
    StompHeaderAccessor discAccessor = StompHeaderAccessor.create(StompCommand.DISCONNECT);
    discAccessor.setSessionId(sessionId);
    Message<byte[]> discMessage = MessageBuilder.createMessage(new byte[0], discAccessor.getMessageHeaders());
    SessionDisconnectEvent discEvent = new SessionDisconnectEvent(this, discMessage, sessionId, null);

    listener.handleSessionDisconnect(discEvent);
  }
}
