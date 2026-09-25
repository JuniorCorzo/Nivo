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
    Info info =
        new Info()
            .title("Nivo API")
            .version("1.0")
            .description("Multi-tenant Parking Management System API")
            .contact(new Contact().name("Nivo Team"));

    String script =
        """
        // Auto-login to obtain Bearer token for Scalar
        const response = await fetch('/api/v1/auth/login', {
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
        .components(
            new Components()
                .addSecuritySchemes(
                    "Bearer Authentication",
                    new SecurityScheme()
                        .type(SecurityScheme.Type.HTTP)
                        .scheme("bearer")
                        .bearerFormat("JWT"))
                .addSecuritySchemes(
                    "refreshToken",
                    new SecurityScheme()
                        .type(SecurityScheme.Type.APIKEY)
                        .in(SecurityScheme.In.COOKIE)
                        .name("refreshToken")))
        .addSecurityItem(new SecurityRequirement().addList("Bearer Authentication"))
        .info(info);
  }
}
