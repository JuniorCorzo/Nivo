package dev.angelcorzo.nivo.api.security.config;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;

import dev.angelcorzo.nivo.model.users.enums.Roles;
import java.security.KeyPairGenerator;
import java.security.interfaces.RSAPublicKey;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.security.access.expression.method.MethodSecurityExpressionHandler;
import org.springframework.security.access.hierarchicalroles.RoleHierarchy;
import org.springframework.security.authorization.AuthorizationManagerFactory;
import org.springframework.security.config.core.GrantedAuthorityDefaults;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.JwtDecoder;

@DisplayName("SecurityChain Configuration Tests")
class SecurityChainTest {

  private CustomJwtAuthenticationConverter converter;
  private RSAPublicKey rsaPublicKey;
  private SecurityChain securityChain;

  @BeforeEach
  void setUp() throws Exception {
    converter = mock(CustomJwtAuthenticationConverter.class);
    KeyPairGenerator kpg = KeyPairGenerator.getInstance("RSA");
    kpg.initialize(2048);
    rsaPublicKey = (RSAPublicKey) kpg.generateKeyPair().getPublic();
    securityChain = new SecurityChain(converter, rsaPublicKey);
  }

  @Test
  @DisplayName("Should configure GrantedAuthorityDefaults with ROLE_ prefix")
  void shouldConfigureGrantedAuthorityDefaults() {
    GrantedAuthorityDefaults defaults = securityChain.grantedAuthorityDefaults();
    assertThat(defaults).isNotNull();
    assertThat(defaults.getRolePrefix()).isEqualTo("ROLE_");
  }

  @Test
  @DisplayName("Should configure RoleHierarchy with proper hierarchy levels")
  void shouldConfigureRoleHierarchy() {
    RoleHierarchy hierarchy = securityChain.roleHierarchy();
    assertThat(hierarchy).isNotNull();

    // SUPERADMIN should imply OWNER, MANAGER, OPERATOR, DRIVER, AUDITOR
    var reachable = hierarchy.getReachableGrantedAuthorities(
        java.util.List.of(new SimpleGrantedAuthority("ROLE_" + Roles.SUPERADMIN.name())));

    assertThat(reachable)
        .extracting("authority")
        .contains(
            "ROLE_SUPERADMIN",
            "ROLE_OWNER",
            "ROLE_MANAGER",
            "ROLE_OPERATOR",
            "ROLE_DRIVER",
            "ROLE_AUDITOR");
  }

  @Test
  @DisplayName("Should configure AuthorizationManagerFactory and MethodSecurityExpressionHandler")
  void shouldConfigureAuthorizationManagerAndExpressionHandler() {
    RoleHierarchy hierarchy = securityChain.roleHierarchy();
    AuthorizationManagerFactory<?> factory = securityChain.authorizationManagerFactory(hierarchy);
    assertThat(factory).isNotNull();

    MethodSecurityExpressionHandler handler = securityChain.methodSecurityExpressionHandler((AuthorizationManagerFactory) factory);
    assertThat(handler).isNotNull();
  }

  @Test
  @DisplayName("Should configure JwtDecoder with public key")
  void shouldConfigureJwtDecoder() {
    JwtDecoder decoder = securityChain.jwtDecoder();
    assertThat(decoder).isNotNull();
  }
}
