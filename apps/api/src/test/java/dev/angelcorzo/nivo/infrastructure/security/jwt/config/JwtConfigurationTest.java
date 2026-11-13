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
    when(environment.matchesProfiles("dev", "local", "test")).thenReturn(true);

    JwtConfiguration jwtConfiguration = new JwtConfiguration(rsaProperties, environment);

    RSAPrivateKey privateKey = jwtConfiguration.privateKey();
    RSAPublicKey publicKey = jwtConfiguration.publicKey();

    assertThat(privateKey).isNotNull();
    assertThat(publicKey).isNotNull();
    assertThat(privateKey.getModulus()).isEqualTo(publicKey.getModulus());
  }

  @Test
  @DisplayName("Should generate matching ephemeral RSA keys when PEM resources are null in dev")
  void shouldGenerateMatchingEphemeralKeysWhenResourcesAreNullInDev() throws Exception {
    RSAProperties rsaProperties = mock(RSAProperties.class);
    when(rsaProperties.getPrivateKey()).thenReturn(null);
    when(rsaProperties.getPublicKey()).thenReturn(null);

    Environment environment = mock(Environment.class);
    when(environment.matchesProfiles("dev", "local", "test")).thenReturn(true);

    JwtConfiguration jwtConfiguration = new JwtConfiguration(rsaProperties, environment);

    RSAPrivateKey privateKey = jwtConfiguration.privateKey();
    RSAPublicKey publicKey = jwtConfiguration.publicKey();

    assertThat(privateKey).isNotNull();
    assertThat(publicKey).isNotNull();
    assertThat(privateKey.getModulus()).isEqualTo(publicKey.getModulus());
  }

  @Test
  @DisplayName("Should strictly forbid ephemeral key generation when not in dev/local/test profile")
  void shouldThrowIllegalStateExceptionWhenKeysDoNotExistInNonDevProfile() {
    RSAProperties rsaProperties = mock(RSAProperties.class);
    Resource missingResource = mock(Resource.class);
    when(missingResource.exists()).thenReturn(false);
    when(rsaProperties.getPrivateKey()).thenReturn(missingResource);
    when(rsaProperties.getPublicKey()).thenReturn(missingResource);

    Environment environment = mock(Environment.class);
    when(environment.matchesProfiles("dev", "local", "test")).thenReturn(false);

    JwtConfiguration jwtConfiguration = new JwtConfiguration(rsaProperties, environment);

    assertThatThrownBy(jwtConfiguration::privateKey)
      .isInstanceOf(IllegalStateException.class)
      .hasMessageContaining("Ephemeral keys are only permitted in local/dev profiles");
  }

  @Test
  @DisplayName("Should throw IllegalStateException when private key exists but public key is missing")
  void shouldThrowIllegalStateExceptionWhenPrivateKeyExistsAndPublicKeyMissing() {
    RSAProperties rsaProperties = mock(RSAProperties.class);
    Resource existingPrivate = mock(Resource.class);
    when(existingPrivate.exists()).thenReturn(true);
    when(rsaProperties.getPrivateKey()).thenReturn(existingPrivate);
    when(rsaProperties.getPublicKey()).thenReturn(null);

    Environment environment = mock(Environment.class);

    JwtConfiguration jwtConfiguration = new JwtConfiguration(rsaProperties, environment);

    assertThatThrownBy(jwtConfiguration::privateKey)
      .isInstanceOf(IllegalStateException.class)
      .hasMessageContaining("Inconsistent RSA configuration");

    assertThatThrownBy(jwtConfiguration::publicKey)
      .isInstanceOf(IllegalStateException.class)
      .hasMessageContaining("Inconsistent RSA configuration");
  }

  @Test
  @DisplayName("Should throw IllegalStateException when public key exists but private key is missing")
  void shouldThrowIllegalStateExceptionWhenPublicKeyExistsAndPrivateKeyMissing() {
    RSAProperties rsaProperties = mock(RSAProperties.class);
    Resource existingPublic = mock(Resource.class);
    when(existingPublic.exists()).thenReturn(true);
    when(rsaProperties.getPrivateKey()).thenReturn(null);
    when(rsaProperties.getPublicKey()).thenReturn(existingPublic);

    Environment environment = mock(Environment.class);

    JwtConfiguration jwtConfiguration = new JwtConfiguration(rsaProperties, environment);

    assertThatThrownBy(jwtConfiguration::privateKey)
      .isInstanceOf(IllegalStateException.class)
      .hasMessageContaining("Inconsistent RSA configuration");
  }
}
