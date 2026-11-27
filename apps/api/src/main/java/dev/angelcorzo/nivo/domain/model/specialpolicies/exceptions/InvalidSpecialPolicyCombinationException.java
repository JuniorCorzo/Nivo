package dev.angelcorzo.nivo.domain.model.specialpolicies.exceptions;

import dev.angelcorzo.nivo.domain.model.commons.exceptions.AppException;
import dev.angelcorzo.nivo.domain.model.specialpolicies.enums.ModifiesTypes;
import dev.angelcorzo.nivo.domain.model.specialpolicies.enums.OperationsTypes;

public class InvalidSpecialPolicyCombinationException extends AppException {
  private static final int STATUS = 400;
  private static final String CODE = "INVALID_SPECIAL_POLICY_COMBINATION";

  public InvalidSpecialPolicyCombinationException(ModifiesTypes modifies, OperationsTypes operation) {
    super(
      String.format("Unsupported special policy combination: modifies=%s, operation=%s", modifies, operation),
      STATUS,
      CODE);
  }
}
