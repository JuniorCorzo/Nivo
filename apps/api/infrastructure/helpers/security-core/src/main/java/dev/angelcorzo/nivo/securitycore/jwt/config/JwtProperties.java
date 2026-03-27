package dev.angelcorzo.nivo.securitycore.jwt.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * Type-safe configuration properties for JWT generation and validation.
 * <p>
 * This class maps properties prefixed with {@code jwt} from the application's
 * configuration files (e.g., {@code application.yaml}) into a structured
 * Java object. It provides a secure and convenient way to manage JWT settings.
 * </p>
 *
 * @author Angel Corzo
 * @version 1.0
 * @since 2025-10-30
 */
@Data
@Configuration
@ConfigurationProperties(prefix = "jwt")
public class JwtProperties {

  /**
   * The issuer of the JWT.
   * <p>
   * This value is used for the {@code iss} claim in the JWT, identifying the
   * principal that issued the token.
   * </p>
   */
  private String issue;

  /**
   * The expiration time for access tokens, in seconds.
   * <p>
   * This value determines the validity duration of a generated access token.
   * </p>
   */
  private long accessTokenExpiration;

  /**
   * The expiration time for refresh tokens, in seconds.
   * <p>
   * This value determines the validity duration of a generated refresh token.
   * </p>
   */
  private long refreshTokenExpiration;

  /**
   * The secret key used for signing JWTs.
   * <p>
   * This key should be kept confidential and is used in HMAC-based signature
   * algorithms. For RSA, this field may not be used directly.
   * </p>
   */
  private String secretKey;
}
