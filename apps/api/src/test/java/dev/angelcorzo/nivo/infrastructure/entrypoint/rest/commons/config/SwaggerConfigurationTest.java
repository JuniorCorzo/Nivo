package dev.angelcorzo.nivo.infrastructure.entrypoint.rest.commons.config;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import io.swagger.v3.oas.models.OpenAPI;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@TestPropertySource(properties = {"spring.flyway.enabled=false"})
class SwaggerConfigurationTest {

  @Autowired
  private OpenAPI openAPI;

  @Autowired
  private MockMvc mockMvc;

  @Test
  @DisplayName("OpenAPI debe configurar Bearer Authentication y extensión pre-request para Scalar")
  void shouldConfigureBearerAuthAndScalarPreRequestExtension() {
    // 1. Esquema de seguridad
    assertThat(openAPI.getComponents().getSecuritySchemes()).containsKey("Bearer Authentication");

    // 2. Extensión OpenAPI para pre-request script de Scalar
    assertThat(openAPI.getInfo().getExtensions()).containsKey("x-scalar-pre-request");

    final String preRequestScript = openAPI.getInfo().getExtensions().get("x-scalar-pre-request").toString();
    assertThat(preRequestScript).contains("/api/auth/login");
    assertThat(preRequestScript).doesNotContain("/api/v1/auth/login");
    assertThat(preRequestScript).contains("Bearer");
  }

  @Test
  @DisplayName("Debe generar especificación OpenAPI v3 en /v3/api-docs")
  void shouldGenerateOpenApiDocs() throws Exception {
    final String openApiJson = this.mockMvc
      .perform(get("/v3/api-docs"))
      .andExpect(status().isOk())
      .andReturn()
      .getResponse()
      .getContentAsString();

    assertThat(openApiJson).contains("/public/simulator/calculate");
  }
}
