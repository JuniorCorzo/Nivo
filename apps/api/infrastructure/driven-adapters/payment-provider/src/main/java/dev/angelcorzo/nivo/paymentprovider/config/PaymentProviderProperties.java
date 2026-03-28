package dev.angelcorzo.nivo.paymentprovider.config;

import lombok.*;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Data
@Configuration
@ConfigurationProperties(prefix = "payment.provider")
public class PaymentProviderProperties {
  private String providerName;
  private String url;
  private String publicKey;
  private String privateKey;
  private Integer expirationTime;
  private String confirmationUrl;
  private String confirmationMethod;
}
