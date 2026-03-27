package dev.angelcorzo.nivo.securitycore.password_hashing.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.argon2.Argon2PasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * Configuration class for password encoding beans.
 * <p>
 * This class provides the necessary Spring beans for password hashing throughout the application.
 * It centralizes the configuration of the password encoding algorithm, making it easy to
 * update or replace in the future.
 * </p>
 *
 * @author Angel Corzo
 * @version 1.0
 * @since 2025-10-30
 */
@Configuration
public class PasswordBeans {

  /**
   * Provides a {@link PasswordEncoder} bean for the application.
   * <p>
   * This method configures and returns an instance of {@link Argon2PasswordEncoder},
   * which is a strong, modern, and recommended hashing algorithm for password storage.
   * The defaults for Spring Security 5.8 are used to ensure secure and up-to-date parameters.
   * </p>
   *
   * @return a configured {@link PasswordEncoder} instance.
   */
  @Bean
  public PasswordEncoder passwordEncoder() {
    return Argon2PasswordEncoder.defaultsForSpringSecurity_v5_8();
  }
}
