package dev.angelcorzo.nivo.domain.usecase.slot;

import dev.angelcorzo.nivo.domain.model.authentication.gateway.AuthenticationContextGateway;
import dev.angelcorzo.nivo.domain.model.slots.gateways.SlotsRepository;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public class BatchDeleteSlotsUseCase {
  private final SlotsRepository slotRepository;
  private final AuthenticationContextGateway authenticationContext;

  public void execute(List<UUID> slotIds) {
    final UUID currentTenantId = this.authenticationContext != null
      ? this.authenticationContext.getCurrentTenantId()
      : null;
    this.execute(slotIds, currentTenantId);
  }

  public void execute(List<UUID> slotIds, UUID tenantId) {
    if (slotIds == null || slotIds.isEmpty()) {
      return;
    }
    if (tenantId != null) {
      this.slotRepository.batchDelete(slotIds, tenantId);
    } else {
      this.slotRepository.batchDelete(slotIds);
    }
  }
}
