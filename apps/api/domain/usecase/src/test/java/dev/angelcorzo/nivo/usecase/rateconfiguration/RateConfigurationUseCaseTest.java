package dev.angelcorzo.nivo.usecase.rateconfiguration;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import dev.angelcorzo.nivo.model.parkinglots.ParkingLots;
import dev.angelcorzo.nivo.model.parkinglots.exceptions.ParkingNotExistsException;
import dev.angelcorzo.nivo.model.parkinglots.gateways.ParkingLotsRepository;
import dev.angelcorzo.nivo.model.rates.Rates;
import dev.angelcorzo.nivo.model.rates.enums.TimeUnitsRate;
import dev.angelcorzo.nivo.model.rates.enums.VehicleType;
import dev.angelcorzo.nivo.model.rates.gateways.RatesRepository;
import dev.angelcorzo.nivo.model.specialpolicies.SpecialPolicies;
import dev.angelcorzo.nivo.model.specialpolicies.exceptions.SpecialPolicyNotFoundException;
import dev.angelcorzo.nivo.model.specialpolicies.gateways.SpecialPoliciesRepository;
import dev.angelcorzo.nivo.model.tenants.Tenants;
import dev.angelcorzo.nivo.model.tenants.gateways.TenantsRepository;
import java.math.BigDecimal;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

@DisplayName("RateConfigurationUseCase Tests")
class RateConfigurationUseCaseTest {

  private RatesRepository ratesRepository;
  private SpecialPoliciesRepository specialPoliciesRepository;
  private ParkingLotsRepository parkingLotsRepository;
  private TenantsRepository tenantsRepository;
  private RateConfigurationUseCase useCase;

  @BeforeEach
  void setUp() {
    ratesRepository = mock(RatesRepository.class);
    specialPoliciesRepository = mock(SpecialPoliciesRepository.class);
    parkingLotsRepository = mock(ParkingLotsRepository.class);
    tenantsRepository = mock(TenantsRepository.class);

    useCase =
        new RateConfigurationUseCase(
            ratesRepository, specialPoliciesRepository, parkingLotsRepository, tenantsRepository);
  }

  @Nested
  @DisplayName("Happy Path")
  class HappyPath {

    @Test
    @DisplayName("Should successfully create tariff without special policy")
    void shouldCreateTariffWithoutSpecialPolicy() {
      // Arrange
      UUID tenantId = UUID.randomUUID();
      UUID parkingLotId = UUID.randomUUID();

      RateConfigurationUseCase.CreateTariff command =
          RateConfigurationUseCase.CreateTariff.builder()
              .tenantId(tenantId)
              .parkingLotId(parkingLotId)
              .name("Standard Rate")
              .description("Hourly rate for cars")
              .pricePerUnit(BigDecimal.valueOf(5000))
              .timeUnit(TimeUnitsRate.HOURS)
              .minChargeTimeMinutes("15")
              .vehicleType(VehicleType.CAR)
              .build();

      Tenants tenant = Tenants.builder().id(tenantId).companyName("Central Park").build();
      ParkingLots parking = ParkingLots.builder().id(parkingLotId).name("Main Lot").build();

      when(parkingLotsRepository.existsById(parkingLotId)).thenReturn(true);
      when(tenantsRepository.getReferenceById(tenantId)).thenReturn(tenant);
      when(parkingLotsRepository.getReferenceById(parkingLotId)).thenReturn(parking);
      when(ratesRepository.save(any(Rates.class)))
          .thenAnswer(invocation -> invocation.getArgument(0));

      // Act
      Rates result = useCase.execute(command);

      // Assert
      assertThat(result).isNotNull();
      assertThat(result.getName()).isEqualTo("Standard Rate");
      assertThat(result.getPricePerUnit()).isEqualTo(BigDecimal.valueOf(5000));
      assertThat(result.getSpecialPolicy()).isNull();
      verify(ratesRepository).save(any(Rates.class));
    }

    @Test
    @DisplayName("Should successfully create tariff with special policy")
    void shouldCreateTariffWithSpecialPolicy() {
      // Arrange
      UUID tenantId = UUID.randomUUID();
      UUID parkingLotId = UUID.randomUUID();
      UUID policyId = UUID.randomUUID();

      RateConfigurationUseCase.CreateTariff command =
          RateConfigurationUseCase.CreateTariff.builder()
              .tenantId(tenantId)
              .parkingLotId(parkingLotId)
              .name("Promo Rate")
              .description("Promo rate")
              .pricePerUnit(BigDecimal.valueOf(4000))
              .timeUnit(TimeUnitsRate.HOURS)
              .minChargeTimeMinutes("0")
              .vehicleType(VehicleType.MOTORCYCLE)
              .specialPolicyId(policyId)
              .build();

      Tenants tenant = Tenants.builder().id(tenantId).companyName("Central Park").build();
      ParkingLots parking = ParkingLots.builder().id(parkingLotId).name("Main Lot").build();
      SpecialPolicies policy = SpecialPolicies.builder().id(policyId).name("Night Discount").build();

      when(specialPoliciesRepository.existsById(policyId)).thenReturn(true);
      when(parkingLotsRepository.existsById(parkingLotId)).thenReturn(true);
      when(tenantsRepository.getReferenceById(tenantId)).thenReturn(tenant);
      when(parkingLotsRepository.getReferenceById(parkingLotId)).thenReturn(parking);
      when(specialPoliciesRepository.getReferenceById(policyId)).thenReturn(policy);
      when(ratesRepository.save(any(Rates.class)))
          .thenAnswer(invocation -> invocation.getArgument(0));

      // Act
      Rates result = useCase.execute(command);

      // Assert
      assertThat(result).isNotNull();
      assertThat(result.getSpecialPolicy()).isNotNull();
      assertThat(result.getSpecialPolicy().name()).isEqualTo("Night Discount");
    }
  }

  @Nested
  @DisplayName("Validation & Error Cases")
  class ErrorCases {

    @Test
    @DisplayName("Should throw SpecialPolicyNotFoundException when special policy does not exist")
    void shouldThrowWhenSpecialPolicyNotFound() {
      UUID policyId = UUID.randomUUID();
      RateConfigurationUseCase.CreateTariff command =
          RateConfigurationUseCase.CreateTariff.builder()
              .parkingLotId(UUID.randomUUID())
              .specialPolicyId(policyId)
              .build();

      when(specialPoliciesRepository.existsById(policyId)).thenReturn(false);

      assertThatThrownBy(() -> useCase.execute(command))
          .isInstanceOf(SpecialPolicyNotFoundException.class);
    }

    @Test
    @DisplayName("Should throw ParkingNotExistsException when parking lot does not exist")
    void shouldThrowWhenParkingLotNotFound() {
      UUID parkingId = UUID.randomUUID();
      RateConfigurationUseCase.CreateTariff command =
          RateConfigurationUseCase.CreateTariff.builder()
              .parkingLotId(parkingId)
              .build();

      when(parkingLotsRepository.existsById(parkingId)).thenReturn(false);

      assertThatThrownBy(() -> useCase.execute(command))
          .isInstanceOf(ParkingNotExistsException.class);
    }
  }
}
