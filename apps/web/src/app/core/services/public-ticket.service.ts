import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import type { PublicTicketModel } from "@core/models/public-ticket.model";
import type { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class PublicTicketService {
  private readonly http = inject(HttpClient);

  getPublicTicket(id: string): Observable<PublicTicketModel> {
    return this.http.get<PublicTicketModel>(`/api/public/tickets/${id}`);
  }
}
