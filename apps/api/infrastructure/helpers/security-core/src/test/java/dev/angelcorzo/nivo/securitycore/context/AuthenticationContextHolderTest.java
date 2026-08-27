package dev.angelcorzo.nivo.securitycore.context;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import dev.angelcorzo.nivo.model.tenants.Tenants;
import dev.angelcorzo.nivo.model.tenants.gateways.TenantsRepository;
import dev.angelcorzo.nivo.model.users.UserAuthentication;
import dev.angelcorzo.nivo.model.users.Users;
import dev.angelcorzo.nivo.model.users.enums.Roles;
import dev.angelcorzo.nivo.model.users.exceptions.UserAuthenticationContextInvalidException;
import dev.angelcorzo.nivo.model.users.gateways.UsersRepository;
import java.util.UUID;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

@DisplayName("AuthenticationContextHolder Tests")
class AuthenticationContextHolderTest {

  private UsersRepository usersRepository;
  private TenantsRepository tenantsRepository;
  private AuthenticationContextHolder contextHolder;

  @BeforeEach
  void setUp() {
    usersRepository = mock(UsersRepository.class);
    tenantsRepository = mock(TenantsRepository.class);
    contextHolder = new AuthenticationContextHolder(usersRepository, tenantsRepository);
    SecurityContextHolder.clearContext();
  }

  @AfterEach
  void tearDown() {
    SecurityContextHolder.clearContext();
  }

  @Nested
  @DisplayName("Happy Path - Authenticated User")
  class HappyPath {

    @Test
    @DisplayName("Should return UserAuthentication from SecurityContext")
    void shouldReturnUserAuthenticationWhenAuthenticated() {
      // Arrange
      UUID userId = UUID.randomUUID();
      UUID tenantId = UUID.randomUUID();
      UserAuthentication userAuth = new UserAuthentication(userId, tenantId, Roles.MANAGER);

      Authentication authentication =
          new UsernamePasswordAuthenticationToken(userAuth, null, java.util.Collections.emptyList());
      SecurityContext securityContext = SecurityContextHolder.createEmptyContext();
      securityContext.setAuthentication(authentication);
      SecurityContextHolder.setContext(securityContext);

      // Act
      UserAuthentication result = contextHolder.getCurrentlyAuthenticatedUser();

      // Assert
      assertThat(result).isNotNull();
      assertThat(result.userId()).isEqualTo(userId);
      assertThat(result.tenantId()).isEqualTo(tenantId);
      assertThat(result.role()).isEqualTo(Roles.MANAGER);
    }

    @Test
    @DisplayName("Should return current userId and tenantId")
    void shouldReturnCurrentUserIdAndTenantId() {
      // Arrange
      UUID userId = UUID.randomUUID();
      UUID tenantId = UUID.randomUUID();
      UserAuthentication userAuth = new UserAuthentication(userId, tenantId, Roles.OWNER);

      Authentication authentication =
          new UsernamePasswordAuthenticationToken(userAuth, null, java.util.Collections.emptyList());
      SecurityContext securityContext = SecurityContextHolder.createEmptyContext();
      securityContext.setAuthentication(authentication);
      SecurityContextHolder.setContext(securityContext);

      // Act & Assert
      assertThat(contextHolder.getCurrentUserId()).isEqualTo(userId);
      assertThat(contextHolder.getCurrentTenantId()).isEqualTo(tenantId);
    }

    @Test
    @DisplayName("Should retrieve tenant and user entities from repositories using reference by ID")
    void shouldRetrieveTenantAndUserFromRepositories() {
      // Arrange
      UUID userId = UUID.randomUUID();
      UUID tenantId = UUID.randomUUID();
      UserAuthentication userAuth = new UserAuthentication(userId, tenantId, Roles.OPERATOR);

      Authentication authentication =
          new UsernamePasswordAuthenticationToken(userAuth, null, java.util.Collections.emptyList());
      SecurityContext securityContext = SecurityContextHolder.createEmptyContext();
      securityContext.setAuthentication(authentication);
      SecurityContextHolder.setContext(securityContext);

      Tenants mockTenant = Tenants.builder().id(tenantId).companyName("Acme").build();
      Users mockUser = Users.builder().id(userId).email("operator@acme.com").build();

      when(tenantsRepository.getReferenceById(tenantId)).thenReturn(mockTenant);
      when(usersRepository.getReferenceById(userId)).thenReturn(mockUser);

      // Act
      Tenants tenant = contextHolder.getCurrentTenant();
      Users user = contextHolder.getCurrentUser();

      // Assert
      assertThat(tenant).isEqualTo(mockTenant);
      assertThat(user).isEqualTo(mockUser);
      verify(tenantsRepository).getReferenceById(tenantId);
      verify(usersRepository).getReferenceById(userId);
    }
  }

  @Nested
  @DisplayName("Error Cases - Unauthenticated or Invalid Context")
  class ErrorCases {

    @Test
    @DisplayName("Should throw UserAuthenticationContextInvalidException when SecurityContext is empty")
    void shouldThrowExceptionWhenSecurityContextIsEmpty() {
      SecurityContextHolder.clearContext();

      assertThatThrownBy(() -> contextHolder.getCurrentlyAuthenticatedUser())
          .isInstanceOf(UserAuthenticationContextInvalidException.class);
    }

    @Test
    @DisplayName("Should throw UserAuthenticationContextInvalidException when authentication is not authenticated")
    void shouldThrowExceptionWhenNotAuthenticated() {
      // Arrange: unauthenticated token
      Authentication authentication =
          new UsernamePasswordAuthenticationToken("anonymousUser", null);
      // UsernamePasswordAuthenticationToken(Object, Object) has isAuthenticated = false
      SecurityContext securityContext = SecurityContextHolder.createEmptyContext();
      securityContext.setAuthentication(authentication);
      SecurityContextHolder.setContext(securityContext);

      assertThatThrownBy(() -> contextHolder.getCurrentlyAuthenticatedUser())
          .isInstanceOf(UserAuthenticationContextInvalidException.class);
    }

    @Test
    @DisplayName("Should throw UserAuthenticationContextInvalidException when principal is not UserAuthentication")
    void shouldThrowExceptionWhenPrincipalIsNotUserAuthentication() {
      // Arrange: authenticated token but principal is String
      Authentication authentication =
          new UsernamePasswordAuthenticationToken("someUsername", "credentials", java.util.Collections.emptyList());
      SecurityContext securityContext = SecurityContextHolder.createEmptyContext();
      securityContext.setAuthentication(authentication);
      SecurityContextHolder.setContext(securityContext);

      assertThatThrownBy(() -> contextHolder.getCurrentlyAuthenticatedUser())
          .isInstanceOf(UserAuthenticationContextInvalidException.class);
    }
  }
}
