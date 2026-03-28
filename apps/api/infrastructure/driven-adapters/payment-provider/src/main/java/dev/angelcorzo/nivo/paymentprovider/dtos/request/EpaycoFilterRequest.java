package dev.angelcorzo.nivo.paymentprovider.dtos.request;

import java.util.Map;

public record EpaycoFilterRequest(Map<String, String> filter) {
  public EpaycoFilterRequest(String key, String value) {
    this(Map.of(key, value));
  }

  public EpaycoFilterRequest addFilter(String key, String value) {
    this.filter.put(key, value);
    return this;
  }
}
