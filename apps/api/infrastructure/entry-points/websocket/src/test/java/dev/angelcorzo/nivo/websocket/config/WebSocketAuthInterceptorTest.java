package dev.angelcorzo.nivo.websocket.config;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

import dev.angelcorzo.nivo.model.authentication.gateway.AuthenticationGateway;
import dev.angelcorzo.nivo.model.users.UserAuthentication;
import dev.angelcorzo.nivo.model.users.enums.Roles;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.MessageBuilder;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;

@DisplayName("WebSocketAuthInterceptor Unit Tests")
class WebSocketAuthInterceptorTest {

  private AuthenticationGateway authenticationGateway;
  private WebSocketAuthInterceptor interceptor;
  private MessageChannel messageChannel;

  @BeforeEach
  void setUp() {
    authenticationGateway = mock(AuthenticationGateway.class);
    interceptor = new WebSocketAuthInterceptor(authenticationGateway);
    messageChannel = mock(MessageChannel.class);
  }

  @Test
  @DisplayName("Should authenticate WebSocket CONNECT frame when token is valid")
  void shouldAuthenticateValidConnectFrame() {
    UUID userId = UUID.randomUUID();
    UUID tenantId = UUID.randomUUID();
    String token = "valid.jwt.token";

    StompHeaderAccessor accessor = StompHeaderAccessor.create(StompCommand.CONNECT);
    accessor.setLeaveMutable(true);
    accessor.setNativeHeader("Authorization", "Bearer " + token);
    Message<?> message = MessageBuilder.createMessage(new byte[0], accessor.getMessageHeaders());

    when(authenticationGateway.extractTokenClaims(token))
        .thenReturn(
            Map.of(
                "sub", userId.toString(),
                "tenantId", tenantId.toString(),
                "role", "ROLE_MANAGER"));

    Message<?> result = interceptor.preSend(message, messageChannel);

    assertThat(result).isNotNull();
    StompHeaderAccessor resultAccessor = StompHeaderAccessor.wrap(result);
    assertThat(resultAccessor.getUser()).isInstanceOf(UsernamePasswordAuthenticationToken.class);

    UsernamePasswordAuthenticationToken auth =
        (UsernamePasswordAuthenticationToken) resultAccessor.getUser();
    UserAuthentication userAuth = (UserAuthentication) auth.getPrincipal();
    assertThat(userAuth.userId()).isEqualTo(userId);
    assertThat(userAuth.tenantId()).isEqualTo(tenantId);
    assertThat(userAuth.role()).isEqualTo(Roles.MANAGER);
    verify(authenticationGateway).validateToken(token);
  }

  @Test
  @DisplayName("Should throw exception when Authorization header is missing on CONNECT")
  void shouldThrowWhenMissingAuthHeader() {
    StompHeaderAccessor accessor = StompHeaderAccessor.create(StompCommand.CONNECT);
    Message<?> message = MessageBuilder.createMessage(new byte[0], accessor.getMessageHeaders());

    assertThatThrownBy(() -> interceptor.preSend(message, messageChannel))
        .isInstanceOf(IllegalArgumentException.class)
        .hasMessage("Missing Authorization header");
  }

  @Test
  @DisplayName("Should throw exception when Authorization header format is invalid")
  void shouldThrowWhenInvalidAuthHeaderFormat() {
    StompHeaderAccessor accessor = StompHeaderAccessor.create(StompCommand.CONNECT);
    accessor.setNativeHeader("Authorization", "Basic user:pass");
    Message<?> message = MessageBuilder.createMessage(new byte[0], accessor.getMessageHeaders());

    assertThatThrownBy(() -> interceptor.preSend(message, messageChannel))
        .isInstanceOf(IllegalArgumentException.class)
        .hasMessage("Invalid Authorization header format");
  }

  @Test
  @DisplayName("Should throw exception when required claims are missing")
  void shouldThrowWhenClaimsMissing() {
    String token = "jwt.missing.claims";
    StompHeaderAccessor accessor = StompHeaderAccessor.create(StompCommand.CONNECT);
    accessor.setNativeHeader("Authorization", "Bearer " + token);
    Message<?> message = MessageBuilder.createMessage(new byte[0], accessor.getMessageHeaders());

    when(authenticationGateway.extractTokenClaims(token))
        .thenReturn(Map.of("sub", UUID.randomUUID().toString()));

    assertThatThrownBy(() -> interceptor.preSend(message, messageChannel))
        .isInstanceOf(IllegalArgumentException.class)
        .hasMessage("JWT missing required claims");
  }

  @Test
  @DisplayName("Should pass non-CONNECT messages through without authentication")
  void shouldPassNonConnectMessages() {
    StompHeaderAccessor accessor = StompHeaderAccessor.create(StompCommand.SEND);
    Message<?> message = MessageBuilder.createMessage(new byte[0], accessor.getMessageHeaders());

    Message<?> result = interceptor.preSend(message, messageChannel);

    assertThat(result).isSameAs(message);
    verifyNoInteractions(authenticationGateway);
  }
}
