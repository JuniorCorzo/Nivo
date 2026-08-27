package dev.angelcorzo.nivo.jpa.notificationlogs;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

import dev.angelcorzo.nivo.jpa.notificationlogs.mappers.NotificationLogsMapper;
import dev.angelcorzo.nivo.model.notificationlogs.NotificationLogs;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

@DisplayName("NotificationLogsAdapter Unit Tests")
class NotificationLogsAdapterTest {

  private NotificationLogsRepositoryData repository;
  private NotificationLogsMapper mapper;
  private NotificationLogsAdapter adapter;

  @BeforeEach
  void setUp() {
    repository = mock(NotificationLogsRepositoryData.class);
    mapper = mock(NotificationLogsMapper.class);
    adapter = new NotificationLogsAdapter(repository, mapper);
  }

  @Test
  @DisplayName("Should find all notification logs by user ID")
  void shouldFindAllByUserId() {
    UUID userId = UUID.randomUUID();
    NotificationLogsData data = new NotificationLogsData();
    NotificationLogs entity = NotificationLogs.builder().id(UUID.randomUUID()).build();

    when(repository.findByUserId(userId)).thenReturn(List.of(data));
    when(mapper.toEntity(data)).thenReturn(entity);

    List<NotificationLogs> result = adapter.findAllByUserId(userId);

    assertThat(result).hasSize(1);
    assertThat(result.get(0)).isEqualTo(entity);
  }

  @Test
  @DisplayName("Should find all notification logs by tenant ID")
  void shouldFindAllByTenantId() {
    UUID tenantId = UUID.randomUUID();
    NotificationLogsData data = new NotificationLogsData();
    NotificationLogs entity = NotificationLogs.builder().id(UUID.randomUUID()).build();

    when(repository.findByTenant_Id(tenantId)).thenReturn(List.of(data));
    when(mapper.toEntity(data)).thenReturn(entity);

    List<NotificationLogs> result = adapter.findAllByTenantId(tenantId);

    assertThat(result).hasSize(1);
    assertThat(result.get(0)).isEqualTo(entity);
  }
}
