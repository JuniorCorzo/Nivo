package dev.angelcorzo.nivo.usecase.calculaterate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import dev.angelcorzo.nivo.model.authentication.gateway.AuthenticationContextGateway;
import dev.angelcorzo.nivo.model.parkingtickets.ParkingTicketNotFound;
import dev.angelcorzo.nivo.model.parkingtickets.ParkingTickets;
import dev.angelcorzo.nivo.model.parkingtickets.gateways.ParkingTicketsRepository;
import dev.angelcorzo.nivo.model.rates.enums.TimeUnitsRate;
import dev.angelcorzo.nivo.model.rates.valueobject.RateReference;
import dev.angelcorzo.nivo.model.specialpolicies.enums.ModifiesTypes;
import dev.angelcorzo.nivo.model.specialpolicies.enums.OperationsTypes;
import dev.angelcorzo.nivo.model.specialpolicies.valueobjects.SpecialPoliciesReference;
import dev.angelcorzo.nivo.model.tenants.Tenants;
import dev.angelcorzo.nivo.model.tenants.exceptions.TenantNotExistsException;
import dev.angelcorzo.nivo.model.tenants.gateways.TenantsRepository;
import dev.angelcorzo.nivo.usecase.calculaterate.dtos.PriceDetailed;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

@DisplayName("CalculateRateUseCase Tests")
class CalculateRateUseCaseTest {

  private TenantsRepository tenantsRepository;
  private ParkingTicketsRepository parkingTicketsRepository;
  private AuthenticationContextGateway authenticationContextGateway;
  private CalculateRateUseCase calculateRateUseCase;

  @BeforeEach
  void setUp() {
    tenantsRepository = mock(TenantsRepository.class);
    parkingTicketsRepository = mock(ParkingTicketsRepository.class);
    authenticationContextGateway = mock(AuthenticationContextGateway.class);
    calculateRateUseCase =
        new CalculateRateUseCase(
            tenantsRepository, parkingTicketsRepository, authenticationContextGateway);
  }

  @Nested
  @DisplayName("Happy Path")
  class HappyPath {

    @Test
    @DisplayName("Should calculate standard rate without special policy successfully")
    void shouldCalculateStandardRate() {
      // Arrange
      UUID tenantId = UUID.randomUUID();
      UUID ticketId = UUID.randomUUID();

      Tenants tenant = Tenants.builder().id(tenantId).companyName("Central Parking").build();

      RateReference rate =
          RateReference.builder()
              .id(UUID.randomUUID())
              .name("Hourly")
              .pricePerUnit(BigDecimal.valueOf(5000))
              .timeUnit(TimeUnitsRate.HOURS)
              .minChargeTimeMinutes("0")
              .build();

      ParkingTickets ticket =
          ParkingTickets.builder()
              .id(ticketId)
              .rate(rate)
              .entryTime(OffsetDateTime.now().minusHours(2))
              .build();

      when(authenticationContextGateway.getCurrentTenantId()).thenReturn(tenantId);
      when(tenantsRepository.findById(tenantId)).thenReturn(Optional.of(tenant));
      when(parkingTicketsRepository.findById(ticketId)).thenReturn(Optional.of(ticket));

      // Act
      PriceDetailed price = calculateRateUseCase.execute(ticketId);

      // Assert
      assertThat(price).isNotNull();
      assertThat(price.getSubtotal()).isNotNull();
      assertThat(price.getTotal()).isNotNull();
    }

    @Test
    @DisplayName("Should calculate rate with special policy discount successfully")
    void shouldCalculateRateWithSpecialPolicy() {
      // Arrange
      UUID tenantId = UUID.randomUUID();
      UUID ticketId = UUID.randomUUID();

      Tenants tenant = Tenants.builder().id(tenantId).companyName("Central Parking").build();

      SpecialPoliciesReference policy =
          SpecialPoliciesReference.builder()
              .id(UUID.randomUUID())
              .name("Weekend Discount")
              .modifies(ModifiesTypes.PRICE)
              .operation(OperationsTypes.SUBTRACT)
              .valueToModify(BigDecimal.valueOf(1000))
              .build();

      RateReference rate =
          RateReference.builder()
              .id(UUID.randomUUID())
              .name("Hourly Special")
              .pricePerUnit(BigDecimal.valueOf(5000))
              .timeUnit(TimeUnitsRate.HOURS)
              .minChargeTimeMinutes("0")
              .specialPolicy(policy)
              .build();

      ParkingTickets ticket =
          ParkingTickets.builder()
              .id(ticketId)
              .rate(rate)
              .entryTime(OffsetDateTime.now().minusHours(2))
              .build();

      when(authenticationContextGateway.getCurrentTenantId()).thenReturn(tenantId);
      when(tenantsRepository.findById(tenantId)).thenReturn(Optional.of(tenant));
      when(parkingTicketsRepository.findById(ticketId)).thenReturn(Optional.of(ticket));

      // Act
      PriceDetailed price = calculateRateUseCase.execute(ticketId);

      // Assert
      assertThat(price).isNotNull();
      assertThat(price.getBreakpoint()).isNotEmpty();
    }
  }

  @Nested
  @DisplayName("Validation & Error Cases")
  class ErrorCases {

    @Test
    @DisplayName("Should throw TenantNotExistsException when tenant is not found")
    void shouldThrowWhenTenantNotFound() {
      UUID tenantId = UUID.randomUUID();
      UUID ticketId = UUID.randomUUID();

      when(authenticationContextGateway.getCurrentTenantId()).thenReturn(tenantId);
      when(tenantsRepository.findById(tenantId)).thenReturn(Optional.empty());

      assertThatThrownBy(() -> calculateRateUseCase.execute(ticketId))
          .isInstanceOf(TenantNotExistsException.class);
    }

    @Test
    @DisplayName("Should throw ParkingTicketNotFound when ticket is not found")
    void shouldThrowWhenTicketNotFound() {
      UUID tenantId = UUID.randomUUID();
      UUID ticketId = UUID.randomUUID();
      Tenants tenant = Tenants.builder().id(tenantId).companyName("Central Parking").build();

      when(authenticationContextGateway.getCurrentTenantId()).thenReturn(tenantId);
      when(tenantsRepository.findById(tenantId)).thenReturn(Optional.of(tenant));
      when(parkingTicketsRepository.findById(ticketId)).thenReturn(Optional.empty());

      assertThatThrownBy(() -> calculateRateUseCase.execute(ticketId))
          .isInstanceOf(ParkingTicketNotFound.class);
    }
  }
}
