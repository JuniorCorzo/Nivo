import { HttpClient, HttpContext, HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { DashboardService, ReportsService } from "@core/api/generated/services";
import { AUTHORIZED } from "@core/http/context/auth.token";
import {
  mapToDashboardSummaryModel,
  mapToHourlyOccupancyPoint,
  mapToPaginatedOperationalReport,
  mapToParkingComparisonItem,
} from "@core/mappers/dashboard.mapper";
import type {
  DashboardSummaryModel,
  HourlyOccupancyPointModel,
  PaginatedOperationalReportModel,
  ParkingComparisonItemModel,
} from "@core/models/dashboard.model";
import type { Observable } from "rxjs";
import { map } from "rxjs/operators";

@Injectable({
  providedIn: "root",
})
export class DashboardApiService {
  private readonly dashboardService = inject(DashboardService);
  private readonly reportsService = inject(ReportsService);
  private readonly http = inject(HttpClient);

  private static httpContext(): HttpContext {
    const context = new HttpContext();
    context.set(AUTHORIZED, true);
    return context;
  }

  getSummary(parkingId?: string): Observable<DashboardSummaryModel> {
    const params = parkingId ? { parkingId } : {};
    return this.dashboardService
      .getSummary(params, DashboardApiService.httpContext())
      .pipe(map((dto) => mapToDashboardSummaryModel(dto)));
  }

  getHourlyOccupancy(
    parkingId?: string
  ): Observable<HourlyOccupancyPointModel[]> {
    const params = parkingId ? { parkingId } : {};
    return this.dashboardService
      .getHourlyOccupancy(params, DashboardApiService.httpContext())
      .pipe(map((dtos) => (dtos ?? []).map(mapToHourlyOccupancyPoint)));
  }

  getParkingsComparison(): Observable<ParkingComparisonItemModel[]> {
    return this.dashboardService
      .getParkingsComparison({}, DashboardApiService.httpContext())
      .pipe(map((dtos) => (dtos ?? []).map(mapToParkingComparisonItem)));
  }

  getOperationalReport(
    page = 0,
    parkingId?: string,
    size = 10
  ): Observable<PaginatedOperationalReportModel> {
    const pageable = { page, size };
    if (parkingId) {
      return this.reportsService
        .getOperationalReport(
          { pageable, parkingId },
          DashboardApiService.httpContext()
        )
        .pipe(map((dto) => mapToPaginatedOperationalReport(dto)));
    }
    return this.reportsService
      .getOperationalReport({ pageable }, DashboardApiService.httpContext())
      .pipe(map((dto) => mapToPaginatedOperationalReport(dto)));
  }

  exportOperationalReportCsv(parkingId?: string): Observable<Blob> {
    const url = `${this.reportsService.rootUrl}${ReportsService.ExportOperationalReportCsvPath}`;
    let params = new HttpParams();
    if (parkingId) {
      params = params.set("parkingId", parkingId);
    }
    return this.http.get(url, {
      context: DashboardApiService.httpContext(),
      params,
      responseType: "blob",
    });
  }
}
