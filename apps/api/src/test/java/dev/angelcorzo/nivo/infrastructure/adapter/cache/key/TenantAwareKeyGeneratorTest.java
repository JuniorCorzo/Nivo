package dev.angelcorzo.nivo.infrastructure.adapter.cache.key;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import dev.angelcorzo.nivo.infrastructure.security.context.AuthenticationContextHolder;
import java.lang.reflect.Method;
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
    final UUID tenantId = UUID.randomUUID();
    final UUID parkingLotId = UUID.randomUUID();
    when(authContextHolder.getCurrentTenantId()).thenReturn(tenantId);

    final Object key = keyGenerator.generate(this, getClass().getDeclaredMethod("shouldGenerateKeyWithTenantPrefix"),
      parkingLotId);

    assertThat(key).isEqualTo("tenant:" + tenantId + ":" + parkingLotId);
  }

  @Test
  @DisplayName("Should throw IllegalStateException and fail-fast when unauthenticated (preventing cache poisoning)")
  void shouldThrowExceptionWhenUnauthenticated() throws NoSuchMethodException {
    when(authContextHolder.getCurrentTenantId()).thenThrow(new IllegalStateException("No auth"));
    final UUID entityId = UUID.randomUUID();
    final Method method = getClass().getDeclaredMethod("shouldThrowExceptionWhenUnauthenticated");

    assertThatThrownBy(() -> keyGenerator.generate(this, method, entityId))
      .isInstanceOf(IllegalStateException.class)
      .hasMessageContaining("Active security context does not contain an authenticated tenant ID");
  }

  @Test
  @DisplayName("Should build key explicitly with given tenant ID")
  void shouldBuildKeyWithExplicitTenantId() {
    final UUID tenantId = UUID.randomUUID();
    final UUID resourceId = UUID.randomUUID();

    final String key = keyGenerator.buildKeyForTenant(tenantId, resourceId);

    assertThat(key).isEqualTo("tenant:" + tenantId + ":" + resourceId);
  }

  @Test
  @DisplayName("Should throw IllegalStateException when explicit tenantId is null")
  void shouldThrowWhenTenantIdIsNull() {
    final UUID resourceId = UUID.randomUUID();

    assertThatThrownBy(() -> keyGenerator.buildKeyForTenant(null, resourceId))
      .isInstanceOf(IllegalStateException.class)
      .hasMessageContaining("Cannot generate tenant-scoped cache key without an authenticated tenantId");
  }

  @Test
  @DisplayName("Should build public key with public prefix")
  void shouldBuildPublicKey() {
    final UUID parkingId = UUID.randomUUID();

    final String key = TenantAwareKeyGenerator.buildPublicKey("availability", parkingId);

    assertThat(key).isEqualTo("public:availability:" + parkingId);
  }

  @Test
  @DisplayName("Should skip null params when building key")
  void shouldSkipNullParamsWhenBuildingKey() throws NoSuchMethodException {
    final UUID tenantId = UUID.randomUUID();
    when(authContextHolder.getCurrentTenantId()).thenReturn(tenantId);
    final Method method = getClass().getDeclaredMethod("shouldSkipNullParamsWhenBuildingKey");

    final Object key = keyGenerator.generate(this, method, "part1", null, "part2");

    assertThat(key).isEqualTo("tenant:" + tenantId + ":part1:part2");
  }

  @Test
  @DisplayName("Should generate key without extra suffix when params are empty")
  void shouldGenerateKeyWhenParamsEmpty() throws NoSuchMethodException {
    final UUID tenantId = UUID.randomUUID();
    when(authContextHolder.getCurrentTenantId()).thenReturn(tenantId);
    final Method method = getClass().getDeclaredMethod("shouldGenerateKeyWhenParamsEmpty");

    final Object key = keyGenerator.generate(this, method);

    assertThat(key).isEqualTo("tenant:" + tenantId);
  }
}
