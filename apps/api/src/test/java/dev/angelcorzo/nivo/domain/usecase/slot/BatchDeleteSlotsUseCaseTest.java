package dev.angelcorzo.nivo.domain.usecase.slot;

import static org.mockito.Mockito.*;

import dev.angelcorzo.nivo.domain.model.slots.gateways.SlotsRepository;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

@DisplayName("BatchDeleteSlotsUseCase Tests")
class BatchDeleteSlotsUseCaseTest {

  private SlotsRepository slotsRepository;
  private dev.angelcorzo.nivo.domain.model.authentication.gateway.AuthenticationContextGateway authenticationContext;
  private BatchDeleteSlotsUseCase useCase;

  @BeforeEach
  void setUp() {
    slotsRepository = mock(SlotsRepository.class);
    authenticationContext = mock(
      dev.angelcorzo.nivo.domain.model.authentication.gateway.AuthenticationContextGateway.class);
    useCase = new BatchDeleteSlotsUseCase(slotsRepository, authenticationContext);
  }

  @Test
  @DisplayName("Should batch delete slots by ids")
  void shouldBatchDeleteSlots() {
    List<UUID> slotIds = List.of(UUID.randomUUID(), UUID.randomUUID(), UUID.randomUUID());

    useCase.execute(slotIds);

    verify(slotsRepository).batchDelete(slotIds);
  }

  @Test
  @DisplayName("Should batch delete slots with tenantId")
  void shouldBatchDeleteSlotsWithTenantId() {
    List<UUID> slotIds = List.of(UUID.randomUUID(), UUID.randomUUID());
    UUID tenantId = UUID.randomUUID();

    useCase.execute(slotIds, tenantId);

    verify(slotsRepository).batchDelete(slotIds, tenantId);
  }
}
