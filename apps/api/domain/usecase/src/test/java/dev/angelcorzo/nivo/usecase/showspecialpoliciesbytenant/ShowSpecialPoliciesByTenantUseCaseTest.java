package dev.angelcorzo.nivo.usecase.showspecialpoliciesbytenant;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

import dev.angelcorzo.nivo.model.specialpolicies.SpecialPolicies;
import dev.angelcorzo.nivo.model.specialpolicies.gateways.SpecialPoliciesRepository;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

@DisplayName("ShowSpecialPoliciesByTenantUseCase Tests")
class ShowSpecialPoliciesByTenantUseCaseTest {

  private SpecialPoliciesRepository specialPoliciesRepository;
  private ShowSpecialPoliciesByTenantUseCase useCase;

  @BeforeEach
  void setUp() {
    specialPoliciesRepository = mock(SpecialPoliciesRepository.class);
    useCase = new ShowSpecialPoliciesByTenantUseCase(specialPoliciesRepository);
  }

  @Test
  @DisplayName("Should return special policies for tenant")
  void shouldReturnSpecialPoliciesForTenant() {
    UUID tenantId = UUID.randomUUID();
    SpecialPolicies policy = SpecialPolicies.builder().id(UUID.randomUUID()).name("Weekend Promo").build();

    when(specialPoliciesRepository.findAllByTenantId(tenantId)).thenReturn(List.of(policy));

    List<SpecialPolicies> result = useCase.execute(tenantId);

    assertThat(result).hasSize(1);
    assertThat(result.get(0).getName()).isEqualTo("Weekend Promo");
    verify(specialPoliciesRepository).findAllByTenantId(tenantId);
  }
}
