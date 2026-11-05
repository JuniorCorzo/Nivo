package dev.angelcorzo.nivo.infrastructure.adapter.jpa.specialpolicies;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

import dev.angelcorzo.nivo.domain.model.specialpolicies.SpecialPolicies;
import dev.angelcorzo.nivo.infrastructure.adapter.jpa.specialpolicies.mappers.SpecialPoliciesMapper;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

@DisplayName("SpecialPoliciesAdapter Pure JPA Unit Tests")
class SpecialPoliciesAdapterTest {

  private SpecialPoliciesRepositoryData repository;
  private SpecialPoliciesMapper mapper;
  private SpecialPoliciesAdapter adapter;

  @BeforeEach
  void setUp() {
    repository = mock(SpecialPoliciesRepositoryData.class);
    mapper = mock(SpecialPoliciesMapper.class);
    adapter = new SpecialPoliciesAdapter(repository, mapper);
  }

  @Test
  @DisplayName("Should find all special policies by tenant ID")
  void shouldFindAllByTenantId() {
    final UUID tenantId = UUID.randomUUID();
    final SpecialPoliciesData data = new SpecialPoliciesData();
    final SpecialPolicies entity = SpecialPolicies.builder().id(UUID.randomUUID()).build();

    when(repository.findAllByTenant_Id(tenantId)).thenReturn(List.of(data));
    when(mapper.toEntity(data)).thenReturn(entity);

    final List<SpecialPolicies> result = adapter.findAllByTenantId(tenantId);

    assertThat(result).hasSize(1).containsExactly(entity);
    verify(repository).findAllByTenant_Id(tenantId);
  }

  @Test
  @DisplayName("Should check existence by ID")
  void shouldCheckExistsById() {
    final UUID id = UUID.randomUUID();
    when(repository.existsById(id)).thenReturn(true);

    assertThat(adapter.existsById(id)).isTrue();
    verify(repository).existsById(id);
  }

  @Test
  @DisplayName("Should get reference by ID")
  void shouldGetReferenceById() {
    final UUID id = UUID.randomUUID();
    final SpecialPoliciesData data = new SpecialPoliciesData();
    final SpecialPolicies entity = SpecialPolicies.builder().id(id).build();

    when(repository.getReferenceById(id)).thenReturn(data);
    when(mapper.toEntity(data)).thenReturn(entity);

    final SpecialPolicies result = adapter.getReferenceById(id);

    assertThat(result).isEqualTo(entity);
    verify(repository).getReferenceById(id);
  }

  @Test
  @DisplayName("Should delete by ID")
  void shouldDeleteById() {
    final UUID id = UUID.randomUUID();

    adapter.deleteById(id);

    verify(repository).deleteById(id);
  }
}
