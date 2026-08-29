package dev.angelcorzo.nivo.usecase.notifications;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import dev.angelcorzo.nivo.model.commons.notifications.enums.NotificationEvents;
import dev.angelcorzo.nivo.model.commons.notifications.enums.NotificationsChannel;
import dev.angelcorzo.nivo.model.commons.notifications.valueobjects.TicketClosedData;
import dev.angelcorzo.nivo.model.commons.notifications.valueobjects.TicketOpenedData;
import dev.angelcorzo.nivo.model.commons.valueobjects.AppProperties;
import dev.angelcorzo.nivo.model.parkingtickets.ParkingTickets;
import dev.angelcorzo.nivo.model.tenants.valueobject.TenantReference;
import dev.angelcorzo.nivo.model.users.enums.Roles;
import dev.angelcorzo.nivo.model.users.valueobject.UserReference;
import dev.angelcorzo.nivo.usecase.sendnotifications.SendNotificationsUseCase;
import java.time.OffsetDateTime;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

@DisplayName("DefaultTicketNotifier Tests")
class DefaultTicketNotifierTest {

  private SendNotificationsUseCase sendNotificationsUseCase;
  private AppProperties appProperties;
  private DefaultTicketNotifier notifier;

  private final UUID tenantId = UUID.randomUUID();
  private final UUID userId = UUID.randomUUID();
  private final UUID ticketId = UUID.randomUUID();
  private final UserReference user =
      new UserReference(userId, "John Doe", "john@example.com", Roles.DRIVER, "1234567890");
  private final TenantReference tenant = new TenantReference(tenantId, "Tenant Name");

  @BeforeEach
  void setUp() {
    sendNotificationsUseCase = mock(SendNotificationsUseCase.class);
    appProperties = mock(AppProperties.class);
    when(appProperties.getCtaUrl()).thenReturn("https://cta.example.com");
    when(appProperties.getCompanyName()).thenReturn("Nivo Inc");
    when(appProperties.getSupportUrl()).thenReturn("https://support.example.com");
    when(appProperties.getSocialUrl()).thenReturn("https://social.example.com");
    when(appProperties.getUnsubscribeUrl()).thenReturn("https://unsubscribe.example.com");
    when(appProperties.getAddressCompany()).thenReturn("123 Street");

    notifier = new DefaultTicketNotifier(sendNotificationsUseCase, appProperties);
  }

  @Nested
  @DisplayName("notifyTicketOpened")
  class NotifyTicketOpened {

    @Test
    @DisplayName("Should send notification when ticket and user are present")
    void shouldSendNotificationWhenTicketAndUserArePresent() {
      ParkingTickets ticket =
          ParkingTickets.builder()
              .id(ticketId)
              .licensePlate("ABC-123")
              .tenant(tenant)
              .user(user)
              .createdAt(OffsetDateTime.now())
              .build();

      notifier.notifyTicketOpened(ticket);

      verify(sendNotificationsUseCase)
          .send(
              eq(NotificationEvents.TICKET_OPENED),
              eq(NotificationsChannel.EMAIL),
              eq("john@example.com"),
              any(TicketOpenedData.class),
              eq(tenantId),
              eq(userId));
    }

    @Test
    @DisplayName("Should not send notification when ticket is null")
    void shouldNotSendNotificationWhenTicketIsNull() {
      notifier.notifyTicketOpened(null);

      verifyNoInteractions(sendNotificationsUseCase);
    }

    @Test
    @DisplayName("Should not send notification when ticket user is null")
    void shouldNotSendNotificationWhenTicketUserIsNull() {
      ParkingTickets ticket =
          ParkingTickets.builder()
              .id(ticketId)
              .licensePlate("ABC-123")
              .tenant(tenant)
              .user(null)
              .build();

      notifier.notifyTicketOpened(ticket);

      verifyNoInteractions(sendNotificationsUseCase);
    }
  }

  @Nested
  @DisplayName("notifyTicketClosed")
  class NotifyTicketClosed {

    @Test
    @DisplayName("Should send notification when ticket and user are present")
    void shouldSendNotificationWhenTicketAndUserArePresent() {
      ParkingTickets ticket =
          ParkingTickets.builder()
              .id(ticketId)
              .licensePlate("ABC-123")
              .tenant(tenant)
              .user(user)
              .closedAt(OffsetDateTime.now())
              .build();

      notifier.notifyTicketClosed(ticket);

      verify(sendNotificationsUseCase)
          .send(
              eq(NotificationEvents.TICKET_CLOSED),
              eq(NotificationsChannel.EMAIL),
              eq("john@example.com"),
              any(TicketClosedData.class),
              eq(tenantId),
              eq(userId));
    }

    @Test
    @DisplayName("Should not send notification when ticket is null")
    void shouldNotSendNotificationWhenTicketIsNull() {
      notifier.notifyTicketClosed(null);

      verifyNoInteractions(sendNotificationsUseCase);
    }

    @Test
    @DisplayName("Should not send notification when ticket user is null")
    void shouldNotSendNotificationWhenTicketUserIsNull() {
      ParkingTickets ticket =
          ParkingTickets.builder()
              .id(ticketId)
              .licensePlate("ABC-123")
              .tenant(tenant)
              .user(null)
              .build();

      notifier.notifyTicketClosed(ticket);

      verifyNoInteractions(sendNotificationsUseCase);
    }
  }
}
