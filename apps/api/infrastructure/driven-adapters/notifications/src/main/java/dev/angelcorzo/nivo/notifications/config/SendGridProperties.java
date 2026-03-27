package dev.angelcorzo.nivo.notifications.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Data
@Configuration
@ConfigurationProperties(prefix = "sendgrid")
public class SendGridProperties {
  private String apiKey;
  private String fromEmail;
}
