package dev.angelcorzo.nivo.api.config;

import static org.assertj.core.api.Assertions.assertThat;

import dev.angelcorzo.nivo.api.commons.config.CorsConfig;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.core.Ordered;
import org.springframework.web.filter.CorsFilter;

@DisplayName("CorsConfig Tests")
class CorsConfigTest {

  private CorsConfig corsConfig;

  @BeforeEach
  void setUp() {
    corsConfig = new CorsConfig();
  }

  @Test
  @DisplayName("Should create CorsFilter bean with highest precedence and configured origins")
  void shouldCreateCorsFilterWithHighestPrecedence() {
    String origins = "http://localhost:4200,https://app.nivo.dev";

    FilterRegistrationBean<CorsFilter> registrationBean = corsConfig.corsFilter(origins);

    assertThat(registrationBean).isNotNull();
    assertThat(registrationBean.getFilter()).isNotNull();
    assertThat(registrationBean.getOrder()).isEqualTo(Ordered.HIGHEST_PRECEDENCE);
  }
}
