package dev.angelcorzo.nivo.jpa.users;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import dev.angelcorzo.nivo.jpa.users.mapper.UserMapper;
import dev.angelcorzo.nivo.model.users.Users;
import dev.angelcorzo.nivo.model.users.enums.Roles;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.Example;

@DisplayName("UserRepositoryAdapter Unit Tests")
class UserRepositoryAdapterTest {

  private UserRepositoryData repository;
  private UserMapper mapper;
  private UserRepositoryAdapter adapter;

  @BeforeEach
  void setUp() {
    repository = mock(UserRepositoryData.class);
    mapper = mock(UserMapper.class);
    adapter = new UserRepositoryAdapter(repository, mapper);
  }

  @Test
  @DisplayName("Should find user by email")
  void shouldFindByEmail() {
    String email = "john@test.com";
    UsersData data = new UsersData();
    Users entity = Users.builder().id(UUID.randomUUID()).email(email).build();

    when(repository.findByEmail(email)).thenReturn(Optional.of(data));
    when(mapper.toEntity(data)).thenReturn(entity);

    Optional<Users> result = adapter.findByEmail(email);

    assertThat(result).isPresent();
    assertThat(result.get().getEmail()).isEqualTo(email);
  }

  @Test
  @DisplayName("Should find user by ID and tenant ID")
  void shouldFindByIdAndTenantId() {
    UUID userId = UUID.randomUUID();
    UUID tenantId = UUID.randomUUID();
    UsersData data = new UsersData();
    Users entity = Users.builder().id(userId).email("john@test.com").build();

    when(repository.findByIdAndTenant_Id(userId, tenantId)).thenReturn(Optional.of(data));
    when(mapper.toEntity(data)).thenReturn(entity);

    Optional<Users> result = adapter.findByIdAndTenantId(userId, tenantId);

    assertThat(result).isPresent();
    assertThat(result.get().getId()).isEqualTo(userId);
  }

  @Test
  @DisplayName("Should check existence by email")
  void shouldCheckExistsByEmail() {
    String email = "john@test.com";
    when(repository.exists(any())).thenReturn(true);

    assertThat(adapter.existsByEmail(email)).isTrue();
    verify(repository).exists(any());
  }

  @Test
  @DisplayName("Should check existence by email and tenant ID")
  void shouldCheckExistsByEmailAndTenantId() {
    String email = "john@test.com";
    UUID tenantId = UUID.randomUUID();
    when(repository.existsByEmailAndTenantId(email, tenantId)).thenReturn(true);

    assertThat(adapter.existsByEmailAndTenantId(email, tenantId)).isTrue();
    verify(repository).existsByEmailAndTenantId(email, tenantId);
  }

  @Test
  @DisplayName("Should count active owners by tenant ID")
  void shouldCountActiveOwnersByTenantId() {
    UUID tenantId = UUID.randomUUID();
    when(repository.countByRoleAndTenantId(Roles.OWNER, tenantId)).thenReturn(2L);

    Long count = adapter.countActiveOwnersByTenantId(tenantId);

    assertThat(count).isEqualTo(2L);
    verify(repository).countByRoleAndTenantId(Roles.OWNER, tenantId);
  }

  @Test
  @DisplayName("Should assign tenant to user")
  void shouldAssignTenant() {
    UUID userId = UUID.randomUUID();
    UUID tenantId = UUID.randomUUID();
    when(repository.assignTenant(userId, tenantId)).thenReturn(1);

    int rows = adapter.assignTenant(userId, tenantId);

    assertThat(rows).isEqualTo(1);
    verify(repository).assignTenant(userId, tenantId);
  }

  @Test
  @DisplayName("Should delete user by ID")
  void shouldDeleteById() {
    UUID userId = UUID.randomUUID();

    adapter.deleteById(userId);

    verify(repository).deleteById(userId);
  }
}
