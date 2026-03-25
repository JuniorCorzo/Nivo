package dev.angelcorzo.neoparking.model.commons.valueobjects;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public abstract class AppProperties {
  private String currency;
  private String ctaUrl;
  private String companyName;
  private String supportUrl;
  private String socialUrl;
  private String unsubscribeUrl;
  private String addressCompany;
}
