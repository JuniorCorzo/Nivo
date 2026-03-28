package dev.angelcorzo.nivo.model.payments.enums;

public enum PaymentsMethods {
  EFFECTIVE(false),
  PAY_LINK(true);

  private final boolean isProviderMethod;

  PaymentsMethods(boolean isProviderMethod) {
    this.isProviderMethod = isProviderMethod;
  }

  public boolean isProviderMethod() {
    return isProviderMethod;
  }
}
