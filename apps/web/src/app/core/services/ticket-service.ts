import { HttpContext } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

import { ParkingTicketsService, RatesService } from '@core/api/generated/services';
import { AUTHORIZED } from '@core/http/context/auth.token';
import {
  CheckOutPayload,
  CreateTicketPayload,
  PaymentRecord,
  PriceDetailedModel,
  TicketSummary,
} from '@core/models/ticket.model';
import {
  mapToCheckOutCommand,
  mapToCreateTicketDto,
  mapToPaymentRecord,
  mapToPriceDetailedModel,
  mapToTicketSummary,
} from '@core/mappers/ticket.mapper';

@Injectable({
  providedIn: 'root',
})
export class TicketService {
  private readonly parkingTicketsService = inject(ParkingTicketsService);
  private readonly ratesService = inject(RatesService);

  private readonly _activeTickets = signal<TicketSummary[]>([]);
  readonly activeTickets = this._activeTickets.asReadonly();

  private httpContext = () => {
    const context = new HttpContext();
    context.set(AUTHORIZED, true);
    return context;
  };

  /**
   * Register a new vehicle entry and issue a ticket
   */
  createTicket(payload: CreateTicketPayload): Observable<TicketSummary> {
    const dto = mapToCreateTicketDto(payload);

    return this.parkingTicketsService
      .createTicket({ body: dto }, this.httpContext())
      .pipe(
        map((response) => mapToTicketSummary(response.data!)),
        tap((newTicket) => {
          this._activeTickets.update((tickets) => [newTicket, ...tickets]);
        }),
        catchError((error) => throwError(() => error)),
      );
  }

  /**
   * Calculate live price breakdown for a ticket before exit
   */
  calculatePrice(ticketId: string): Observable<PriceDetailedModel> {
    return this.ratesService
      .calculatePrice({ ticketId }, this.httpContext())
      .pipe(
        map((response) => mapToPriceDetailedModel(response.data!)),
        catchError((error) => throwError(() => error)),
      );
  }

  /**
   * Process check-out and generate payment / clearance record
   */
  checkOutVehicle(payload: CheckOutPayload): Observable<PaymentRecord> {
    const command = mapToCheckOutCommand(payload);

    return this.parkingTicketsService
      .checkOutVehicle({ body: command }, this.httpContext())
      .pipe(
        map((response) => mapToPaymentRecord(response.data!)),
        tap((payment) => {
          this._activeTickets.update((tickets) =>
            tickets.filter((t) => t.id !== payload.ticketId),
          );
        }),
        catchError((error) => throwError(() => error)),
      );
  }

  /**
   * Helper to manually set or track active tickets locally
   */
  setActiveTickets(tickets: TicketSummary[]): void {
    this._activeTickets.set(tickets);
  }

  /**
   * Helper to remove closed ticket from local active list
   */
  removeActiveTicket(ticketId: string): void {
    this._activeTickets.update((tickets) => tickets.filter((t) => t.id !== ticketId));
  }
}
