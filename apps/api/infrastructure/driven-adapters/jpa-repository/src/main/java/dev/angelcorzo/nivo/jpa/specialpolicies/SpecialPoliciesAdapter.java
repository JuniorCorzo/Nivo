package dev.angelcorzo.nivo.jpa.specialpolicies;

import dev.angelcorzo.nivo.jpa.helper.AdapterOperations;
import dev.angelcorzo.nivo.jpa.specialpolicies.mappers.SpecialPoliciesMapper;
import dev.angelcorzo.nivo.model.specialpolicies.SpecialPolicies;
import dev.angelcorzo.nivo.model.specialpolicies.gateways.SpecialPoliciesRepository;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Repository;

@Repository
public class SpecialPoliciesAdapter
    extends AdapterOperations<
        SpecialPolicies, SpecialPoliciesData, UUID, SpecialPoliciesRepositoryData>
    implements SpecialPoliciesRepository {

  /**
   * Constructor for AdapterOperations.
   *
   * @param repository The JPA repository instance.
   * @param mapper The mapper for converting between domain and data entities.
   */
  protected SpecialPoliciesAdapter(
      SpecialPoliciesRepositoryData repository, SpecialPoliciesMapper mapper) {
    super(repository, mapper);
  }

  @Override
  public List<SpecialPolicies> findAllByTenantId(UUID tenantId) {
    return super.repository.findAllByTenant_Id(tenantId).stream().map(super::toEntity).toList();
  }

  @Override
  public Boolean existsById(UUID id) {
    return super.repository.existsById(id);
  }

  @Override
  public SpecialPolicies getReferenceById(UUID id) {
    return super.toEntity(super.repository.getReferenceById(id));
  }

  @Override
  public void deleteById(UUID uuid) {
    super.repository.deleteById(uuid);
  }
}
