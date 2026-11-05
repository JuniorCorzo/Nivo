package dev.angelcorzo.nivo.infrastructure.adapter.jpa.specialpolicies;

import dev.angelcorzo.nivo.domain.model.specialpolicies.SpecialPolicies;
import dev.angelcorzo.nivo.domain.model.specialpolicies.gateways.SpecialPoliciesRepository;
import dev.angelcorzo.nivo.infrastructure.adapter.jpa.helper.AdapterOperations;
import dev.angelcorzo.nivo.infrastructure.adapter.jpa.specialpolicies.mappers.SpecialPoliciesMapper;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Repository;

/**
 * Pure JPA repository adapter for {@link SpecialPolicies}.
 */
@Repository("specialPoliciesAdapter")
public class SpecialPoliciesAdapter
  extends
    AdapterOperations<SpecialPolicies, SpecialPoliciesData, UUID, SpecialPoliciesRepositoryData>
  implements
    SpecialPoliciesRepository {

  public SpecialPoliciesAdapter(final SpecialPoliciesRepositoryData repository, final SpecialPoliciesMapper mapper) {
    super(repository, mapper);
  }

  @Override
  public List<SpecialPolicies> findAllByTenantId(final UUID tenantId) {
    return super.repository.findAllByTenant_Id(tenantId).stream().map(super::toEntity).toList();
  }

  @Override
  public Boolean existsById(final UUID id) {
    return super.repository.existsById(id);
  }

  @Override
  public SpecialPolicies getReferenceById(final UUID id) {
    return super.toEntity(super.repository.getReferenceById(id));
  }

  @Override
  public void deleteById(final UUID uuid) {
    super.repository.deleteById(uuid);
  }
}
