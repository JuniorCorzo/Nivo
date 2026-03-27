package dev.angelcorzo.nivo.websocket.config.decorators;

import java.util.Set;
import lombok.extern.slf4j.Slf4j;
import org.jspecify.annotations.NonNull;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.WebSocketMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.WebSocketHandlerDecorator;

@Slf4j
public class StompFrameNormalizeDecorator extends WebSocketHandlerDecorator {
  private static final Set<String> STOMP_COMMANDS =
      Set.of(
          "CONNECT",
          "STOMP",
          "SEND",
          "SUBSCRIBE",
          "UNSUBSCRIBE",
          "BEGIN",
          "COMMIT",
          "ABORT",
          "ACK",
          "NACK",
          "DISCONNECT",
          "MESSAGE",
          "RECEIPT",
          "ERROR");

  public StompFrameNormalizeDecorator(WebSocketHandler delegate) {
    super(delegate);
  }

  @Override
  public void handleMessage(@NonNull WebSocketSession session, @NonNull WebSocketMessage<?> message)
      throws Exception {
    super.handleMessage(session, this.updateFrameIfNeeded(message));
  }

  private WebSocketMessage<?> updateFrameIfNeeded(WebSocketMessage<?> message) {
    if (!(message instanceof TextMessage textMessage)) return message;

    String payload = textMessage.getPayload();
    String normalizedPayload = this.normalizePayload(payload);

    if (normalizedPayload.equals(payload)) return message;

    log.debug("Normalized incoming STOMP frame. payloadLength={}", message.getPayloadLength());
    return new TextMessage(normalizedPayload);
  }

  private String normalizePayload(String payload) {
    String normalized = payload;

    if (looksLikeEscapedStompFrame(payload)) {
      // Some clients send the full STOMP frame escaped as one string.
      normalized = normalized.replace("\\r\\n", "\n").replace("\\n", "\n").replace("\\r", "\n");
    }

    normalized = normalized.replace("\\\\u0000", "\u0000");
    normalized = normalized.replace("\\\\0", "\0");

    normalized = normalized.replace("\\u0000", "\u0000");
    normalized = normalized.replace("\\x00", "\u0000");
    normalized = normalized.replace("\\0", "\0");

    return normalized;
  }

  private boolean looksLikeEscapedStompFrame(String payload) {
    int firstSeparator = payload.indexOf('\\');
    if (firstSeparator < 0) return false;

    String command = payload.substring(0, firstSeparator);
    if (!STOMP_COMMANDS.contains(command)) return false;

    return payload.startsWith("\\n", firstSeparator) || payload.startsWith("\\r", firstSeparator);
  }
}
