import { inject, Injectable } from "@angular/core";
import { PublicTicketsService } from "@core/api/generated/services";
import { mapToPublicTicketModel } from "@core/mappers/ticket.mapper";
import type { PublicTicketModel } from "@core/models/public-ticket.model";
import type { Observable } from "rxjs";
import { map } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class PublicTicketService {
  private readonly publicTicketsService = inject(PublicTicketsService);

  getPublicTicket(id: string): Observable<PublicTicketModel> {
    return this.publicTicketsService
      .getPublicTicket({ id })
      .pipe(map((res) => mapToPublicTicketModel(res.data)));
  }
}
