package dev.angelcorzo.nivo.infrastructure.security.jwt.config;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.core.env.Environment;
import org.springframework.core.io.Resource;

@DisplayName("JwtConfiguration Unit Tests")
class JwtConfigurationTest {

  @Test
  @DisplayName("Should generate matching ephemeral RSA keys when PEM files do not exist in dev/local")
  void shouldGenerateMatchingEphemeralKeysWhenFilesDoNotExistInDev() throws Exception {
    RSAProperties rsaProperties = mock(RSAProperties.class);
    Resource missingResource = mock(Resource.class);
    when(missingResource.exists()).thenReturn(false);
    when(rsaProperties.getPrivateKey()).thenReturn(missingResource);
    when(rsaProperties.getPublicKey()).thenReturn(missingResource);

    Environment environment = mock(Environment.class);
    when(environment.matchesProfiles("prod", "production")).thenReturn(false);

    JwtConfiguration jwtConfiguration = new JwtConfiguration(rsaProperties, environment);

    RSAPrivateKey privateKey = jwtConfiguration.privateKey();
    RSAPublicKey publicKey = jwtConfiguration.publicKey();

    assertThat(privateKey).isNotNull();
    assertThat(publicKey).isNotNull();
    assertThat(privateKey.getModulus()).isEqualTo(publicKey.getModulus());
  }

  @Test
  @DisplayName("Should strictly forbid ephemeral key generation and throw IllegalStateException in production")
  void shouldThrowIllegalStateExceptionWhenKeysDoNotExistInProduction() {
    RSAProperties rsaProperties = mock(RSAProperties.class);
    Resource missingResource = mock(Resource.class);
    when(missingResource.exists()).thenReturn(false);
    when(rsaProperties.getPrivateKey()).thenReturn(missingResource);
    when(rsaProperties.getPublicKey()).thenReturn(missingResource);

    Environment environment = mock(Environment.class);
    when(environment.matchesProfiles("prod", "production")).thenReturn(true);

    JwtConfiguration jwtConfiguration = new JwtConfiguration(rsaProperties, environment);

    assertThatThrownBy(jwtConfiguration::privateKey)
      .isInstanceOf(IllegalStateException.class)
      .hasMessageContaining("strictly forbidden in production");
  }
}
