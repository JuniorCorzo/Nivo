package dev.angelcorzo.nivo.infrastructure.adapter.payment.config;

import dev.angelcorzo.nivo.infrastructure.adapter.payment.context.ProviderAuthenticationContext;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.web.reactive.function.client.ClientRequest;
import org.springframework.web.reactive.function.client.ExchangeFilterFunction;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@Configuration
@ConditionalOnProperty(name = "payment.enabled", havingValue = "true", matchIfMissing = true)
@RequiredArgsConstructor
public class WebClientConfig {
  private final PaymentProviderProperties paymentProviderProperties;
  private final ProviderAuthenticationContext providerAuthenticationContext;

  @Bean
  public WebClient webClient() {
    return WebClient.builder().baseUrl(this.paymentProviderProperties.getUrl()).filter(this.authFilter()).build();
  }

  ExchangeFilterFunction authFilter() {
    return ExchangeFilterFunction.ofRequestProcessor(clientRequest -> {
      ClientRequest authenticatedRequest = ClientRequest.from(clientRequest)
        .headers(httpHeaders -> httpHeaders
          .set(HttpHeaders.AUTHORIZATION, "Bearer " + this.providerAuthenticationContext.getAuthToken().block()))
        .build();
      return Mono.just(authenticatedRequest);
    });
  }
}
