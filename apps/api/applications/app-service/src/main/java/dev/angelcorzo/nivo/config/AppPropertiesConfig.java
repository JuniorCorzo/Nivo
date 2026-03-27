package dev.angelcorzo.nivo.config;

import dev.angelcorzo.nivo.model.commons.valueobjects.AppProperties;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app")
public class AppPropertiesConfig extends AppProperties {

  public AppPropertiesConfig(
      String currency,
      String ctaUrl,
      String companyName,
      String supportUrl,
      String socialUrl,
      String unsubscribeUrl,
      String addressCompany) {
    super(currency, ctaUrl, companyName, supportUrl, socialUrl, unsubscribeUrl, addressCompany);
  }
}
