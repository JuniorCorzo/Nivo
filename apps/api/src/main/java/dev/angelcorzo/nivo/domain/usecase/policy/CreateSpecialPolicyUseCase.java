package dev.angelcorzo.nivo.domain.usecase.policy;

import dev.angelcorzo.nivo.domain.model.specialpolicies.SpecialPolicies;
import dev.angelcorzo.nivo.domain.model.specialpolicies.enums.ModifiesTypes;
import dev.angelcorzo.nivo.domain.model.specialpolicies.enums.OperationsTypes;
import dev.angelcorzo.nivo.domain.model.specialpolicies.gateways.SpecialPoliciesRepository;
import dev.angelcorzo.nivo.domain.model.tenants.gateways.TenantsRepository;
import dev.angelcorzo.nivo.domain.model.tenants.valueobject.TenantReference;
import java.math.BigDecimal;
import java.util.UUID;
import lombok.Builder;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public class CreateSpecialPolicyUseCase {
  private final SpecialPoliciesRepository specialPoliciesRepository;
  private final TenantsRepository tenantsRepository;

  public SpecialPolicies execute(CreateSpecialPolicyCommand specialPolicies) {
    final SpecialPolicies policies =
        SpecialPolicies.builder()
            .name(specialPolicies.name())
            .tenant(
                TenantReference.of(
                    this.tenantsRepository.getReferenceById(specialPolicies.tenantId())))
            .modifies(specialPolicies.modifies())
            .operation(specialPolicies.operation())
            .valueToModify(specialPolicies.valueToModify())
            .build();

    return this.specialPoliciesRepository.save(policies);
  }

  @Builder(toBuilder = true)
  public record CreateSpecialPolicyCommand(
      String name,
      UUID tenantId,
      ModifiesTypes modifies,
      OperationsTypes operation,
      BigDecimal valueToModify) {}
}
