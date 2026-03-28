package dev.angelcorzo.nivo.websocket.listeners;

import dev.angelcorzo.nivo.model.payments.observer.PaymentEventBroker;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;
import org.springframework.web.socket.messaging.SessionSubscribeEvent;
import org.springframework.web.socket.messaging.SessionUnsubscribeEvent;

@Component
@RequiredArgsConstructor
public class PaymentSubscriptionEventListener {
  private final PaymentEventBroker transactionEventBroker;
  private final ConcurrentHashMap<String, Map<String, String>> subscriptions =
      new ConcurrentHashMap<>();

  @EventListener
  public void handleSessionSubscribe(SessionSubscribeEvent event) {
    StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());

    String destination = accessor.getDestination();
    if (destination == null || !destination.startsWith("/topic/payment/")) {
      return;
    }

    String paymentId = destination.split("/")[2];
    this.subscriptions.putIfAbsent(
        accessor.getSessionId(), Map.of(accessor.getSubscriptionId(), paymentId));
  }

  @EventListener
  public void handleSessionUnsubscribe(SessionUnsubscribeEvent event) {
    StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
    final String sessionId = accessor.getSessionId();
    final String subscriptionId = accessor.getSubscriptionId();

    final boolean hasSession = this.subscriptions.containsKey(sessionId);
    final boolean hasSubscription = this.subscriptions.get(sessionId).containsKey(subscriptionId);

    if (!hasSession || !hasSubscription) return;

    this.transactionEventBroker.unsubscribe(this.subscriptions.get(sessionId).get(subscriptionId));
    this.subscriptions.get(sessionId).remove(subscriptionId);
  }

  @EventListener
  public void handleSessionDisconnect(SessionDisconnectEvent event) {
    StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
    final String sessionId = accessor.getSessionId();

    if (!this.subscriptions.containsKey(sessionId)) return;

    this.subscriptions
        .get(sessionId)
        .forEach(
            (subscriptionId, paymentId) -> {
              this.transactionEventBroker.unsubscribe(paymentId);
            });

    this.subscriptions.remove(sessionId);
  }
}
