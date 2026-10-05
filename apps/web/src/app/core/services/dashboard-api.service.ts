import { HttpClient, HttpContext, HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import type { GetHourlyOccupancy$Params } from "@core/api/generated/fn/dashboard/get-hourly-occupancy";
import type { GetParkingsComparison$Params } from "@core/api/generated/fn/dashboard/get-parkings-comparison";
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
import { of } from "rxjs";
import { map, tap } from "rxjs/operators";

@Injectable({
  providedIn: "root",
})
export class DashboardApiService {
  private readonly dashboardService = inject(DashboardService);
  private readonly reportsService = inject(ReportsService);
  private readonly http = inject(HttpClient);

  private readonly cache = new Map<
    string,
    { data: unknown; expiresAt: number }
  >();
  public readonly defaultTtlMs = 60_000;

  private static httpContext(): HttpContext {
    const context = new HttpContext();
    context.set(AUTHORIZED, true);
    return context;
  }

  private getFromCache<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) {
      return null;
    }
    if (Date.now() >= entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    /* SAFETY: Cache entry data is stored from response of type T */
    return entry.data as T;
  }

  public setCache(key: string, data: unknown, ttlMs = this.defaultTtlMs): void {
    this.cache.set(key, {
      data,
      expiresAt: Date.now() + ttlMs,
    });
  }

  public clearCache(): void {
    this.cache.clear();
  }

  public invalidate(pattern: string): void {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  getSummary(parkingId?: string): Observable<DashboardSummaryModel> {
    const cacheKey = `summary:${parkingId ?? "global"}`;
    const cached = this.getFromCache<DashboardSummaryModel>(cacheKey);
    if (cached) {
      return of(cached);
    }

    const params = parkingId ? { parkingId } : {};
    return this.dashboardService
      .getSummary(params, DashboardApiService.httpContext())
      .pipe(
        map((dto) => mapToDashboardSummaryModel(dto)),
        tap((res) => this.setCache(cacheKey, res))
      );
  }

  private static normalizeHourlyCacheDate(val?: string): string {
    if (!val) {
      return "";
    }
    const withoutMs = val.replace(/\.\d+Z?$/u, "");
    return withoutMs.length >= 16 ? withoutMs.slice(0, 16) : withoutMs;
  }

  getHourlyOccupancy(
    parkingId?: string,
    startDate?: string,
    endDate?: string
  ): Observable<HourlyOccupancyPointModel[]> {
    const normalizedStart =
      DashboardApiService.normalizeHourlyCacheDate(startDate);
    const normalizedEnd = DashboardApiService.normalizeHourlyCacheDate(endDate);
    const cacheKey = `hourly:${parkingId ?? "global"}:${normalizedStart}:${normalizedEnd}`;
    const cached = this.getFromCache<HourlyOccupancyPointModel[]>(cacheKey);
    if (cached) {
      return of(cached);
    }

    const params: GetHourlyOccupancy$Params = {};
    if (endDate) {
      params.endDate = endDate;
    }
    if (parkingId) {
      params.parkingId = parkingId;
    }
    if (startDate) {
      params.startDate = startDate;
    }
    return this.dashboardService
      .getHourlyOccupancy(params, DashboardApiService.httpContext())
      .pipe(
        map((dtos) => (dtos ?? []).map(mapToHourlyOccupancyPoint)),
        tap((res) => this.setCache(cacheKey, res))
      );
  }

  private static toLocalDateString(val?: string): string | undefined {
    if (!val) {
      return undefined;
    }
    return val.includes("T") ? val.split("T")[0] : val;
  }

  getParkingsComparison(
    startDate?: string,
    endDate?: string
  ): Observable<ParkingComparisonItemModel[]> {
    const sanitizedStart = DashboardApiService.toLocalDateString(startDate);
    const sanitizedEnd = DashboardApiService.toLocalDateString(endDate);
    const cacheKey = `comparison:${sanitizedStart ?? ""}:${sanitizedEnd ?? ""}`;
    const cached = this.getFromCache<ParkingComparisonItemModel[]>(cacheKey);
    if (cached) {
      return of(cached);
    }

    const params: GetParkingsComparison$Params = {};
    if (sanitizedEnd) {
      params.endDate = sanitizedEnd;
    }
    if (sanitizedStart) {
      params.startDate = sanitizedStart;
    }
    return this.dashboardService
      .getParkingsComparison(params, DashboardApiService.httpContext())
      .pipe(
        map((dtos) => (dtos ?? []).map(mapToParkingComparisonItem)),
        tap((res) => this.setCache(cacheKey, res))
      );
  }

  getOperationalReport(
    page = 0,
    parkingId?: string,
    size = 10
  ): Observable<PaginatedOperationalReportModel> {
    const cacheKey = `reports:${parkingId ?? "global"}:${page}:${size}`;
    const cached = this.getFromCache<PaginatedOperationalReportModel>(cacheKey);
    if (cached) {
      return of(cached);
    }

    const pageable = { page, size };
    const request$ = parkingId
      ? this.reportsService.getOperationalReport(
          { pageable, parkingId },
          DashboardApiService.httpContext()
        )
      : this.reportsService.getOperationalReport(
          { pageable },
          DashboardApiService.httpContext()
        );

    return request$.pipe(
      map((dto) => mapToPaginatedOperationalReport(dto)),
      tap((res) => this.setCache(cacheKey, res))
    );
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
