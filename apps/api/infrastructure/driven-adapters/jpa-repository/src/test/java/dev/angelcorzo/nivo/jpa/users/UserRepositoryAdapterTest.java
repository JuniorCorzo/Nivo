package dev.angelcorzo.nivo.jpa.users;

import static org.assertj.core.api.Assertions.assertThat;

import dev.angelcorzo.nivo.jpa.tenants.TenantsRepositoryAdapter;
import dev.angelcorzo.nivo.jpa.tenants.mappers.TenantsMapperJpaImpl;
import dev.angelcorzo.nivo.jpa.users.mapper.UserMapperJpaImpl;
import dev.angelcorzo.nivo.model.tenants.Tenants;
import dev.angelcorzo.nivo.model.tenants.valueobject.TenantReference;
import dev.angelcorzo.nivo.model.users.Users;
import dev.angelcorzo.nivo.model.users.enums.Roles;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jdbc.EmbeddedDatabaseConnection;
import org.springframework.boot.jdbc.test.autoconfigure.AutoConfigureTestDatabase;
import org.springframework.boot.jpa.test.autoconfigure.TestEntityManager;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;

@ActiveProfiles("test")
@DataJpaTest
@Import({
  UserRepositoryAdapter.class,
  TenantsRepositoryAdapter.class,
  TestEntityManager.class,
  UserMapperJpaImpl.class,
  TenantsMapperJpaImpl.class
})
@AutoConfigureTestDatabase(
    replace = AutoConfigureTestDatabase.Replace.NONE,
    connection = EmbeddedDatabaseConnection.NONE)
@DisplayName("UserRepositoryAdapter Tests")
class UserRepositoryAdapterTest {

  @Autowired private UserRepositoryAdapter userRepositoryAdapter;
  @Autowired private TenantsRepositoryAdapter tenantsRepositoryAdapter;
  @Autowired private TestEntityManager entityManager;

  private Tenants testTenant;
  private Users ownerUser;
  private Users superAdminUser;

  @BeforeEach
  void setUp() {

    testTenant = createAndSaveTenant("Test Company");
    ownerUser = createAndSaveUser("John Doe", "john@test.com", Roles.OWNER, testTenant);
    superAdminUser = createAndSaveUser("Jane Admin", "jane@test.com", Roles.SUPERADMIN, testTenant);
  }

  private Tenants createAndSaveTenant(String companyName) {
    Tenants tenant = Tenants.builder().companyName(companyName).build();
    return tenantsRepositoryAdapter.save(tenant);
  }

  private Users createAndSaveUser(String fullName, String email, Roles role, Tenants tenant) {
    Users user =
        Users.builder()
            .fullName(fullName)
            .email(email)
            .password("password123")
            .role(role)
            .tenant(TenantReference.of(tenant))
            .build();
    return userRepositoryAdapter.save(user);
  }

  private Users buildUserModel() {
    TenantReference domainTenant = TenantReference.builder().id(testTenant.getId()).build();

    return Users.builder()
        .fullName("Alice Smith")
        .email("alice@test.com")
        .password("password123")
        .role(Roles.OWNER)
        .tenant(domainTenant)
        .build();
  }

  @Nested
  @DisplayName("Save Operations")
  class SaveOperations {

    @Test
    @DisplayName("Should save a new user successfully")
    void shouldSaveNewUser() {
      // Given
      Users newUser = buildUserModel();

      // When
      Users savedUser = userRepositoryAdapter.save(newUser);

      // Then
      assertThat(savedUser).isNotNull();
      assertThat(savedUser.getId()).isNotNull();
      assertThat(savedUser.getFullName()).isEqualTo("Alice Smith");
      assertThat(savedUser.getEmail()).isEqualTo("alice@test.com");

      Optional<Users> persistedUser = userRepositoryAdapter.findById(savedUser.getId());
      assertThat(persistedUser).isPresent();
      assertThat(persistedUser.get().getEmail()).isEqualTo("alice@test.com");
    }
  }

  @Nested
  @DisplayName("Find Operations")
  class FindOperations {

    @Test
    @DisplayName("Should find user by email when exists")
    void shouldFindUserByEmail() {
      // When
      Optional<Users> foundUser = userRepositoryAdapter.findByEmail("john@test.com");

      // Then
      assertThat(foundUser).isPresent();
      assertThat(foundUser.get().getFullName()).isEqualTo("John Doe");
      assertThat(foundUser.get().getRole()).isEqualTo(Roles.OWNER);
    }

    @Test
    @DisplayName("Should return empty when user email does not exist")
    void shouldReturnEmptyWhenEmailNotFound() {
      // When
      Optional<Users> foundUser = userRepositoryAdapter.findByEmail("nonexistent@test.com");

      // Then
      assertThat(foundUser).isEmpty();
    }

    @Test
    @DisplayName("Should find user by ID and tenant ID")
    void shouldFindUserByIdAndTenantId() {
      // When
      Optional<Users> foundUser =
          userRepositoryAdapter.findByIdAndTenantId(ownerUser.getId(), testTenant.getId());

      // Then
      assertThat(foundUser).isPresent();
      assertThat(foundUser.get().getId()).isEqualTo(ownerUser.getId());
      assertThat(foundUser.get().getEmail()).isEqualTo("john@test.com");
    }

