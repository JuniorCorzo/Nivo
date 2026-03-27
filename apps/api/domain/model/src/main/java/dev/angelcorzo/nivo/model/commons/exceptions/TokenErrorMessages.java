package dev.angelcorzo.nivo.model.commons.exceptions;

import lombok.Getter;

/**
 * Enumeration of standardized error messages related to JWT token validation.
 *
 * <p>This enum provides a centralized and type-safe way to manage error messages for token-related
 * exceptions. Using an enum prevents inconsistencies and typos that can arise from using string
 * literals directly in the code.
 *
 * @author Angel Corzo
 * @version 1.0
 * @since 2025-10-29
 */
@Getter
public enum TokenErrorMessages {

  /**
   * Error message for tokens that are structurally invalid or malformed. This typically means the
   * token does not have the correct three-part structure.
   */
  MALFORMED_TOKEN("Formato de token invalido"),

  /**
   * Error message for tokens that are invalid for reasons other than expiration or malformation,
   * such as an invalid signature or unsupported algorithm.
   */
  INVALID_TOKEN("Token invalido"),

  /**
   * Error message for tokens that have expired. This is determined by checking the token's 'exp'
   * (expiration time) claim.
   */
  EXPIRED_TOKEN("Token expirado");

  private final String message;

  /**
   * Constructor for the enum.
   *
   * @param message the error message associated with the enum constant.
   */
  TokenErrorMessages(String message) {
    this.message = message;
  }
}
