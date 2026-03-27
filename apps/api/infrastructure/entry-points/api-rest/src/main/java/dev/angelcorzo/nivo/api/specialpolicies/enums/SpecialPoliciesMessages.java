package dev.angelcorzo.nivo.api.specialpolicies.enums;

import dev.angelcorzo.nivo.api.commons.enums.BaseMessages;

public enum SpecialPoliciesMessages implements BaseMessages {
  CREATE_SPECIAL_POLICY("Política especial creada con éxito"),
  SHOW_SPECIAL_POLICIES_BY_TENANT("Políticas especiales encontradas");
  private final String template;

  SpecialPoliciesMessages(String template) {
    this.template = template;
  }

  @Override
  public String toString() {
    return template;
  }

  @Override
  public String format(Object... args) {
    return String.format(template, args);
  }
}
