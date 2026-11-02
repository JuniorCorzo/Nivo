package dev.angelcorzo.nivo.infrastructure.adapter.cache.key;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import dev.angelcorzo.nivo.infrastructure.security.context.AuthenticationContextHolder;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.ObjectProvider;

@DisplayName("TenantAwareKeyGenerator Unit Tests")
class TenantAwareKeyGeneratorTest {

  private ObjectProvider<AuthenticationContextHolder> authContextProvider;
  private AuthenticationContextHolder authContextHolder;
  private TenantAwareKeyGenerator keyGenerator;

  @SuppressWarnings("unchecked")
  @BeforeEach
  void setUp() {
    authContextProvider = mock(ObjectProvider.class);
    authContextHolder = mock(AuthenticationContextHolder.class);
    when(authContextProvider.getIfAvailable()).thenReturn(authContextHolder);
    keyGenerator = new TenantAwareKeyGenerator(authContextProvider);
  }

  @Test
  @DisplayName("Should generate key with tenant prefix when authenticated")
  void shouldGenerateKeyWithTenantPrefix() throws NoSuchMethodException {
    UUID tenantId = UUID.randomUUID();
    UUID parkingLotId = UUID.randomUUID();
    when(authContextHolder.getCurrentTenantId()).thenReturn(tenantId);

    Object key = keyGenerator.generate(this, getClass().getDeclaredMethod("shouldGenerateKeyWithTenantPrefix"),
      parkingLotId);

    assertThat(key).isEqualTo("tenant:" + tenantId + ":" + parkingLotId);
  }

  @Test
  @DisplayName("Should fallback to tenant:anonymous when unauthenticated")
  void shouldFallbackToAnonymousWhenUnauthenticated() throws NoSuchMethodException {
    when(authContextHolder.getCurrentTenantId()).thenThrow(new IllegalStateException("No auth"));
    UUID entityId = UUID.randomUUID();

    Object key = keyGenerator.generate(this,
      getClass().getDeclaredMethod("shouldFallbackToAnonymousWhenUnauthenticated"), entityId);

    assertThat(key).isEqualTo("tenant:anonymous:" + entityId);
  }

  @Test
  @DisplayName("Should build key explicitly with given tenant ID")
  void shouldBuildKeyWithExplicitTenantId() {
    UUID tenantId = UUID.randomUUID();
    UUID resourceId = UUID.randomUUID();

    String key = keyGenerator.buildKey(tenantId, resourceId);

    assertThat(key).isEqualTo("tenant:" + tenantId + ":" + resourceId);
  }
}
