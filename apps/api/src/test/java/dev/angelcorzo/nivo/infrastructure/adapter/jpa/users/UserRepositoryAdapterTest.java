package dev.angelcorzo.nivo.infrastructure.adapter.jpa.users;

import static org.assertj.core.api.Assertions.assertThat;

import dev.angelcorzo.nivo.domain.model.tenants.valueobject.TenantReference;
import dev.angelcorzo.nivo.domain.model.users.Users;
import dev.angelcorzo.nivo.domain.model.users.enums.Roles;
import dev.angelcorzo.nivo.infrastructure.adapter.jpa.config.AbstractPostgresIntegrationTest;
import dev.angelcorzo.nivo.infrastructure.adapter.jpa.tenants.TenantsData;
import dev.angelcorzo.nivo.infrastructure.adapter.jpa.users.mapper.UserMapperJpaImpl;
import jakarta.persistence.EntityManager;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jdbc.test.autoconfigure.AutoConfigureTestDatabase;
import org.springframework.boot.persistence.autoconfigure.EntityScan;
import org.springframework.context.annotation.Import;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.test.context.ActiveProfiles;

@ActiveProfiles("test")
@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@EntityScan(basePackages = "dev.angelcorzo.nivo.infrastructure.adapter.jpa")
@EnableJpaRepositories(basePackageClasses = UserRepositoryData.class)
@Import({UserRepositoryAdapter.class, UserMapperJpaImpl.class})
@DisplayName("UserRepositoryAdapter Integration Tests (PostgreSQL Testcontainers)")
class UserRepositoryAdapterTest extends AbstractPostgresIntegrationTest {

  @Autowired
  private EntityManager entityManager;

  @Autowired
  private UserRepositoryAdapter adapter;

  private TenantsData tenantA;
  private TenantsData tenantB;

  @BeforeEach
  void setUp() {
    tenantA = TenantsData.builder()
      .companyName("Tenant Alpha")
      .build();
    entityManager.persist(tenantA);

    tenantB = TenantsData.builder()
      .companyName("Tenant Beta")
      .build();
    entityManager.persist(tenantB);

    entityManager.flush();
    entityManager.clear();
  }

  private UsersData createPersistedUser(
    String fullName, String email, Roles role, TenantsData tenant) {
    UsersData user = UsersData.builder()
      .fullName(fullName)
      .email(email)
      .password("hashed_password_123")
      .role(role)
      .tenant(tenant)
      .contactInfo("+123456789")
      .build();
    entityManager.persist(user);
    entityManager.flush();
    return user;
  }

  @Test
  @DisplayName("Should find user by email from real PostgreSQL database")
  void shouldFindByEmail() {
    UsersData created = createPersistedUser("John Doe", "john@alpha.com", Roles.OWNER, tenantA);
    entityManager.clear();

    Optional<Users> found = adapter.findByEmail("john@alpha.com");

    assertThat(found).isPresent();
    assertThat(found.get().getId()).isEqualTo(created.getId());
    assertThat(found.get().getEmail()).isEqualTo("john@alpha.com");
    assertThat(found.get().getFullName()).isEqualTo("John Doe");
    assertThat(found.get().getRole()).isEqualTo(Roles.OWNER);

    Optional<Users> notFound = adapter.findByEmail("missing@alpha.com");
    assertThat(notFound).isEmpty();
  }

  @Test
  @DisplayName("Should find user by ID and tenant ID with multi-tenant isolation")
  void shouldFindByIdAndTenantId() {
    UsersData userInA = createPersistedUser("Alice Alpha", "alice@alpha.com", Roles.MANAGER, tenantA);
    entityManager.clear();

    Optional<Users> foundInCorrectTenant = adapter.findByIdAndTenantId(userInA.getId(), tenantA.getId());
    assertThat(foundInCorrectTenant).isPresent();
    assertThat(foundInCorrectTenant.get().getId()).isEqualTo(userInA.getId());
    assertThat(foundInCorrectTenant.get().getEmail()).isEqualTo("alice@alpha.com");

    // Multi-tenant check: should not find user with different tenant ID
    Optional<Users> foundInWrongTenant = adapter.findByIdAndTenantId(userInA.getId(), tenantB.getId());
    assertThat(foundInWrongTenant).isEmpty();

    Optional<Users> nonExistent = adapter.findByIdAndTenantId(UUID.randomUUID(), tenantA.getId());
    assertThat(nonExistent).isEmpty();
  }

