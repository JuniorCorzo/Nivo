package dev.angelcorzo.nivo.securitycore.jwt.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.Resource;

/**
 * Type-safe configuration properties for RSA keys used in JWT signing.
 * <p>
 * This class maps properties prefixed with {@code rsa} from the application's
 * configuration files into a structured Java object. It provides a convenient
 * way to manage the locations of RSA public and private key files.
 * </p>
 *
 * @author Angel Corzo
 * @version 1.0
 * @since 2025-10-30
 */
@Data
@Configuration
@ConfigurationProperties(prefix = "rsa")
public class RSAProperties {

  /**
   * The location of the RSA public key file.
   * <p>
   * This resource is used to load the public key for verifying JWT signatures.
   * The value should be a valid Spring resource path (e.g., {@code classpath:keys/public.pem}).
   * </p>
   */
  private Resource publicKey;

  /**
   * The location of the RSA private key file.
   * <p>
   * This resource is used to load the private key for signing JWTs.
   * The value should be a valid Spring resource path (e.g., {@code classpath:keys/private.pem}).
   * </p>
   */
  private Resource privateKey;

  /**
   * The Key ID (kid) for the RSA key pair.
   * <p>
   * This value is included in the JWT header to allow recipients to identify the key
   * that was used to sign the token, which is useful for key rotation scenarios.
   * </p>
   */
  private String keyId;
}
