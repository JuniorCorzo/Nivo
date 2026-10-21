import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import type {
  SimulateRateRequest,
  SimulateRateResponse,
} from "@core/models/simulator.model";
import type { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class SimulatorService {
  private readonly http = inject(HttpClient);

  calculate(request: SimulateRateRequest): Observable<SimulateRateResponse> {
    return this.http.post<SimulateRateResponse>(
      "/api/public/simulator/calculate",
      request
    );
  }
}
