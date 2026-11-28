package dev.angelcorzo.nivo.domain.usecase.policy;

import dev.angelcorzo.nivo.domain.model.specialpolicies.SpecialPolicies;
import dev.angelcorzo.nivo.domain.model.specialpolicies.enums.ModifiesTypes;
import dev.angelcorzo.nivo.domain.model.specialpolicies.enums.OperationsTypes;
import dev.angelcorzo.nivo.domain.model.specialpolicies.exceptions.InvalidSpecialPolicyCombinationException;
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
    if (!isSupportedCombination(specialPolicies.modifies(), specialPolicies.operation())) {
      throw new InvalidSpecialPolicyCombinationException(specialPolicies.modifies(), specialPolicies.operation());
    }

    final SpecialPolicies policies = SpecialPolicies.builder()
      .name(specialPolicies.name())
      .tenant(TenantReference.of(this.tenantsRepository.getReferenceById(specialPolicies.tenantId())))
      .modifies(specialPolicies.modifies())
      .operation(specialPolicies.operation())
      .valueToModify(specialPolicies.valueToModify())
      .active(true)
      .build();

    return this.specialPoliciesRepository.save(policies);
  }

  public static boolean isSupportedCombination(ModifiesTypes modifies, OperationsTypes operation) {
    if (modifies == null || operation == null) {
      return false;
    }
    return switch (modifies) {
      case SURCHARGE -> operation == OperationsTypes.SET || operation == OperationsTypes.PERCENTAGE;
      case DISCOUNT -> operation == OperationsTypes.SUBTRACT || operation == OperationsTypes.PERCENTAGE;
      case PRICE, TIME -> true;
    };
  }

  @Builder(toBuilder = true)
  public record CreateSpecialPolicyCommand(String name, UUID tenantId, ModifiesTypes modifies,
    OperationsTypes operation, BigDecimal valueToModify) {
  }
}
