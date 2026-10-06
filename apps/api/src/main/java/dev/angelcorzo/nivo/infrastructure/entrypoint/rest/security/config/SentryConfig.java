package dev.angelcorzo.nivo.infrastructure.entrypoint.rest.security.config;

import io.sentry.Sentry;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Slf4j
@Configuration
public class SentryConfig {

  @Value("${sentry.dsn:}")
  private String dsn;

  @Value("${sentry.traces-sample-rate:0.2}")
  private Double tracesSampleRate;

  @Value("${sentry.environment:production}")
  private String environment;

  @Value("${sentry.send-default-pii:true}")
  private Boolean sendDefaultPii;

  @PostConstruct
  public void init() {
    if (dsn != null && !dsn.isBlank()) {
      log.info("Initializing Sentry SDK with environment: {}", environment);
      Sentry.init(options -> {
        options.setDsn(dsn);
        options.setTracesSampleRate(tracesSampleRate);
        options.setEnvironment(environment);
        options.setSendDefaultPii(Boolean.TRUE.equals(sendDefaultPii));
      });
    } else {
      log.debug("Sentry DSN is empty, SDK disabled");
    }
  }
}
