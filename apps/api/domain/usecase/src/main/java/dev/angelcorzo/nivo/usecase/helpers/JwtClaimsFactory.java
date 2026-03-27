package dev.angelcorzo.nivo.usecase.helpers;

import dev.angelcorzo.nivo.model.users.Users;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import lombok.AccessLevel;
import lombok.NoArgsConstructor;

/**
 * Factory class for creating JWT (JSON Web Token) claims.
 *
 * <p>This utility class provides a centralized way to construct the claims maps for different types
 * of tokens, such as access tokens and refresh tokens. It ensures consistency in the claims that
 * are included in each token and abstracts the creation logic away from the use cases that generate
 * tokens.
 *
 * <p>The class is non-instantiable and all its methods are static.
 *
 * @author Angel Corzo
 * @version 1.0
 * @since 2025-10-29
 */
@NoArgsConstructor(access = AccessLevel.PRIVATE)
public class JwtClaimsFactory {

  /** JWT ID claim. Provides a unique identifier for the token. */
  private static final String JTI = "jti";

  /** Subject claim. Identifies the principal that is the subject of the JWT. */
  private static final String SUB = "sub";

  /** Custom claim for the tenant ID. */
  private static final String TENANT_ID = "tenantId";

  /** Custom claim for the user's email address. */
  private static final String EMAIL = "email";

  /** Custom claim to differentiate the purpose of the token (e.g., access-token, refresh-token). */
  private static final String PURPOSE = "purpose";

  /** Custom claim for the user's full name. */
  private static final String FULL_NAME = "fullName";

  /** Custom claim for the user's role. */
  private static final String ROLE = "role";

  /**
   * Builds the claims for a standard access token.
   *
   * <p>Access tokens are intended for accessing protected resources and contain detailed user
   * information such as full name and role.
   *
   * @param user the user for whom the token is being created.
   * @return a map of claims for the access token.
   */
  public static Map<String, String> buildAccessTokenClaims(Users user) {
    Map<String, String> claims = buildBaseClaims(user);
    claims.put(FULL_NAME, user.getFullName());
    claims.put(ROLE, String.format("ROLE_%s", user.getRole().name()));
    claims.put(PURPOSE, "access-token");
    return claims;
  }

  /**
   * Builds the claims for a refresh token.
   *
   * <p>Refresh tokens are used to obtain new access tokens and contain a minimal set of claims to
   * identify the user and the token's purpose.
   *
   * @param user the user for whom the token is being created.
   * @return a map of claims for the refresh token.
   */
  public static Map<String, String> buildRefreshTokenClaims(Users user) {
    Map<String, String> claims = buildBaseClaims(user);
    claims.put(PURPOSE, "refresh-token");
    return claims;
  }

  /**
   * Builds the base set of claims common to all token types.
   *
   * <p>This includes essential information such as the token ID (jti), subject (user ID), tenant
   * ID, and email.
   *
   * @param user the user for whom the token is being created.
   * @return a map of base claims.
   */
  private static Map<String, String> buildBaseClaims(Users user) {
    Map<String, String> claims = new HashMap<>();
    claims.put(JTI, UUID.randomUUID().toString());
    claims.put(SUB, user.getId().toString());
    claims.put(TENANT_ID, user.getTenant().id().toString());
    claims.put(EMAIL, user.getEmail());
    return claims;
  }
}
