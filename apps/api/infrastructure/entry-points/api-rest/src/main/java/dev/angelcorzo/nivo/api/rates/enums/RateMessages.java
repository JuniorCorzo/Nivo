package dev.angelcorzo.nivo.api.rates.enums;

import dev.angelcorzo.nivo.api.commons.enums.BaseMessages;

public enum RateMessages implements BaseMessages {
  SHOW_RATES_BY_TENANT("Tarifas encontradas"),
  CALCULATE_PRICE("Precio calculado"),
  RATE_CONFIGURATED_SUCCESSFULLY("Tarifa configurada con éxito"),
  UPDATED_RATE_SUCCESSFULLY("Tarifa actualizada con éxito"),
  DELETE_RATE_SUCCESSFULLY("Tarifa eliminada con éxito");

  private final String template;

  RateMessages(String template) {
    this.template = template;
  }

  @Override
  public String format(Object... args) {
    return "";
  }
}
