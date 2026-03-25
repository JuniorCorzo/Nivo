package dev.angelcorzo.neoparking.jpa.notificationlogs;

import dev.angelcorzo.neoparking.jpa.helper.AdapterOperations;
import dev.angelcorzo.neoparking.jpa.notificationlogs.mappers.NotificationLogsMapper;
import dev.angelcorzo.neoparking.model.notificationlogs.NotificationLogs;
import dev.angelcorzo.neoparking.model.notificationlogs.gateways.NotificationLogsRepository;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Repository;

/**
 * JPA adapter for {@link NotificationLogsRepository}.
 *
 * <p>This class implements the {@link NotificationLogsRepository} interface, providing concrete
 * persistence operations for {@link NotificationLogs} entities using Spring Data JPA.
 *
 * <p>It extends {@link AdapterOperations} to leverage common CRUD and mapping functionalities.
 *
 * <p><strong>Layer:</strong> Infrastructure (Driven Adapter - JPA)
 *
 * <p><strong>Responsibility:</strong> To provide persistence implementation for NotificationLogs
 * domain operations.
 *
 * @author Angel Corzo
 * @since 1.0.0
 * @see NotificationLogsRepository
 * @see NotificationLogsData
 * @see NotificationLogsMapper
 * @see AdapterOperations
 */
@Repository
public class NotificationLogsAdapter
    extends AdapterOperations<
        NotificationLogs, NotificationLogsData, UUID, NotificationLogsRepositoryData>
    implements NotificationLogsRepository {

  /**
   * Constructs a new NotificationLogsAdapter.
   *
   * @param repository The Spring Data JPA repository for NotificationLogsData.
   * @param mapper The MapStruct mapper for NotificationLogs.
   */
  protected NotificationLogsAdapter(
      NotificationLogsRepositoryData repository, NotificationLogsMapper mapper) {
    super(repository, mapper);
  }

  /**
   * Finds all notification logs associated with a specific user (as actor or recipient).
   *
   * @param userId The unique identifier of the user.
   * @return A list of {@link NotificationLogs} entities involving the user.
   */
  @Override
  public List<NotificationLogs> findAllByUserId(UUID userId) {
    return super.toList(super.repository.findByUserId(userId));
  }

  /**
   * Finds all notification logs belonging to a specific tenant.
   *
   * @param tenantId The unique identifier of the tenant.
   * @return A list of {@link NotificationLogs} entities for the tenant.
   */
  @Override
  public List<NotificationLogs> findAllByTenantId(UUID tenantId) {
    return super.toList(super.repository.findByTenant_Id(tenantId));
  }
}
