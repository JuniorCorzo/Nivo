package dev.angelcorzo.nivo.infrastructure.entrypoint.rest.commons.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfiguration {

  @Bean
  public OpenAPI customOpenAPI() {
    final String description = """
      Multi-tenant Parking Management System API

      ### Real-Time WebSocket / STOMP Endpoints
      * **Endpoints**: `/ws`, `/payments`
      * **Protocol**: STOMP over WebSocket
      * **Subscription Topic**: `/topic/payments/{paymentId}` (real-time payment status updates)
      * **Authentication**: Pass `Authorization: Bearer <JWT>` header during STOMP `CONNECT` frame.
      * **Manual Testing**: See Bruno collection at `collections/nivo/Payments/Payment Status WebSocket.bru`.
      """;

    final Info info = new Info().title("Nivo API")
      .version("1.0")
      .description(description)
      .contact(new Contact().name("Nivo Team"));

    final String script = """
      // Auto-login to obtain Bearer token for Scalar
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@nivo.dev', password: 'password123' })
      });
      if (response.ok) {
        const data = await response.json();
        const token = data.token || data.accessToken || data.access_token;
        context.setToken('Bearer ' + token);
      }
      """;

    info.addExtension("x-scalar-pre-request", script);

    return new OpenAPI()
      .components(new Components()
        .addSecuritySchemes("Bearer Authentication",
          new SecurityScheme().type(SecurityScheme.Type.HTTP).scheme("bearer").bearerFormat("JWT"))
        .addSecuritySchemes("refreshToken",
          new SecurityScheme().type(SecurityScheme.Type.APIKEY)
            .in(SecurityScheme.In.COOKIE)
            .name("refreshToken")))
      .addSecurityItem(new SecurityRequirement().addList("Bearer Authentication"))
      .info(info);
  }
}
