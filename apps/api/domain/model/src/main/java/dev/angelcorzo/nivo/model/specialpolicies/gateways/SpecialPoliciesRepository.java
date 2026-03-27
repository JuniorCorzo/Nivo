package dev.angelcorzo.nivo.model.specialpolicies.gateways;

import dev.angelcorzo.nivo.model.specialpolicies.SpecialPolicies;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SpecialPoliciesRepository {
  List<SpecialPolicies> findAllByTenantId(UUID tenantId);

  Optional<SpecialPolicies> findById(UUID id);

  Boolean existsById(UUID id);

  SpecialPolicies getReferenceById(UUID id);

  SpecialPolicies save(SpecialPolicies specialPolicies);

  void deleteById(UUID uuid);
}
