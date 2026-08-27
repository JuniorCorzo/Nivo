package dev.angelcorzo.nivo.jpa.notificationpreferences;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

import dev.angelcorzo.nivo.jpa.notificationpreferences.mapper.NotificationPreferencesMapper;
import dev.angelcorzo.nivo.model.commons.notifications.enums.NotificationEvents;
import dev.angelcorzo.nivo.model.commons.notifications.enums.NotificationsChannel;
import dev.angelcorzo.nivo.model.notificationpreferences.NotificationPreferences;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

@DisplayName("NotificationPreferencesRepositoryAdapter Unit Tests")
class NotificationPreferencesRepositoryAdapterTest {

  private NotificationPreferencesRepositoryData repository;
  private NotificationPreferencesMapper mapper;
  private NotificationPreferencesRepositoryAdapter adapter;

  @BeforeEach
  void setUp() {
    repository = mock(NotificationPreferencesRepositoryData.class);
    mapper = mock(NotificationPreferencesMapper.class);
    adapter = new NotificationPreferencesRepositoryAdapter(repository, mapper);
  }

  @Test
  @DisplayName("Should check if notification is enabled")
  void shouldCheckIsEnable() {
    when(repository.existsByEventTypeAndChannelAndUser_EmailAndIsEnabledTrue(
            NotificationEvents.TICKET_OPENED, NotificationsChannel.EMAIL, "user@example.com"))
        .thenReturn(true);

    boolean enabled =
        adapter.isEnable(
            NotificationEvents.TICKET_OPENED, NotificationsChannel.EMAIL, "user@example.com");

    assertThat(enabled).isTrue();
  }

  @Test
  @DisplayName("Should find all preferences by user ID")
  void shouldFindAllByUserId() {
    UUID userId = UUID.randomUUID();
    NotificationPreferencesData data = new NotificationPreferencesData();
    NotificationPreferences entity = NotificationPreferences.builder().id(UUID.randomUUID()).build();

    when(repository.findAllByUser_Id(userId)).thenReturn(List.of(data));
    when(mapper.toEntity(data)).thenReturn(entity);

    List<NotificationPreferences> result = adapter.findAllByUserId(userId);

    assertThat(result).hasSize(1);
    assertThat(result.get(0)).isEqualTo(entity);
  }

  @Test
  @DisplayName("Should toggle active status when preference exists")
  void shouldToggleActiveStatus() {
    UUID userId = UUID.randomUUID();
    NotificationPreferencesData data = new NotificationPreferencesData();
    data.setIsEnabled(false);

    when(repository.findByUser_IdAndEventTypeAndChannel(
            userId, NotificationEvents.TICKET_OPENED, NotificationsChannel.EMAIL))
        .thenReturn(Optional.of(data));

    boolean newStatus =
        adapter.toggleActiveStatus(
            userId, NotificationEvents.TICKET_OPENED, NotificationsChannel.EMAIL);

    assertThat(newStatus).isTrue();
    assertThat(data.getIsEnabled()).isTrue();
    verify(repository).save(data);
  }
}
