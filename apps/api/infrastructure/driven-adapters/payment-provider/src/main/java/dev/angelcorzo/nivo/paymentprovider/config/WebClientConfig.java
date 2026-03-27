package dev.angelcorzo.nivo.paymentprovider.config;

import dev.angelcorzo.nivo.paymentprovider.context.ProviderAuthenticationContext;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.web.reactive.function.client.ClientRequest;
import org.springframework.web.reactive.function.client.ExchangeFilterFunction;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@Configuration
@RequiredArgsConstructor
public class WebClientConfig {
  private final PaymentProviderProperties paymentProviderProperties;
  private final ProviderAuthenticationContext providerAuthenticationContext;

  @Bean
  public WebClient webClient() {
    return WebClient.builder()
        .baseUrl(this.paymentProviderProperties.getUrl())
        .filter(this.authFilter())
        .build();
  }

  ExchangeFilterFunction authFilter() {
    return ExchangeFilterFunction.ofRequestProcessor(
        clientRequest -> {
          ClientRequest authenticatedRequest =
              ClientRequest.from(clientRequest)
                  .headers(
                      httpHeaders ->
                          httpHeaders.set(
                              HttpHeaders.AUTHORIZATION,
                              "Bearer "
                                  + this.providerAuthenticationContext.getAuthToken().block()))
                  .build();
          return Mono.just(authenticatedRequest);
        });
  }
}
