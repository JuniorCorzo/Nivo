package dev.angelcorzo.nivo.infrastructure.adapter.jpa.users;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import dev.angelcorzo.nivo.infrastructure.adapter.jpa.users.mapper.UserMapper;
import dev.angelcorzo.nivo.domain.model.users.Users;
import dev.angelcorzo.nivo.domain.model.users.enums.Roles;
import java.time.OffsetDateTime;
import java.util.List;
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

  @Test
  @DisplayName("Should find all users by tenant ID and return mapped domain entities")
  void shouldFindAllByTenantId() {
    UUID tenantId = UUID.randomUUID();
    UsersData userData = UsersData.builder().id(UUID.randomUUID()).email("staff@tenant.com").build();
    Users userEntity = Users.builder().id(userData.getId()).email(userData.getEmail()).build();

    when(repository.findAllByTenantId(tenantId)).thenReturn(List.of(userData));
    when(mapper.toEntity(userData)).thenReturn(userEntity);

    List<Users> result = adapter.findAllByTenantId(tenantId);

    assertThat(result).isNotNull();
    assertThat(result).hasSize(1);
    assertThat(result.get(0).getEmail()).isEqualTo("staff@tenant.com");
    verify(repository, times(1)).findAllByTenantId(tenantId);
  }

  @Test
  @DisplayName("Should save and refetch active user with tenant loaded")
  void shouldSaveAndRefetchUser_whenNotDeleted() {
    UUID userId = UUID.randomUUID();
    Users activeUser = Users.builder().id(userId).email("active@test.com").build();
    UsersData activeUserData = UsersData.builder().id(userId).email("active@test.com").build();

    when(mapper.toData(activeUser)).thenReturn(activeUserData);
    when(repository.saveAndFlush(activeUserData)).thenReturn(activeUserData);
    when(mapper.toEntity(activeUserData)).thenReturn(activeUser);
    when(repository.findByIdFetchTenant(userId)).thenReturn(Optional.of(activeUserData));

    Users result = adapter.save(activeUser);

    assertThat(result).isNotNull();
    assertThat(result.getId()).isEqualTo(userId);
    verify(repository).saveAndFlush(activeUserData);
    verify(repository).findByIdFetchTenant(userId);
  }

  @Test
  @DisplayName("Should return saved user directly without refetching when user is soft-deleted")
  void shouldReturnSavedUserDirectly_whenSoftDeleted() {
    UUID userId = UUID.randomUUID();
    OffsetDateTime now = OffsetDateTime.now();
    Users deletedUser =
        Users.builder().id(userId).email("deleted@test.com").deletedAt(now).deletedBy(UUID.randomUUID()).build();
    UsersData deletedUserData =
        UsersData.builder().id(userId).email("deleted@test.com").deletedAt(now).build();

    when(mapper.toData(deletedUser)).thenReturn(deletedUserData);
    when(repository.saveAndFlush(deletedUserData)).thenReturn(deletedUserData);
    when(mapper.toEntity(deletedUserData)).thenReturn(deletedUser);

    Users result = adapter.save(deletedUser);

    assertThat(result).isNotNull();
    assertThat(result.getId()).isEqualTo(userId);
    assertThat(result.getDeletedAt()).isEqualTo(now);
    verify(repository).saveAndFlush(deletedUserData);
    verify(repository, never()).findByIdFetchTenant(any());
  }
}
