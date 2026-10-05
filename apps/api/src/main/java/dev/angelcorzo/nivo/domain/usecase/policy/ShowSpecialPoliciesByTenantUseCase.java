package dev.angelcorzo.nivo.domain.usecase.policy;

import dev.angelcorzo.nivo.domain.model.specialpolicies.SpecialPolicies;
import dev.angelcorzo.nivo.domain.model.specialpolicies.gateways.SpecialPoliciesRepository;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public class ShowSpecialPoliciesByTenantUseCase {
  private final SpecialPoliciesRepository specialPoliciesRepository;

  public List<SpecialPolicies> execute(UUID tenantId) {
    return this.specialPoliciesRepository.findAllByTenantId(tenantId);
  }
}
