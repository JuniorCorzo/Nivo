package dev.angelcorzo.nivo.usecase.listparkinglots;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

import dev.angelcorzo.nivo.model.parkinglots.ParkingLotListItem;
import dev.angelcorzo.nivo.model.parkinglots.gateways.ParkingLotsRepository;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

@DisplayName("ListParkingLotsUseCase Tests")
class ListParkingLotsUseCaseTest {

  private ParkingLotsRepository parkingLotsRepository;
  private ListParkingLotsUseCase useCase;

  @BeforeEach
  void setUp() {
    parkingLotsRepository = mock(ParkingLotsRepository.class);
    useCase = new ListParkingLotsUseCase(parkingLotsRepository);
  }

  @Test
  @DisplayName("Should list parking lots by tenant")
  void shouldListParkingLotsByTenant() {
    UUID tenantId = UUID.randomUUID();
    ParkingLotListItem item = mock(ParkingLotListItem.class);

    when(parkingLotsRepository.findByTenantId(tenantId)).thenReturn(List.of(item));

    List<ParkingLotListItem> result = useCase.listParkingLots(tenantId);

    assertThat(result).hasSize(1);
    verify(parkingLotsRepository).findByTenantId(tenantId);
  }
}
