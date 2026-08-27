package dev.angelcorzo.nivo.notifications.cache;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

import dev.angelcorzo.nivo.model.commons.notifications.enums.NotificationEvents;
import dev.angelcorzo.nivo.model.commons.notifications.enums.NotificationsChannel;
import dev.angelcorzo.nivo.model.notificationtemplates.NotificationTemplates;
import dev.angelcorzo.nivo.model.notificationtemplates.gateways.NotificationTemplatesRepository;
import dev.angelcorzo.nivo.notifications.valueobject.NotificationImmutableKey;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
@DisplayName("NotificationTemplateCacheInMemory Unit Tests")
class NotificationTemplateCacheInMemoryTest {

  @Mock private NotificationTemplatesRepository templatesRepository;

  @InjectMocks private NotificationTemplateCacheInMemory cache;

  private NotificationImmutableKey key;
  private NotificationTemplates template;

  @BeforeEach
  void setUp() {
    key = NotificationImmutableKey.of(NotificationEvents.USER_INVITED, NotificationsChannel.EMAIL);
    template =
        NotificationTemplates.builder()
            .id(UUID.randomUUID())
            .templateReference("d-12345")
            .eventType(NotificationEvents.USER_INVITED)
            .channel(NotificationsChannel.EMAIL)
            .build();
  }

  @Test
  @DisplayName("Should fetch from repository and cache template on first access")
  void shouldFetchAndCacheOnFirstAccess() {
    when(templatesRepository.findByEventTypeAndChannel(key.event(), key.channel()))
        .thenReturn(Optional.of(template));

    Optional<NotificationTemplates> result1 = cache.getTemplate(key);
    Optional<NotificationTemplates> result2 = cache.getTemplate(key);

    assertThat(result1).isPresent().contains(template);
    assertThat(result2).isPresent().contains(template);
    verify(templatesRepository, times(1)).findByEventTypeAndChannel(key.event(), key.channel());
  }

  @Test
  @DisplayName("Should return empty when template is not found in database")
  void shouldReturnEmptyWhenNotFound() {
    when(templatesRepository.findByEventTypeAndChannel(key.event(), key.channel()))
        .thenReturn(Optional.empty());

    Optional<NotificationTemplates> result = cache.getTemplate(key);

    assertThat(result).isEmpty();
  }
}
