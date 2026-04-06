package dev.angelcorzo.nivo.api.commons.config;

import io.swagger.v3.oas.annotations.enums.SecuritySchemeIn;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import io.swagger.v3.oas.annotations.security.SecuritySchemes;
import org.springframework.context.annotation.Configuration;

@Configuration
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
