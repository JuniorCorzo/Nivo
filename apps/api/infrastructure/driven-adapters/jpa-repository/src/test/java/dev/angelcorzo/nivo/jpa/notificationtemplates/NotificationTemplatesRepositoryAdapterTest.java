package dev.angelcorzo.nivo.jpa.notificationtemplates;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

import dev.angelcorzo.nivo.jpa.notificationtemplates.mappers.NotificationTemplateMapper;
import dev.angelcorzo.nivo.model.commons.notifications.enums.NotificationEvents;
import dev.angelcorzo.nivo.model.commons.notifications.enums.NotificationsChannel;
import dev.angelcorzo.nivo.model.notificationtemplates.NotificationTemplates;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

@DisplayName("NotificationTemplatesRepositoryAdapter Unit Tests")
class NotificationTemplatesRepositoryAdapterTest {

  private NotificationTemplatesRepositoryData repository;
  private NotificationTemplateMapper mapper;
  private NotificationTemplatesRepositoryAdapter adapter;

  @BeforeEach
  void setUp() {
    repository = mock(NotificationTemplatesRepositoryData.class);
    mapper = mock(NotificationTemplateMapper.class);
    adapter = new NotificationTemplatesRepositoryAdapter(repository, mapper);
  }

  @Test
  @DisplayName("Should find template by event type and channel")
  void shouldFindByEventTypeAndChannel() {
    NotificationTemplatesData data = new NotificationTemplatesData();
    NotificationTemplates entity = NotificationTemplates.builder().build();

    when(repository.findByEventTypeAndChannel(NotificationEvents.PAYMENT_COMPLETED, NotificationsChannel.EMAIL))
        .thenReturn(Optional.of(data));
    when(mapper.toEntity(data)).thenReturn(entity);

    Optional<NotificationTemplates> result =
        adapter.findByEventTypeAndChannel(NotificationEvents.PAYMENT_COMPLETED, NotificationsChannel.EMAIL);

    assertThat(result).isPresent();
    assertThat(result.get()).isEqualTo(entity);
  }
}
