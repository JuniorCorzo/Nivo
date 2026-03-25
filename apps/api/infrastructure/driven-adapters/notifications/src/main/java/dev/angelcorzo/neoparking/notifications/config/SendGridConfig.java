package dev.angelcorzo.neoparking.notifications.config;

import com.sendgrid.SendGrid;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@RequiredArgsConstructor
public class SendGridConfig {
  private static final int SENDGRID_RATE_LIMIT_RETRIES = 3;
  private static final int SENDGRID_RATE_LIMIT_SLEEP_MILLIS = 1_000;

  private final SendGridProperties sendGridProperties;

  @Bean
  public SendGrid sendGrid() {
    final SendGrid sendGrid = new SendGrid(sendGridProperties.getApiKey());
    sendGrid.setRateLimitRetry(SENDGRID_RATE_LIMIT_RETRIES);
    sendGrid.setRateLimitSleep(SENDGRID_RATE_LIMIT_SLEEP_MILLIS);

    return sendGrid;
  }
}