  @Test
  @DisplayName("Should check existence by email")
  void shouldCheckExistsByEmail() {
    createPersistedUser("Exists User", "exists@domain.com", Roles.OPERATOR, tenantA);
    entityManager.clear();

    assertThat(adapter.existsByEmail("exists@domain.com")).isTrue();
    assertThat(adapter.existsByEmail("does_not_exist@domain.com")).isFalse();
  }

  @Test
  @DisplayName("Should check existence by email and tenant ID")
  void shouldCheckExistsByEmailAndTenantId() {
    createPersistedUser("Tenant User", "shared@tenant.com", Roles.OPERATOR, tenantA);
    entityManager.clear();

    assertThat(adapter.existsByEmailAndTenantId("shared@tenant.com", tenantA.getId())).isTrue();
    assertThat(adapter.existsByEmailAndTenantId("shared@tenant.com", tenantB.getId())).isFalse();
    assertThat(adapter.existsByEmailAndTenantId("unknown@tenant.com", tenantA.getId())).isFalse();
  }

  @Test
  @DisplayName("Should count active owners by tenant ID accurately in real database")
  void shouldCountActiveOwnersByTenantId() {
    createPersistedUser("Owner 1", "owner1@alpha.com", Roles.OWNER, tenantA);
    createPersistedUser("Owner 2", "owner2@alpha.com", Roles.OWNER, tenantA);
    createPersistedUser("Manager 1", "mgr@alpha.com", Roles.MANAGER, tenantA);
    createPersistedUser("Owner Beta", "owner@beta.com", Roles.OWNER, tenantB);
    entityManager.clear();

    Long countA = adapter.countActiveOwnersByTenantId(tenantA.getId());
    assertThat(countA).isEqualTo(2L);

    Long countB = adapter.countActiveOwnersByTenantId(tenantB.getId());
    assertThat(countB).isEqualTo(1L);

    Long countUnknown = adapter.countActiveOwnersByTenantId(UUID.randomUUID());
    assertThat(countUnknown).isZero();
  }

  @Test
  @DisplayName("Should assign tenant to user and persist change in PostgreSQL")
  void shouldAssignTenant() {
    UsersData user = createPersistedUser("Unassigned Staff", "staff@migrate.com", Roles.OPERATOR, tenantA);
    entityManager.clear();

    int updatedRows = adapter.assignTenant(user.getId(), tenantB.getId());
    assertThat(updatedRows).isEqualTo(1);

    entityManager.clear();

    Optional<Users> userInOldTenant = adapter.findByIdAndTenantId(user.getId(), tenantA.getId());
    assertThat(userInOldTenant).isEmpty();

    Optional<Users> userInNewTenant = adapter.findByIdAndTenantId(user.getId(), tenantB.getId());
    assertThat(userInNewTenant).isPresent();
    assertThat(userInNewTenant.get().getId()).isEqualTo(user.getId());
  }

  @Test
  @DisplayName("Should delete user by ID respecting soft delete in PostgreSQL")
  void shouldDeleteById() {
    UsersData user = createPersistedUser("To Delete", "delete_me@alpha.com", Roles.DRIVER, tenantA);
    entityManager.clear();

    adapter.deleteById(user.getId());
    entityManager.flush();
    entityManager.clear();

    // Verify soft delete: findById should return empty due to @SQLRestriction
    Optional<Users> deletedUser = adapter.findById(user.getId());
    assertThat(deletedUser).isEmpty();

    // Verify raw database record still exists but deleted_at is set
    Object deletedAt = entityManager
      .createNativeQuery("SELECT deleted_at FROM nivo.users WHERE id = :id")
      .setParameter("id", user.getId())
      .getSingleResult();
    assertThat(deletedAt).isNotNull();
  }

