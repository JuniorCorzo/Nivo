package dev.angelcorzo.neoparking.jpa.config;

import lombok.Builder;
import lombok.Getter;

/**
 * Represents database connection secrets (URL, username, password).
 *
 * <p>This class is a simple data holder for sensitive database credentials, typically populated
 * from environment variables or configuration files.
 *
 * <p><strong>Layer:</strong> Infrastructure (Driven Adapter - JPA Config)
 *
 * <p><strong>Responsibility:</strong> To encapsulate database connection details.
 *
 * @author Angel Corzo
 * @since 1.0.0
 */
@Builder
@Getter
public class DBSecret {
  /** The JDBC URL for the database connection. */
  private final String url;

  /** The username for database authentication. */
  private final String username;

  /** The password for database authentication. */
  private final String password;
}
