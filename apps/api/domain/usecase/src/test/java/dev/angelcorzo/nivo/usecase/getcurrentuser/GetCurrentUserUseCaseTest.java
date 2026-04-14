package dev.angelcorzo.nivo.usecase.getcurrentuser;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import dev.angelcorzo.nivo.model.authentication.gateway.AuthenticationContextGateway;
import dev.angelcorzo.nivo.model.tenants.valueobject.TenantReference;
import dev.angelcorzo.nivo.model.users.Users;
import dev.angelcorzo.nivo.model.users.enums.Roles;
import dev.angelcorzo.nivo.model.users.exceptions.UserAuthenticationContextInvalidException;
import java.time.OffsetDateTime;
import java.util.UUID;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
@DisplayName("GetCurrentUserUseCase - Unit Tests")
class GetCurrentUserUseCaseTest {

  @Mock private AuthenticationContextGateway authenticationContextGateway;

  @InjectMocks private GetCurrentUserUseCase getCurrentUserUseCase;

  // ========== HAPPY PATH ==========

  @Test
  @DisplayName("Should return current authenticated user successfully")
  void shouldReturnCurrentUser_whenAuthenticated() {
    // Given
    final UUID userId = UUID.randomUUID();
    final UUID tenantId = UUID.randomUUID();

    Users expectedUser =
        Users.builder()
            .id(userId)
            .fullName("Juan Pérez")
            .email("juan@example.com")
            .role(Roles.MANAGER)
            .tenant(TenantReference.builder().id(tenantId).companyName("Nivo Corp").build())
            .contactInfo("+5491112345678")
            .createdAt(OffsetDateTime.now().minusDays(30))
            .updatedAt(OffsetDateTime.now())
            .build();

    when(authenticationContextGateway.getCurrentUser()).thenReturn(expectedUser);

    // When
    Users result = getCurrentUserUseCase.execute();

    // Then
    assertNotNull(result, "Result should not be null");
    assertEquals(userId, result.getId(), "User ID should match");
    assertEquals("Juan Pérez", result.getFullName(), "Full name should match");
    assertEquals("juan@example.com", result.getEmail(), "Email should match");
    assertEquals(Roles.MANAGER, result.getRole(), "Role should match");
    assertEquals(tenantId, result.getTenant().id(), "Tenant ID should match");

    verify(authenticationContextGateway, times(1)).getCurrentUser();
  }

  // ========== ERROR CASES ==========

  @Test
  @DisplayName("Should throw exception when no authenticated user in context")
  void shouldThrowException_whenNoAuthenticatedUser() {
    // Given
    when(authenticationContextGateway.getCurrentUser())
        .thenThrow(new UserAuthenticationContextInvalidException());

    // When & Then
    assertThrows(
        UserAuthenticationContextInvalidException.class,
        () -> getCurrentUserUseCase.execute(),
        "Should throw when no authenticated user in context");

    verify(authenticationContextGateway, times(1)).getCurrentUser();
  }

  @Test
  @DisplayName("Should return user with all fields populated")
  void shouldReturnFullyPopulatedUser() {
    // Given
    final UUID userId = UUID.randomUUID();
    final UUID tenantId = UUID.randomUUID();
    final OffsetDateTime createdAt = OffsetDateTime.now().minusMonths(6);
    final OffsetDateTime updatedAt = OffsetDateTime.now().minusDays(1);

    Users expectedUser =
        Users.builder()
            .id(userId)
            .fullName("María García")
            .email("maria@example.com")
            .role(Roles.OWNER)
            .tenant(TenantReference.builder().id(tenantId).companyName("Parking Max").build())
            .contactInfo("+5491198765432")
            .createdAt(createdAt)
            .updatedAt(updatedAt)
            .deletedAt(null)
            .build();

    when(authenticationContextGateway.getCurrentUser()).thenReturn(expectedUser);

    // When
    Users result = getCurrentUserUseCase.execute();

    // Then
    assertEquals(userId, result.getId());
    assertEquals("María García", result.getFullName());
    assertEquals("maria@example.com", result.getEmail());
    assertEquals(Roles.OWNER, result.getRole());
    assertEquals(tenantId, result.getTenant().id());
    assertEquals("Parking Max", result.getTenant().companyName());
    assertEquals("+5491198765432", result.getContactInfo());
    assertEquals(createdAt, result.getCreatedAt());
    assertEquals(updatedAt, result.getUpdatedAt());
    assertNull(result.getDeletedAt(), "Active user should have null deletedAt");
  }
}
