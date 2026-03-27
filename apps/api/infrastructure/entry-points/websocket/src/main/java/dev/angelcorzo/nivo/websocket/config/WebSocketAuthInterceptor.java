package dev.angelcorzo.nivo.websocket.config;

import dev.angelcorzo.nivo.model.authentication.gateway.AuthenticationGateway;
import dev.angelcorzo.nivo.model.users.UserAuthentication;
import dev.angelcorzo.nivo.model.users.enums.Roles;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;

/**
 * Interceptor para validar tokens JWT en conexiones WebSocket.
 *
 * <p>Intercepta el comando CONNECT de STOMP y valida el token JWT enviado en el header
 * 'Authorization'. Si el token es válido, establece el principal de autenticación en el contexto de
 * Spring Security. Utiliza {@link AuthenticationGateway} para reutilizar la lógica de validación.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class WebSocketAuthInterceptor implements ChannelInterceptor {

  private final AuthenticationGateway authenticationGateway;

  @Override
  public Message<?> preSend(Message<?> message, MessageChannel channel) {
    StompHeaderAccessor accessor =
        MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

    if (accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {
      log.debug("Processing CONNECT command for WebSocket authentication");

      // Extraer el token del header Authorization
      List<String> authHeaders = accessor.getNativeHeader("Authorization");

      if (authHeaders == null || authHeaders.isEmpty()) {
        log.warn("No Authorization header found in WebSocket CONNECT");
        throw new IllegalArgumentException("Missing Authorization header");
      }

      String authHeader = authHeaders.get(0);
      String token = extractToken(authHeader);

      if (token == null) {
        log.warn("Invalid Authorization header format");
        throw new IllegalArgumentException("Invalid Authorization header format");
      }

      try {
        // Validar el token usando AuthenticationGateway
        authenticationGateway.validateToken(token);
        log.debug("JWT validated successfully");

        // Extraer claims del token
        Map<String, String> claims = authenticationGateway.extractTokenClaims(token);

        String userId = claims.get("sub");
        String tenantId = claims.get("tenantId");
        String role = claims.get("role");

        if (userId == null || tenantId == null || role == null) {
          log.warn("JWT is missing required claims");
          throw new IllegalArgumentException("JWT missing required claims");
        }

        // Crear el principal de autenticación
        UserAuthentication userPrincipal =
            UserAuthentication.builder()
                .userId(UUID.fromString(userId))
                .tenantId(UUID.fromString(tenantId))
                .role(Roles.valueOf(Roles.class, role.replace("ROLE_", "").toUpperCase()))
                .build();

        List<SimpleGrantedAuthority> authorities =
            Collections.singletonList(new SimpleGrantedAuthority(role));

        UsernamePasswordAuthenticationToken authentication =
            new UsernamePasswordAuthenticationToken(userPrincipal, null, authorities);

        // Establecer el usuario autenticado en el contexto de Spring Security
        accessor.setUser(authentication);

        log.info(
            "WebSocket connection authenticated for user: {} with role: {}",
            userPrincipal.userId(),
            role);

      } catch (IllegalArgumentException e) {
        log.error("Invalid JWT token: {}", e.getMessage());
        throw e;
      } catch (Exception e) {
        log.error("Error processing JWT token: {}", e.getMessage(), e);
        throw new IllegalArgumentException("Error processing authentication", e);
      }
    }

    return message;
  }

  /**
   * Extrae el token del header Authorization. Soporta formato "Bearer <token>"
   *
   * @param authHeader El valor del header Authorization
   * @return El token JWT o null si el formato es inválido
   */
  private String extractToken(String authHeader) {
    if (authHeader != null && authHeader.startsWith("Bearer ")) {
      return authHeader.substring(7);
    }
    return null;
  }
}