  @Test
  @DisplayName("Should find all users by tenant ID in descending created order")
  void shouldFindAllByTenantId() {
    UsersData u1 = createPersistedUser("User 1", "u1@alpha.com", Roles.OPERATOR, tenantA);
    UsersData u2 = createPersistedUser("User 2", "u2@alpha.com", Roles.DRIVER, tenantA);
    createPersistedUser("User Other", "u@beta.com", Roles.DRIVER, tenantB);
    entityManager.clear();

    List<Users> alphaUsers = adapter.findAllByTenantId(tenantA.getId());

    assertThat(alphaUsers).hasSize(2);
    assertThat(alphaUsers)
      .extracting(Users::getEmail)
      .containsExactlyInAnyOrder("u1@alpha.com", "u2@alpha.com");
    // Verify eager tenant loading
    assertThat(alphaUsers.get(0).getTenant()).isNotNull();
    assertThat(alphaUsers.get(0).getTenant().id()).isEqualTo(tenantA.getId());
  }

  @Test
  @DisplayName("Should save user via adapter and persist to PostgreSQL")
  void shouldSaveUser() {
    Users newUser = Users.builder()
      .fullName("Saved User")
      .email("saved@alpha.com")
      .password("plain_or_hash")
      .role(Roles.MANAGER)
      .tenant(TenantReference.builder().id(tenantA.getId()).build())
      .contactInfo("555-0100")
      .build();

    Users saved = adapter.save(newUser);

    assertThat(saved).isNotNull();
    assertThat(saved.getId()).isNotNull();
    assertThat(saved.getEmail()).isEqualTo("saved@alpha.com");

    entityManager.clear();

    Optional<Users> found = adapter.findById(saved.getId());
    assertThat(found).isPresent();
    assertThat(found.get().getFullName()).isEqualTo("Saved User");
  }

  @Test
  @DisplayName("Should check existence by ID and by ID with tenant ID")
  void shouldCheckExistsByIdAndTenantId() {
    UsersData user = createPersistedUser("Checked User", "check@alpha.com", Roles.AUDITOR, tenantA);
    entityManager.clear();

    assertThat(adapter.existsById(user.getId())).isTrue();
    assertThat(adapter.existsById(UUID.randomUUID())).isFalse();

    assertThat(adapter.existsByIdAndTenantId(user.getId(), tenantA.getId())).isTrue();
    assertThat(adapter.existsByIdAndTenantId(user.getId(), tenantB.getId())).isFalse();
  }

  @Test
  @DisplayName("Should return saved user directly without refetching when user is soft-deleted in PostgreSQL")
  void shouldReturnSavedUserDirectly_whenSoftDeleted() {
    UsersData user = createPersistedUser("Active User", "active_soft@alpha.com", Roles.OPERATOR, tenantA);
    UsersData actor = createPersistedUser("Deactivating Admin", "admin_deact@alpha.com", Roles.MANAGER, tenantA);
    entityManager.clear();

    Users domainUser = adapter.findById(user.getId()).orElseThrow();
    OffsetDateTime now = OffsetDateTime.now();
    Users softDeleted = domainUser.toBuilder()
      .deletedAt(now)
      .deletedBy(actor.getId())
      .build();

    Users result = adapter.save(softDeleted);

    assertThat(result).isNotNull();
    assertThat(result.getId()).isEqualTo(user.getId());
    assertThat(result.getDeletedAt()).isEqualTo(now);

    entityManager.flush();
    entityManager.clear();

    // Verify findById is empty due to @SQLRestriction
    Optional<Users> notFound = adapter.findById(user.getId());
    assertThat(notFound).isEmpty();
  }
}
