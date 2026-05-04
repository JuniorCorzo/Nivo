package dev.angelcorzo.nivo.paymentprovider.context;

import dev.angelcorzo.nivo.paymentprovider.config.PaymentProviderProperties;
import dev.angelcorzo.nivo.paymentprovider.dtos.response.LoginDTO;
import dev.angelcorzo.nivo.paymentprovider.exceptions.ProviderAuthenticationException;
import jakarta.annotation.PostConstruct;
import java.time.Duration;
import java.time.LocalTime;
import java.util.concurrent.TimeUnit;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Scope;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.core.publisher.Mono;
import reactor.util.retry.Retry;

@Component
@Scope("singleton")
@RequiredArgsConstructor
@Slf4j
public class ProviderAuthenticationContext {
  private final PaymentProviderProperties providerProperties;

  private String authToken;
  private LocalTime tokenExpirationTime;

  @PostConstruct
  public void initializeAuthToken() {
    this.authenticate();
  }

  public Mono<String> getAuthToken() {
    if (this.authToken == null || LocalTime.now().isAfter(this.tokenExpirationTime))
      this.authenticate();

    return Mono.justOrEmpty(this.authToken).switchIfEmpty(this.requestLogin());
  }

  private Mono<String> requestLogin() {
    try {
      return WebClient.create(this.providerProperties.getUrl())
          .post()
          .uri("/login")
          .headers(
              h ->
                  h.setBasicAuth(
                      this.providerProperties.getPublicKey(),
                      this.providerProperties.getPrivateKey()))
          .retrieve()
          .onStatus(
              status -> status.value() == 401,
              response -> {
                log.error("Error authenticating with payment provider: {}", response.statusCode());
                return Mono.error(new ProviderAuthenticationException("Unauthorized", 401));
              })
          .onStatus(
              status -> status.value() == 400,
              _ -> Mono.error(new ProviderAuthenticationException("Provider Bad Credentials", 400)))
          .bodyToMono(LoginDTO.class)
          .retryWhen(
              Retry.fixedDelay(3, Duration.ofSeconds(5))
                  .filter(
                      exception ->
                          exception instanceof WebClientResponseException
                              && ((WebClientResponseException) exception)
                                  .getStatusCode()
                                  .is5xxServerError()))
          .map(LoginDTO::token);

    } catch (WebClientResponseException e) {
      log.error("Error authenticating with payment provider: {}", e.getStatusCode());
      throw new ProviderAuthenticationException("Authentication failed: " + e.getStatusCode(), e.getStatusCode().value(), e);
    } catch (ProviderAuthenticationException e) {
      log.error("Unexpected error during authentication: {}", e.getMessage());
      throw e;
    }
  }

  @Scheduled(timeUnit = TimeUnit.MINUTES, fixedDelayString = "${payment.provider.expiration-time}")
  private void authenticate() {
    log.info("Authenticating with payment provider...");

    this.requestLogin()
        .doOnSuccess(
            token -> {
              this.authToken = token;
              this.tokenExpirationTime =
                  LocalTime.now().plusMinutes(this.providerProperties.getExpirationTime());

              log.info(
                  "Successfully authenticated with payment provider. Token expires at: {}",
                  this.tokenExpirationTime);
            })
        .doOnError(
            error ->
                log.error("Failed to authenticate with payment provider: {}", error.getMessage()))
        .subscribe();
  }
}
