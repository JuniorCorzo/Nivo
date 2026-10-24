import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import type { PublicTicketModel } from "@core/models/public-ticket.model";
import type { Observable } from "rxjs";
import { map } from "rxjs";

interface WrappedResponse<T> {
  data?: T;
}

@Injectable({
  providedIn: "root",
})
export class PublicTicketService {
  private readonly http = inject(HttpClient);

  getPublicTicket(id: string): Observable<PublicTicketModel> {
    return this.http
      .get<WrappedResponse<PublicTicketModel> | PublicTicketModel>(
        `/api/public/tickets/${id}`
      )
      .pipe(
        map((res) => {
          if ("data" in res && res.data) {
            return res.data;
          }
          // SAFETY: HTTP client returns PublicTicketModel directly when the response is not wrapped in a data envelope.
          return res as PublicTicketModel;
        })
      );
  }
}
