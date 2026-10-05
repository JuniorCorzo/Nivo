package dev.angelcorzo.nivo.domain.usecase.rate;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

import dev.angelcorzo.nivo.domain.model.authentication.gateway.AuthenticationContextGateway;
import dev.angelcorzo.nivo.domain.model.rates.Rates;
import dev.angelcorzo.nivo.domain.model.rates.exceptions.RateNotFoundException;
import dev.angelcorzo.nivo.domain.model.rates.gateways.RatesRepository;
import dev.angelcorzo.nivo.domain.model.tenants.valueobject.TenantReference;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

@DisplayName("DeleteRateUseCase Tests")
class DeleteRateUseCaseTest {

  private RatesRepository ratesRepository;
  private AuthenticationContextGateway authenticationContext;
  private DeleteRateUseCase useCase;

  @BeforeEach
  void setUp() {
    ratesRepository = mock(RatesRepository.class);
    authenticationContext = mock(AuthenticationContextGateway.class);
    useCase = new DeleteRateUseCase(ratesRepository, authenticationContext);
  }

  @Test
  @DisplayName("Should delete rate by ID when tenant matches")
  void shouldDeleteRateByIdWhenTenantMatches() {
    UUID tenantId = UUID.randomUUID();
    UUID rateId = UUID.randomUUID();
    Rates rate =
        Rates.builder()
            .id(rateId)
            .tenant(TenantReference.builder().id(tenantId).build())
            .build();

    when(ratesRepository.findById(rateId)).thenReturn(Optional.of(rate));

    useCase.execute(rateId, tenantId);

    verify(ratesRepository).deleteById(rateId);
  }

  @Test
  @DisplayName("Should delete rate using AuthenticationContextGateway when tenantId is not passed")
  void shouldDeleteRateUsingAuthenticationContextGateway() {
    UUID tenantId = UUID.randomUUID();
    UUID rateId = UUID.randomUUID();
    Rates rate =
        Rates.builder()
            .id(rateId)
            .tenant(TenantReference.builder().id(tenantId).build())
            .build();

    when(authenticationContext.getCurrentTenantId()).thenReturn(tenantId);
    when(ratesRepository.findById(rateId)).thenReturn(Optional.of(rate));

    useCase.execute(rateId);

    verify(ratesRepository).deleteById(rateId);
  }

  @Test
  @DisplayName("Should throw RateNotFoundException when rate does not exist")
  void shouldThrowWhenRateNotFound() {
    UUID tenantId = UUID.randomUUID();
    UUID rateId = UUID.randomUUID();

    when(ratesRepository.findById(rateId)).thenReturn(Optional.empty());

    assertThatThrownBy(() -> useCase.execute(rateId, tenantId))
        .isInstanceOf(RateNotFoundException.class);

    verify(ratesRepository, never()).deleteById(any());
  }

  @Test
  @DisplayName("Should throw RateNotFoundException when rate belongs to another tenant")
  void shouldThrowRateNotFoundExceptionWhenTenantDoesNotMatch() {
    UUID tenantA = UUID.randomUUID();
    UUID tenantB = UUID.randomUUID();
    UUID rateId = UUID.randomUUID();
    Rates rate =
        Rates.builder()
            .id(rateId)
            .tenant(TenantReference.builder().id(tenantA).build())
            .build();

    when(ratesRepository.findById(rateId)).thenReturn(Optional.of(rate));

    assertThatThrownBy(() -> useCase.execute(rateId, tenantB))
        .isInstanceOf(RateNotFoundException.class);

    verify(ratesRepository, never()).deleteById(any());
  }

  @Test
  @DisplayName("Should throw RateNotFoundException when rate has null tenant")
  void shouldThrowRateNotFoundExceptionWhenTenantIsNull() {
    UUID tenantId = UUID.randomUUID();
    UUID rateId = UUID.randomUUID();
    Rates rate = Rates.builder().id(rateId).tenant(null).build();

    when(ratesRepository.findById(rateId)).thenReturn(Optional.of(rate));

    assertThatThrownBy(() -> useCase.execute(rateId, tenantId))
        .isInstanceOf(RateNotFoundException.class);

    verify(ratesRepository, never()).deleteById(any());
  }
}
