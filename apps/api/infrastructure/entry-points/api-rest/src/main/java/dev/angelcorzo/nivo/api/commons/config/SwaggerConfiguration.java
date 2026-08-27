package dev.angelcorzo.nivo.api.commons.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeIn;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Contact;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import io.swagger.v3.oas.annotations.security.SecuritySchemes;
import org.springframework.context.annotation.Configuration;

@Configuration
@OpenAPIDefinition(
    info =
        @Info(
            title = "Nivo API",
            version = "1.0",
            description = "Multi-tenant Parking Management System API",
            contact = @Contact(name = "Nivo Team")),
    security = {@SecurityRequirement(name = "Bearer Authentication")})
@SecuritySchemes(
    value = {
      @SecurityScheme(
          name = "refreshToken",
          type = SecuritySchemeType.APIKEY,
          in = SecuritySchemeIn.COOKIE,
          paramName = "refreshToken"),
      @SecurityScheme(
          name = "Bearer Authentication",
          type = SecuritySchemeType.HTTP,
          scheme = "bearer",
          bearerFormat = "JWT")
    })
public class SwaggerConfiguration {}

