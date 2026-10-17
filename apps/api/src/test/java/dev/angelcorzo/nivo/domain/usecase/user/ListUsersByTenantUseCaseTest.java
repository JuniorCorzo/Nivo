package dev.angelcorzo.nivo.domain.usecase.user;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import dev.angelcorzo.nivo.domain.model.authentication.gateway.AuthenticationContextGateway;
import dev.angelcorzo.nivo.domain.model.tenants.valueobject.TenantReference;
import dev.angelcorzo.nivo.domain.model.users.Users;
import dev.angelcorzo.nivo.domain.model.users.enums.Roles;
import dev.angelcorzo.nivo.domain.model.users.exceptions.UserAuthenticationContextInvalidException;
import dev.angelcorzo.nivo.domain.model.users.gateways.UsersRepository;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
@DisplayName("ListUsersByTenantUseCase - Unit Tests")
class ListUsersByTenantUseCaseTest {

  @Mock private UsersRepository usersRepository;
  @Mock private AuthenticationContextGateway authenticationContextGateway;

  @InjectMocks private ListUsersByTenantUseCase listUsersByTenantUseCase;

  @Test
  @DisplayName("Should return list of users for authenticated tenant")
  void shouldReturnListOfUsers_whenTenantHasUsers() {
    final UUID tenantId = UUID.randomUUID();
    final Users user1 = Users.builder()
        .id(UUID.randomUUID())
        .fullName("Alice Manager")
        .email("alice@test.com")
        .role(Roles.MANAGER)
        .tenant(TenantReference.builder().id(tenantId).companyName("Nivo Corp").build())
        .createdAt(OffsetDateTime.now())
        .build();
    final Users user2 = Users.builder()
        .id(UUID.randomUUID())
        .fullName("Bob Operator")
        .email("bob@test.com")
        .role(Roles.OPERATOR)
        .tenant(TenantReference.builder().id(tenantId).companyName("Nivo Corp").build())
        .createdAt(OffsetDateTime.now().minusDays(1))
        .build();

    when(authenticationContextGateway.getCurrentTenantId()).thenReturn(tenantId);
    when(usersRepository.findAllByTenantId(tenantId)).thenReturn(List.of(user1, user2));

    List<Users> result = listUsersByTenantUseCase.execute();

    assertNotNull(result);
    assertEquals(2, result.size());
    assertEquals("Alice Manager", result.get(0).getFullName());
    verify(authenticationContextGateway, times(1)).getCurrentTenantId();
    verify(usersRepository, times(1)).findAllByTenantId(tenantId);
  }

  @Test
  @DisplayName("Should return empty list when tenant has no additional users")
  void shouldReturnEmptyList_whenTenantHasNoUsers() {
    final UUID tenantId = UUID.randomUUID();
    when(authenticationContextGateway.getCurrentTenantId()).thenReturn(tenantId);
    when(usersRepository.findAllByTenantId(tenantId)).thenReturn(List.of());

    List<Users> result = listUsersByTenantUseCase.execute();

    assertNotNull(result);
    assertTrue(result.isEmpty());
    verify(usersRepository, times(1)).findAllByTenantId(tenantId);
  }

  @Test
  @DisplayName("Should propagate exception when authentication context fails")
  void shouldPropagateException_whenAuthenticationContextFails() {
    when(authenticationContextGateway.getCurrentTenantId())
        .thenThrow(new UserAuthenticationContextInvalidException());

    assertThrows(
        UserAuthenticationContextInvalidException.class,
        () -> listUsersByTenantUseCase.execute());
    verifyNoInteractions(usersRepository);
  }
}
