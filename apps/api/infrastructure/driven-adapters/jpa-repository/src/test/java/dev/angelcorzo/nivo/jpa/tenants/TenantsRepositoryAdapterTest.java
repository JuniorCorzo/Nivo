package dev.angelcorzo.nivo.jpa.tenants;

import static org.assertj.core.api.Assertions.assertThat;

import dev.angelcorzo.nivo.jpa.tenants.mappers.TenantsMapperJpaImpl;
import dev.angelcorzo.nivo.model.tenants.Tenants;
import java.util.List;
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
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;

@ActiveProfiles("test")
@DataJpaTest
@Import({TenantsRepositoryAdapter.class, TenantsMapperJpaImpl.class})
@AutoConfigureTestDatabase(
    replace = AutoConfigureTestDatabase.Replace.NONE,
    connection = EmbeddedDatabaseConnection.NONE)
@DisplayName("TenantsRepositoryAdapter Tests")
class TenantsRepositoryAdapterTest {

  @Autowired private TenantsRepositoryAdapter tenantsRepositoryAdapter;
  private Tenants tenant1;

  @BeforeEach
  void setUp() {
    tenant1 = Tenants.builder().companyName("Company One").build();

    tenant1 = tenantsRepositoryAdapter.save(tenant1);
  }

  @Nested
  @DisplayName("Save Operations")
  class SaveOperations {

    @Test
    @DisplayName("Should save a tenant successfully")
    void shouldSaveTenantSuccessfully() {
      // Given
      Tenants newTenantModel = Tenants.builder().companyName("New Company").build();

      // When
      Tenants savedTenant = tenantsRepositoryAdapter.save(newTenantModel);

      // Then
      assertThat(savedTenant).isNotNull();
      assertThat(savedTenant.getId()).isNotNull();
      assertThat(savedTenant.getCompanyName()).isEqualTo("New Company");

      Optional<Tenants> found = tenantsRepositoryAdapter.findById(savedTenant.getId());
      assertThat(found).isPresent();
      assertThat(found.get().getCompanyName()).isEqualTo("New Company");
    }
  }

  @Nested
  @DisplayName("Find Operations")
  class FindOperations {

    @Test
    @DisplayName("Should find a tenant by ID when it exists")
    void shouldFindTenantByIdWhenExists() {
      // When
      Optional<Tenants> found = tenantsRepositoryAdapter.findById(tenant1.getId());

      // Then
      assertThat(found).isPresent();
      assertThat(found.get().getId()).isEqualTo(tenant1.getId());
      assertThat(found.get().getCompanyName()).isEqualTo("Company One");
    }

    @Test
    @DisplayName("Should return empty optional when tenant not found by ID")
    void shouldReturnEmptyWhenTenantNotFoundById() {
      // When
      Optional<Tenants> found = tenantsRepositoryAdapter.findById(UUID.randomUUID());

      // Then
      assertThat(found).isNotPresent();
    }

    @Test
    @DisplayName("Should find all tenants")
    void shouldFindAllTenants() {
      // Given
      Tenants tenant2 =
          tenantsRepositoryAdapter.save(Tenants.builder().companyName("Company Two").build());

      // When
      List<Tenants> allTenants = tenantsRepositoryAdapter.findAll();

      // Then
      assertThat(allTenants).isNotNull();
      assertThat(allTenants.size()).isEqualTo(2);
      assertThat(allTenants).extracting(Tenants::getId).contains(tenant1.getId(), tenant2.getId());
    }
  }

  @Nested
  @DisplayName("Delete Operations")
  class DeleteOperations {

    @Test
    @DisplayName("Should delete a tenant by ID")
    void shouldDeleteTenantById() {
      // Given
      UUID tenantId = tenant1.getId();
      assertThat(tenantsRepositoryAdapter.existsById(tenantId)).isTrue();

      // When
      tenantsRepositoryAdapter.deleteById(tenantId);

      // Then
      // Due to @SQLRestriction, findById should now return empty
      Optional<Tenants> found = tenantsRepositoryAdapter.findById(tenantId);
      assertThat(found).isNotPresent();
    }
  }
}
