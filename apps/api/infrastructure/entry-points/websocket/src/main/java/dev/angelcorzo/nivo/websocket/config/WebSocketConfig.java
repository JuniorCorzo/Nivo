package dev.angelcorzo.nivo.websocket.config;

import dev.angelcorzo.nivo.websocket.config.decorators.StompFrameNormalizeDecorator;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketTransportRegistration;

/**
 * Configuración de WebSocket con autenticación JWT.
 *
 * <p>Esta configuración habilita STOMP sobre WebSocket/SockJS y registra un interceptor para
 * validar tokens JWT en las conexiones entrantes.
 */
@Configuration
@EnableWebSocketMessageBroker
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

  private final WebSocketAuthInterceptor webSocketAuthInterceptor;

  @Override
  public void registerStompEndpoints(StompEndpointRegistry registry) {
    registry.addEndpoint("/ws", "/payments").setAllowedOrigins("*");
  }

  @Override
  public void configureMessageBroker(MessageBrokerRegistry registry) {
    registry.enableSimpleBroker("/topic");
    registry.setApplicationDestinationPrefixes("/app");
  }

  @Override
  public void configureWebSocketTransport(WebSocketTransportRegistration registry) {
    registry.addDecoratorFactory(StompFrameNormalizeDecorator::new);
  }

  /**
   * Registra el interceptor de autenticación JWT para validar las conexiones WebSocket.
   *
   * @param registration El registro de canal donde se añade el interceptor
   */
  @Override
  public void configureClientInboundChannel(ChannelRegistration registration) {
    registration.interceptors(webSocketAuthInterceptor);
  }
}
