package dev.angelcorzo.nivo.infrastructure.adapter.notifications.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Data
@Configuration
@ConfigurationProperties(prefix = "nivo.notification.email.brevo")
public class BrevoProperties {
  private String apiKey = "xkeysib-dev-key";
  private String url = "https://api.brevo.com/v3";
  private String senderName = "Nivo";
  private String senderEmail = "noreply@nivo.dev";
  private Integer connectTimeout = 5000;
  private Integer readTimeout = 10000;
}
