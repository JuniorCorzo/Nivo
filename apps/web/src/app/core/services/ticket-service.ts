import { HttpContext } from "@angular/common/http";
import { inject, Injectable, signal } from "@angular/core";
import {
  ParkingTicketsService,
  RatesService,
} from "@core/api/generated/services";
import { AUTHORIZED } from "@core/http/context/auth.token";
import {
  mapToCheckOutCommand,
  mapToCreateTicketDto,
  mapToPaymentRecord,
  mapToPriceDetailedModel,
  mapToTicketSummary,
} from "@core/mappers/ticket.mapper";
import type {
  CheckOutPayload,
  CreateTicketPayload,
  PaymentRecord,
  PriceDetailedModel,
  TicketSummary,
} from "@core/models/ticket.model";
import type { Observable } from "rxjs";
import { map, tap } from "rxjs/operators";

@Injectable({
  providedIn: "root",
})
export class TicketService {
  private readonly parkingTicketsService = inject(ParkingTicketsService);
  private readonly ratesService = inject(RatesService);

  private readonly _activeTickets = signal<TicketSummary[]>([]);
  readonly activeTickets = this._activeTickets.asReadonly();

  private static httpContext() {
    const context = new HttpContext();
    context.set(AUTHORIZED, true);
    return context;
  }

  /**
   * Register a new vehicle entry and issue a ticket
   */
  createTicket(payload: CreateTicketPayload): Observable<TicketSummary> {
    const dto = mapToCreateTicketDto(payload);

    return this.parkingTicketsService
      .createTicket({ body: dto }, TicketService.httpContext())
      .pipe(
        map((response) => {
          /* SAFETY: Created ticket response data is defined */
          const data = response.data as Parameters<
            typeof mapToTicketSummary
          >[0];
          return mapToTicketSummary(data);
        }),
        tap((newTicket) => {
          this._activeTickets.update((tickets) => [newTicket, ...tickets]);
        })
      );
  }

  /**
   * Get the active ticket associated with a specific slot
   */
  getActiveTicketBySlot(slotId: string): Observable<TicketSummary> {
    return this.parkingTicketsService
      .getActiveTicket({ slot: slotId }, TicketService.httpContext())
      .pipe(
        map((response) => {
          /* SAFETY: Active ticket response data is defined */
          const data = response.data as Parameters<
            typeof mapToTicketSummary
          >[0];
          return mapToTicketSummary(data);
        })
      );
  }

  /**
   * Calculate live price breakdown for a ticket before exit
   */
  calculatePrice(ticketId: string): Observable<PriceDetailedModel> {
    return this.ratesService
      .calculatePrice({ ticketId }, TicketService.httpContext())
      .pipe(
        map((response) => {
          /* SAFETY: Calculate price response data is defined */
          const data = response.data as Parameters<
            typeof mapToPriceDetailedModel
          >[0];
          return mapToPriceDetailedModel(data);
        })
      );
  }

  /**
   * Process check-out and generate payment / clearance record
   */
  checkOutVehicle(payload: CheckOutPayload): Observable<PaymentRecord> {
    const command = mapToCheckOutCommand(payload);

    return this.parkingTicketsService
      .checkOutVehicle({ body: command }, TicketService.httpContext())
      .pipe(
        map((response) => {
          /* SAFETY: Check-out response data is defined */
          const data = response.data as Parameters<
            typeof mapToPaymentRecord
          >[0];
          return mapToPaymentRecord(data);
        }),
        tap(() => {
          this._activeTickets.update((tickets) =>
            tickets.filter((t) => t.id !== payload.ticketId)
          );
        })
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
    this._activeTickets.update((tickets) =>
      tickets.filter((t) => t.id !== ticketId)
    );
  }
}
