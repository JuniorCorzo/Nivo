package dev.angelcorzo.nivo.jpa.specialpolicies;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

import dev.angelcorzo.nivo.jpa.specialpolicies.mappers.SpecialPoliciesMapper;
import dev.angelcorzo.nivo.model.specialpolicies.SpecialPolicies;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

@DisplayName("SpecialPoliciesAdapter Unit Tests")
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
    UUID tenantId = UUID.randomUUID();
    SpecialPoliciesData data = new SpecialPoliciesData();
    SpecialPolicies entity = SpecialPolicies.builder().id(UUID.randomUUID()).build();

    when(repository.findAllByTenant_Id(tenantId)).thenReturn(List.of(data));
    when(mapper.toEntity(data)).thenReturn(entity);

    List<SpecialPolicies> result = adapter.findAllByTenantId(tenantId);

    assertThat(result).hasSize(1);
    verify(repository).findAllByTenant_Id(tenantId);
  }

  @Test
  @DisplayName("Should delete special policy by ID")
  void shouldDeleteById() {
    UUID id = UUID.randomUUID();

    adapter.deleteById(id);

    verify(repository).deleteById(id);
  }
}
