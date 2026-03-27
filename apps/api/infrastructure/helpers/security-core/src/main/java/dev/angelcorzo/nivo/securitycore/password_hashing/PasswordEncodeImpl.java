package dev.angelcorzo.nivo.securitycore.password_hashing;

import dev.angelcorzo.nivo.model.users.gateways.PasswordEncodeGateway;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * Implementation of the PasswordEncodeGateway using Spring Security's PasswordEncoder.
 * <p>
 * This class acts as an adapter, bridging the domain's {@link PasswordEncodeGateway} interface
 * with the concrete implementation provided by the Spring Security framework. It is responsible
 * for hashing passwords and verifying them against their hashed representation.
 * </p>
 * <p>
 * This adapter is part of the infrastructure layer and depends on the domain layer
 * through the {@link PasswordEncodeGateway} interface, adhering to the Dependency
 * Inversion Principle of Clean Architecture.
 * </p>
 *
 * @author Angel Corzo
 * @version 1.0
 * @since 2025-10-30
 * @see PasswordEncodeGateway
 * @see PasswordEncoder
 */
@Configuration
@RequiredArgsConstructor
public class PasswordEncodeImpl implements PasswordEncodeGateway {

  private final PasswordEncoder passwordEncoder;

  /**
   * {@inheritDoc}
   * <p>
   * This implementation uses the injected {@link PasswordEncoder} to hash the raw password.
   * The specific hashing algorithm (e.g., BCrypt) is determined by the PasswordEncoder bean
   * configured in the application context.
   * </p>
   */
  @Override
  public String encrypt(String rawPassword) {
    return this.passwordEncoder.encode(rawPassword);
  }

  /**
   * {@inheritDoc}
   * <p>
   * This implementation uses the injected {@link PasswordEncoder} to compare a raw password
   * with its encrypted version in a secure manner that prevents timing attacks.
   * </p>
   */
  @Override
  public boolean matches(String rawPassword, String passwordEncrypted) {
    return this.passwordEncoder.matches(rawPassword, passwordEncrypted);
  }
}
