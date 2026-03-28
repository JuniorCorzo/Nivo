package dev.angelcorzo.nivo.securitycore.jwt.config;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.security.KeyFactory;
import java.security.NoSuchAlgorithmException;
import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;
import java.security.spec.InvalidKeySpecException;
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.Resource;

/**
 * Configuration class for JWT RSA keys.
 * <p>
 * This class is responsible for loading and parsing RSA private and public keys from PEM files,
 * making them available as Spring beans for use in JWT generation and validation.
 * It centralizes the key management logic for the security module.
 * </p>
 *
 * @author Angel Corzo
 * @version 1.0
 * @since 2025-10-30
 * @see RSAProperties
 * @see RSAPrivateKey
 * @see RSAPublicKey
 */
@Configuration
@RequiredArgsConstructor
public class JwtConfiguration {

  private final RSAProperties rsaProperties;

  /**
   * Creates an {@link RSAPrivateKey} bean from the configured PEM file.
   * <p>
   * This method loads the private key from the resource specified in {@link RSAProperties},
   * parses the PEM content, and generates an {@code RSAPrivateKey} instance.
   * </p>
   *
   * @return the parsed {@link RSAPrivateKey}.
   * @throws IOException if there is an error reading the key file.
   * @throws NoSuchAlgorithmException if the RSA algorithm is not available.
   * @throws InvalidKeySpecException if the key specification is invalid.
   */
  @Bean
  public RSAPrivateKey privateKey() throws IOException, NoSuchAlgorithmException, InvalidKeySpecException {
    String privateKeyContent =
        this.loadKeyContent(rsaProperties.getPrivateKey())
            .replace("-----BEGIN PRIVATE KEY-----", "")
            .replace("-----END PRIVATE KEY-----", "")
            .replaceAll("\\s", "");

    byte[] decode = Base64.getDecoder().decode(privateKeyContent);
    PKCS8EncodedKeySpec keySpec = new PKCS8EncodedKeySpec(decode);
    KeyFactory keyFactory = KeyFactory.getInstance("RSA");

    return (RSAPrivateKey) keyFactory.generatePrivate(keySpec);
  }

  /**
   * Creates an {@link RSAPublicKey} bean from the configured PEM file.
   * <p>
   * This method loads the public key from the resource specified in {@link RSAProperties},
   * parses the PEM content, and generates an {@code RSAPublicKey} instance.
   * </p>
   *
   * @return the parsed {@link RSAPublicKey}.
   * @throws IOException if there is an error reading the key file.
   * @throws NoSuchAlgorithmException if the RSA algorithm is not available.
   * @throws InvalidKeySpecException if the key specification is invalid.
   */
  @Bean
  public RSAPublicKey publicKey() throws IOException, NoSuchAlgorithmException, InvalidKeySpecException {
    String publicKeyContent =
        this.loadKeyContent(rsaProperties.getPublicKey())
            .replace("-----BEGIN PUBLIC KEY-----", "")
            .replace("-----END PUBLIC KEY-----", "")
            .replaceAll("\\s", "");

    byte[] decode = Base64.getDecoder().decode(publicKeyContent);
    X509EncodedKeySpec keySpec = new X509EncodedKeySpec(decode);
    KeyFactory keyFactory = KeyFactory.getInstance("RSA");

    return (RSAPublicKey) keyFactory.generatePublic(keySpec);
  }

  /**
   * Loads the content of a key file from a {@link Resource}.
   *
   * @param resource the resource representing the key file.
   * @return the content of the file as a string.
   * @throws IOException if there is an error reading the resource.
   */
  private String loadKeyContent(Resource resource) throws IOException {
    try (InputStream inputStream = resource.getInputStream();
        BufferedReader reader = new BufferedReader(new InputStreamReader(inputStream))) {
      return reader.lines().collect(Collectors.joining("\n"));
    }
  }
}
