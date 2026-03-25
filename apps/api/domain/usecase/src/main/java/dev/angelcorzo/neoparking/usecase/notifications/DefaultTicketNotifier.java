package dev.angelcorzo.neoparking.usecase.notifications;

import dev.angelcorzo.neoparking.model.commons.notifications.enums.NotificationEvents;
import dev.angelcorzo.neoparking.model.commons.notifications.enums.NotificationsChannel;
import dev.angelcorzo.neoparking.model.commons.notifications.valueobjects.TicketClosedData;
import dev.angelcorzo.neoparking.model.commons.notifications.valueobjects.TicketOpenedData;
import dev.angelcorzo.neoparking.model.commons.valueobjects.AppProperties;
import dev.angelcorzo.neoparking.model.parkingtickets.ParkingTickets;
import dev.angelcorzo.neoparking.usecase.sendnotifications.SendNotificationsUseCase;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public class DefaultTicketNotifier implements TicketNotifier {
  private final SendNotificationsUseCase sendNotificationsUseCase;
  private final AppProperties appProperties;

  @Override
  public void notifyTicketOpened(ParkingTickets ticket) {
    final TicketOpenedData content =
        TicketOpenedData.builder()
            .userName(ticket.getUser().fullName())
            .ticketNumber(ticket.getId().toString())
            .ticketSubject(ticket.getLicensePlate())
            .createdAt(
                ticket.getCreatedAt() != null ? ticket.getCreatedAt().toString() : null)
            .ctaUrl(this.appProperties.getCtaUrl())
            .companyName(this.appProperties.getCompanyName())
            .supportUrl(this.appProperties.getSupportUrl())
            .socialUrl(this.appProperties.getSocialUrl())
            .unsubscribeUrl(this.appProperties.getUnsubscribeUrl())
            .companyAddress(this.appProperties.getAddressCompany())
            .build();

    this.sendNotificationsUseCase.send(
        NotificationEvents.TICKET_OPENED,
        NotificationsChannel.EMAIL,
        ticket.getUser().email(),
        content,
        ticket.getTenant().id(),
        ticket.getUser().id());
  }

  @Override
  public void notifyTicketClosed(ParkingTickets ticket) {
    final TicketClosedData content =
        TicketClosedData.builder()
            .userName(ticket.getUser().fullName())
            .ticketNumber(ticket.getId().toString())
            .ticketSubject(ticket.getLicensePlate())
            .closedAt(ticket.getClosedAt() != null ? ticket.getClosedAt().toString() : null)
            .ctaUrl(this.appProperties.getCtaUrl())
            .companyName(this.appProperties.getCompanyName())
            .supportUrl(this.appProperties.getSupportUrl())
            .socialUrl(this.appProperties.getSocialUrl())
            .unsubscribeUrl(this.appProperties.getUnsubscribeUrl())
            .companyAddress(this.appProperties.getAddressCompany())
            .build();

    this.sendNotificationsUseCase.send(
        NotificationEvents.TICKET_CLOSED,
        NotificationsChannel.EMAIL,
        ticket.getUser().email(),
        content,
        ticket.getTenant().id(),
        ticket.getUser().id());
  }
}
