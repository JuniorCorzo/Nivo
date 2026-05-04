package dev.angelcorzo.nivo.model.specialpolicies.exceptions;

import dev.angelcorzo.nivo.model.commons.exceptions.ErrorMessagesModel;
import java.util.UUID;

import dev.angelcorzo.nivo.model.commons.exceptions.AppException;

public class SpecialPolicyNotFoundException extends AppException {
  private static final int STATUS = 404;
  private static final String CODE = "SPECIAL_POLICY_NOT_FOUND";

  public SpecialPolicyNotFoundException(UUID specialPolicyId) {
    super(ErrorMessagesModel.SPECIAL_POLICY_NOT_FOUNT.format(specialPolicyId), STATUS, CODE);
  }
}
