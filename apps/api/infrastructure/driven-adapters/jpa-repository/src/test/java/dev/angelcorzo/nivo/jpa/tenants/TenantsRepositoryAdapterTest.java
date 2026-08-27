package dev.angelcorzo.nivo.jpa.tenants;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

import dev.angelcorzo.nivo.jpa.tenants.mappers.TenantsMapper;
import dev.angelcorzo.nivo.model.tenants.Tenants;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

@DisplayName("TenantsRepositoryAdapter Unit Tests")
class TenantsRepositoryAdapterTest {

  private TenantsRepositoryData repository;
  private TenantsMapper mapper;
  private TenantsRepositoryAdapter adapter;

  @BeforeEach
  void setUp() {
    repository = mock(TenantsRepositoryData.class);
    mapper = mock(TenantsMapper.class);
    adapter = new TenantsRepositoryAdapter(repository, mapper);
  }

  @Test
  @DisplayName("Should find tenant by ID")
  void shouldFindTenantById() {
    UUID tenantId = UUID.randomUUID();
    TenantsData data = new TenantsData();
    Tenants entity = Tenants.builder().id(tenantId).companyName("Company One").build();

    when(repository.findById(tenantId)).thenReturn(Optional.of(data));
    when(mapper.toEntity(data)).thenReturn(entity);

    Optional<Tenants> result = adapter.findById(tenantId);

    assertThat(result).isPresent();
    assertThat(result.get().getId()).isEqualTo(tenantId);
  }

  @Test
  @DisplayName("Should find all tenants")
  void shouldFindAllTenants() {
    TenantsData data = new TenantsData();
    Tenants entity = Tenants.builder().id(UUID.randomUUID()).companyName("Company One").build();

    when(repository.findAll()).thenReturn(List.of(data));
    when(mapper.toEntity(data)).thenReturn(entity);

    List<Tenants> result = adapter.findAll();

    assertThat(result).hasSize(1);
    assertThat(result.get(0).getCompanyName()).isEqualTo("Company One");
  }

  @Test
  @DisplayName("Should check existence by ID")
  void shouldCheckExistsById() {
    UUID tenantId = UUID.randomUUID();
    when(repository.existsById(tenantId)).thenReturn(true);

    assertThat(adapter.existsById(tenantId)).isTrue();
    verify(repository).existsById(tenantId);
  }

  @Test
  @DisplayName("Should delete tenant by ID")
  void shouldDeleteTenantById() {
    UUID tenantId = UUID.randomUUID();

    adapter.deleteById(tenantId);

    verify(repository).deleteById(tenantId);
  }
}