    @Test
    @DisplayName("Should return empty when tenant ID does not match")
    void shouldReturnEmptyWhenTenantIdMismatch() {
      // Given
      UUID nonExistentTenantId = UUID.randomUUID();

      // When
      Optional<Users> foundUser =
          userRepositoryAdapter.findByIdAndTenantId(ownerUser.getId(), nonExistentTenantId);

      // Then
      assertThat(foundUser).isEmpty();
    }
  }

  @Nested
  @DisplayName("Existence Checks")
  class ExistenceChecks {

    @Test
    @DisplayName("Should return true when user exists by ID")
    void shouldReturnTrueWhenUserExistsById() {
      // When
      Boolean exists = userRepositoryAdapter.existsById(ownerUser.getId());

      // Then
      assertThat(exists).isTrue();
    }

    @Test
    @DisplayName("Should return false when user does not exist by ID")
    void shouldReturnFalseWhenUserNotExistsById() {
      // Given
      UUID nonExistentId = UUID.randomUUID();

      // When
      Boolean exists = userRepositoryAdapter.existsById(nonExistentId);

      // Then
      assertThat(exists).isFalse();
    }

    @Test
    @DisplayName("Should return true when user exists by email")
    void shouldReturnTrueWhenUserExistsByEmail() {
      // When
      Boolean exists = userRepositoryAdapter.existsByEmail("john@test.com");

      // Then
      assertThat(exists).isTrue();
    }

    @Test
    @DisplayName("Should return false when user does not exist by email")
    void shouldReturnFalseWhenUserNotExistsByEmail() {
      // When
      Boolean exists = userRepositoryAdapter.existsByEmail("notfound@test.com");

      // Then
      assertThat(exists).isFalse();
    }

    @Test
    @DisplayName("Should return true when user exists by email and tenant ID")
    void shouldReturnTrueWhenUserExistsByEmailAndTenantId() {
      // When
      Boolean exists =
          userRepositoryAdapter.existsByEmailAndTenantId("john@test.com", testTenant.getId());

      // Then
      assertThat(exists).isTrue();
    }

    @Test
    @DisplayName("Should return false when user does not exist for given tenant")
    void shouldReturnFalseWhenUserNotExistsForTenant() {
      // Given
      UUID differentTenantId = UUID.randomUUID();

      // When
      Boolean exists =
          userRepositoryAdapter.existsByEmailAndTenantId("john@test.com", differentTenantId);

      // Then
      assertThat(exists).isFalse();
    }
  }

  // Helper Methods

  @Nested
  @DisplayName("Count Operations")
  class CountOperations {

    @Test
    @DisplayName("Should count active owners by tenant ID")
    void shouldCountActiveOwnersByTenantId() {
      // When
      Long count = userRepositoryAdapter.countActiveOwnersByTenantId(testTenant.getId());

      // Then
      assertThat(count).isEqualTo(1L);
    }

    @Test
    @DisplayName("Should return zero when no owners exist for tenant")
    void shouldReturnZeroWhenNoOwnersForTenant() {
      // Given
      Tenants emptyTenant = createAndSaveTenant("Empty Company");

      // When
      Long count = userRepositoryAdapter.countActiveOwnersByTenantId(emptyTenant.getId());

      // Then
      assertThat(count).isZero();
    }
  }

  @Nested
  @DisplayName("Update Operations")
  class UpdateOperations {

    @Test
    @DisplayName("Should assign tenant to user")
    void shouldAssignTenantToUser() {
      // Given
      Tenants newTenant =
          tenantsRepositoryAdapter.save(Tenants.builder().companyName("New Company").build());

      Users userWithoutTenant =
          userRepositoryAdapter.save(
              Users.builder()
                  .fullName("Alice Smith")
                  .email("alice@test.com")
                  .password("password123")
                  .role(Roles.OWNER)
                  .tenant(null)
                  .build());

      // When
      int updatedRows =
          userRepositoryAdapter.assignTenant(userWithoutTenant.getId(), newTenant.getId());

      // Then
      assertThat(updatedRows).isEqualTo(1);

      // Force JPA to clear its cache. The next findById will have to go to the database.
      entityManager.flush();
      entityManager.clear();

      Optional<Users> updatedUser = userRepositoryAdapter.findById(userWithoutTenant.getId());
      assertThat(updatedUser).isPresent();
      assertThat(updatedUser.get().getTenant()).isNotNull();
      assertThat(updatedUser.get().getTenant().id()).isEqualTo(newTenant.getId());
    }
  }

  @Nested
  @DisplayName("Delete Operations")
  class DeleteOperations {

    @Test
    @DisplayName("Should delete user by ID")
    void shouldDeleteUserById() {
      // Given
      UUID userId = ownerUser.getId();
      assertThat(userRepositoryAdapter.existsById(userId)).isTrue();

      // When
      userRepositoryAdapter.deleteById(userId);

      // Then
      Optional<Users> deletedUser = userRepositoryAdapter.findById(userId);
      assertThat(deletedUser).isEmpty();
    }
  }
}
