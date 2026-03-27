package dev.angelcorzo.nivo.usecase.showspecialpoliciesbytenant;

import dev.angelcorzo.nivo.model.specialpolicies.SpecialPolicies;
import dev.angelcorzo.nivo.model.specialpolicies.gateways.SpecialPoliciesRepository;
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
