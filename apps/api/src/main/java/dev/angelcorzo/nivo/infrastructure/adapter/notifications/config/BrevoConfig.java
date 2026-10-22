package dev.angelcorzo.nivo.infrastructure.adapter.notifications.config;

import java.time.Duration;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestClient;

@Configuration
@RequiredArgsConstructor
public class BrevoConfig {

  private final BrevoProperties brevoProperties;

  @Bean(name = "brevoRestClient")
  public RestClient brevoRestClient() {
    final SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
    requestFactory.setConnectTimeout(
      Duration.ofMillis(this.brevoProperties.getConnectTimeout()));
    requestFactory.setReadTimeout(
      Duration.ofMillis(this.brevoProperties.getReadTimeout()));

    return RestClient.builder()
      .baseUrl(this.brevoProperties.getUrl())
      .defaultHeader("api-key", this.brevoProperties.getApiKey())
      .defaultHeader(HttpHeaders.ACCEPT, MediaType.APPLICATION_JSON_VALUE)
      .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
      .requestFactory(requestFactory)
      .build();
  }
}
