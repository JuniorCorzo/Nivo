package dev.angelcorzo.nivo.domain.model.tenants.exceptions;

import dev.angelcorzo.nivo.domain.model.commons.exceptions.AppException;
import dev.angelcorzo.nivo.domain.model.commons.exceptions.ErrorMessagesModel;

public class AccountCreationDisabledException extends AppException {
  private static final int STATUS = 403;
  private static final String CODE = "ACCOUNT_CREATION_DISABLED";

  public AccountCreationDisabledException() {
    super(ErrorMessagesModel.ACCOUNT_CREATION_DISABLED.toString(), STATUS, CODE);
  }
}
