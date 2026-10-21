package dev.angelcorzo.nivo.infrastructure.adapter.jpa.parkingtickets;

import dev.angelcorzo.nivo.domain.model.parkingtickets.gateways.UnplatedTicketSequenceGateway;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;
import java.util.UUID;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class UnplatedTicketSequenceAdapter implements UnplatedTicketSequenceGateway {

  @PersistenceContext
  private EntityManager entityManager;

  @Override
  @Transactional
  public String nextTicketCode(final UUID parkingLotId) {
    final Query query = this.entityManager.createNativeQuery("SELECT next_unplated_ticket_code(:parkingLotId)");
    query.setParameter("parkingLotId", parkingLotId);
    final Object result = query.getSingleResult();
    return result != null ? result.toString() : "SP-1001";
  }
}
