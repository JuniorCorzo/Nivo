package dev.angelcorzo.nivo.domain.usecase.policy;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import dev.angelcorzo.nivo.domain.model.specialpolicies.SpecialPolicies;
import dev.angelcorzo.nivo.domain.model.specialpolicies.enums.ModifiesTypes;
import dev.angelcorzo.nivo.domain.model.specialpolicies.enums.OperationsTypes;
import dev.angelcorzo.nivo.domain.model.specialpolicies.exceptions.InvalidSpecialPolicyCombinationException;
import dev.angelcorzo.nivo.domain.model.specialpolicies.gateways.SpecialPoliciesRepository;
import dev.angelcorzo.nivo.domain.model.tenants.Tenants;
import dev.angelcorzo.nivo.domain.model.tenants.gateways.TenantsRepository;
import java.math.BigDecimal;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

@DisplayName("CreateSpecialPolicyUseCase Tests")
class CreateSpecialPolicyUseCaseTest {

  private SpecialPoliciesRepository specialPoliciesRepository;
  private TenantsRepository tenantsRepository;
  private CreateSpecialPolicyUseCase useCase;

  @BeforeEach
  void setUp() {
    specialPoliciesRepository = mock(SpecialPoliciesRepository.class);
    tenantsRepository = mock(TenantsRepository.class);
    useCase = new CreateSpecialPolicyUseCase(specialPoliciesRepository, tenantsRepository);
  }

  @Test
  @DisplayName("Should create special policy successfully")
  void shouldCreateSpecialPolicySuccessfully() {
    UUID tenantId = UUID.randomUUID();
    Tenants tenant = Tenants.builder().id(tenantId).companyName("Central Parking").build();

    CreateSpecialPolicyUseCase.CreateSpecialPolicyCommand command = CreateSpecialPolicyUseCase.CreateSpecialPolicyCommand
      .builder()
      .name("Weekend Discount")
      .tenantId(tenantId)
      .modifies(ModifiesTypes.PRICE)
      .operation(OperationsTypes.PERCENTAGE)
      .valueToModify(BigDecimal.valueOf(15))
      .build();

    when(tenantsRepository.getReferenceById(tenantId)).thenReturn(tenant);
    when(specialPoliciesRepository.save(any(SpecialPolicies.class))).thenAnswer(i -> i.getArgument(0));

    SpecialPolicies result = useCase.execute(command);

    assertThat(result).isNotNull();
    assertThat(result.getName()).isEqualTo("Weekend Discount");
    assertThat(result.getValueToModify()).isEqualTo(BigDecimal.valueOf(15));
    assertThat(result.isActive()).isTrue();
    verify(specialPoliciesRepository).save(any(SpecialPolicies.class));
  }

  @Test
  @DisplayName("Should reject SURCHARGE with SUBTRACT operation")
  void shouldRejectSurchargeWithSubtract() {
    CreateSpecialPolicyUseCase.CreateSpecialPolicyCommand command = CreateSpecialPolicyUseCase.CreateSpecialPolicyCommand
      .builder()
      .name("Invalid Surcharge")
      .tenantId(UUID.randomUUID())
      .modifies(ModifiesTypes.SURCHARGE)
      .operation(OperationsTypes.SUBTRACT)
      .valueToModify(BigDecimal.valueOf(5000))
      .build();

    assertThatThrownBy(() -> useCase.execute(command)).isInstanceOf(InvalidSpecialPolicyCombinationException.class);
    verify(specialPoliciesRepository, never()).save(any());
  }

  @Test
  @DisplayName("Should reject DISCOUNT with SET operation")
  void shouldRejectDiscountWithSet() {
    CreateSpecialPolicyUseCase.CreateSpecialPolicyCommand command = CreateSpecialPolicyUseCase.CreateSpecialPolicyCommand
      .builder()
      .name("Invalid Discount")
      .tenantId(UUID.randomUUID())
      .modifies(ModifiesTypes.DISCOUNT)
      .operation(OperationsTypes.SET)
      .valueToModify(BigDecimal.valueOf(5000))
      .build();

    assertThatThrownBy(() -> useCase.execute(command)).isInstanceOf(InvalidSpecialPolicyCombinationException.class);
    verify(specialPoliciesRepository, never()).save(any());
  }
}
