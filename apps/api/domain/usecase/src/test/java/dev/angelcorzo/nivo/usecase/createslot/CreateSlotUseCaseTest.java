package dev.angelcorzo.nivo.usecase.createslot;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import dev.angelcorzo.nivo.model.parkinglots.ParkingLots;
import dev.angelcorzo.nivo.model.parkinglots.exceptions.ParkingNotExistsException;
import dev.angelcorzo.nivo.model.parkinglots.gateways.ParkingLotsRepository;
import dev.angelcorzo.nivo.model.slots.Slots;
import dev.angelcorzo.nivo.model.slots.enums.SlotStatus;
import dev.angelcorzo.nivo.model.slots.enums.SlotType;
import dev.angelcorzo.nivo.model.slots.gateways.SlotsRepository;
import dev.angelcorzo.nivo.model.tenants.Tenants;
import dev.angelcorzo.nivo.model.tenants.exceptions.TenantNotExistsException;
import dev.angelcorzo.nivo.model.tenants.gateways.TenantsRepository;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

@DisplayName("CreateSlotUseCase Tests")
class CreateSlotUseCaseTest {

  private SlotsRepository slotsRepository;
  private TenantsRepository tenantsRepository;
  private ParkingLotsRepository parkingLotsRepository;
  private CreateSlotUseCase useCase;

  @BeforeEach
  void setUp() {
    slotsRepository = mock(SlotsRepository.class);
    tenantsRepository = mock(TenantsRepository.class);
    parkingLotsRepository = mock(ParkingLotsRepository.class);
    useCase = new CreateSlotUseCase(slotsRepository, tenantsRepository, parkingLotsRepository);
  }

  @Test
  @DisplayName("Should create slot successfully")
  void shouldCreateSlotSuccessfully() {
    UUID tenantId = UUID.randomUUID();
    UUID parkingId = UUID.randomUUID();

    CreateSlotUseCase.CreateSlotCommand command =
        new CreateSlotUseCase.CreateSlotCommand(parkingId, tenantId, "S-101", SlotType.CAR);

    Tenants tenant = Tenants.builder().id(tenantId).companyName("Central Park").build();
    ParkingLots parking = ParkingLots.builder().id(parkingId).name("Main Lot").build();

    when(tenantsRepository.existsById(tenantId)).thenReturn(true);
    when(parkingLotsRepository.existsById(parkingId)).thenReturn(true);
    when(tenantsRepository.getReferenceById(tenantId)).thenReturn(tenant);
    when(parkingLotsRepository.getReferenceById(parkingId)).thenReturn(parking);
    when(slotsRepository.save(any(Slots.class))).thenAnswer(i -> i.getArgument(0));

    Slots result = useCase.execute(command);

    assertThat(result).isNotNull();
    assertThat(result.getSlotNumber()).isEqualTo("S-101");
    assertThat(result.getStatus()).isEqualTo(SlotStatus.AVAILABLE);
    verify(slotsRepository).save(any(Slots.class));
  }

  @Test
  @DisplayName("Should throw TenantNotExistsException when tenant is not found")
  void shouldThrowWhenTenantNotFound() {
    UUID tenantId = UUID.randomUUID();
    UUID parkingId = UUID.randomUUID();
    CreateSlotUseCase.CreateSlotCommand command =
        new CreateSlotUseCase.CreateSlotCommand(parkingId, tenantId, "S-101", SlotType.CAR);

    when(tenantsRepository.existsById(tenantId)).thenReturn(false);

    assertThatThrownBy(() -> useCase.execute(command))
        .isInstanceOf(TenantNotExistsException.class);
  }

  @Test
  @DisplayName("Should throw ParkingNotExistsException when parking is not found")
  void shouldThrowWhenParkingNotFound() {
    UUID tenantId = UUID.randomUUID();
    UUID parkingId = UUID.randomUUID();
    CreateSlotUseCase.CreateSlotCommand command =
        new CreateSlotUseCase.CreateSlotCommand(parkingId, tenantId, "S-101", SlotType.CAR);

    when(tenantsRepository.existsById(tenantId)).thenReturn(true);
    when(parkingLotsRepository.existsById(parkingId)).thenReturn(false);

    assertThatThrownBy(() -> useCase.execute(command))
        .isInstanceOf(ParkingNotExistsException.class);
  }
}
