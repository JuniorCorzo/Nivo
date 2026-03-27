package dev.angelcorzo.nivo.paymentprovider;

public class SignatureInvalid extends RuntimeException {
  public SignatureInvalid() {
    super("");
  }

  public SignatureInvalid(String message) {
    super(message);
  }
}
