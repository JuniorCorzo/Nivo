package dev.angelcorzo.nivo.paymentprovider.utils;

import dev.angelcorzo.nivo.model.commons.result.Result;
import dev.angelcorzo.nivo.model.payments.exceptions.PaymentError;
import dev.angelcorzo.nivo.paymentprovider.dtos.EpaycoConfirmationDTO;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

public final class EpaycoSignature {
  private EpaycoSignature() {}

  public static Result<String, PaymentError> validatedSignature(
      EpaycoConfirmationDTO confirmation, String publicKey) {
    final String signatureRaw =
        String.join(
            "^",
            format(confirmation.clienteIdCliente()),
            format(publicKey),
            format(confirmation.refPayco()),
            format(confirmation.transactionId()),
            format(confirmation.amount().toString()),
            format(confirmation.currencyCode()));

    final String signature = EpaycoSignature.sha256Hex(signatureRaw);
    if (!confirmation.signature().equalsIgnoreCase(signature))
      return Result.failure(new PaymentError.ProviderValidation("La firma no es válida"));

    return Result.success(signature);
  }

  private static String sha256Hex(String rawSignature) {
    try {
      MessageDigest messageDigest = MessageDigest.getInstance("sha256");
      byte[] digest = messageDigest.digest(rawSignature.getBytes(StandardCharsets.UTF_8));
      StringBuilder hexString = new StringBuilder(digest.length * 2);
      for (byte b : digest) hexString.append(String.format("%02x", b));

      return hexString.toString();
    } catch (NoSuchAlgorithmException e) {
      throw new IllegalStateException("SHA-256 not available", e);
    }
  }

  private static String format(String s) {
    return s == null ? "" : s.trim();
  }
}
