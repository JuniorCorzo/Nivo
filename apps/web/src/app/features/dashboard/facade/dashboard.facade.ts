import { computed, effect, inject, Injectable, signal } from "@angular/core";
import type {
  DashboardSummaryModel,
  HourlyOccupancyPointModel,
  OperationalReportItemModel,
  ParkingComparisonItemModel,
  ParkingItem,
  ScopeState,
} from "@core/models/dashboard.model";
import { DashboardApiService } from "@core/services/dashboard-api.service";
import { DashboardSseService } from "@core/services/dashboard-sse.service";
import type { Observable } from "rxjs";

export type {
  DashboardSummaryModel as DashboardSummary,
  HourlyOccupancyPointModel as HourlyOccupancyPoint,
  OperationalReportItemModel as OperationalReportItem,
  ParkingComparisonItemModel as ParkingComparisonItem,
  ParkingItem,
  ScopeState,
} from "@core/models/dashboard.model";

export type TimeGranularity = "today" | "7days" | "30days";

export interface DashboardDateRange {
  endDate: string;
  endLocalDate: string;
  startDate: string;
  startLocalDate: string;
}

@Injectable({
  providedIn: "root",
})
export class DashboardFacade {
  private readonly apiService = inject(DashboardApiService);
  private readonly sseService = inject(DashboardSseService);

  readonly timeGranularity = signal<TimeGranularity>("today");
  readonly accessibleParkings = signal<ParkingItem[]>([]);
  private readonly userSelectedScope = signal<ScopeState | null>(null);
  private readonly _activeScopeOverride = signal<ScopeState | null>(null);

  readonly isMultiParkingTenant = computed(
    () => this.accessibleParkings().length > 1
  );

  readonly activeScope = Object.assign(
    computed<ScopeState>(() => {
      const override = this._activeScopeOverride();
      if (override) {
        return override;
      }

      const parkings = this.accessibleParkings();
      if (parkings.length === 1) {
        return { mode: "SINGLE", parkingId: parkings[0]?.id };
      }

      const selected = this.userSelectedScope();
      if (!selected) {
        return { mode: "GLOBAL" };
      }

      const isInvalidSingleParking =
        selected.mode === "SINGLE" &&
        Boolean(selected.parkingId) &&
        !parkings.some((p) => p.id === selected.parkingId);

      if (isInvalidSingleParking) {
        return { mode: "GLOBAL" };
      }

      return selected;
    }),
    {
      set: (val: ScopeState) => {
        this.userSelectedScope.set(val);
        this._activeScopeOverride.set(val);
      },
    }
  );

  readonly isGlobalScope = computed(() => this.activeScope().mode === "GLOBAL");

  readonly isSingleScope = computed(() => this.activeScope().mode === "SINGLE");

  readonly summary = signal<DashboardSummaryModel | null>(null);
  readonly hourlyOccupancy = signal<HourlyOccupancyPointModel[]>([]);
  readonly parkingsComparison = signal<ParkingComparisonItemModel[]>([]);
  readonly reports = signal<OperationalReportItemModel[]>([]);
  readonly reportsPage = signal<number>(0);
  readonly reportsTotalPages = signal<number>(0);
  readonly isLoading = signal<boolean>(false);

  readonly occupancyPercentage = computed(
    () => this.summary()?.occupancyRate ?? 0
  );

  constructor() {
    effect(() => {
      const update = this.sseService.updates();
      if (update) {
        this.applyIncomingSummaryUpdate(update);
      }
    });

    effect(() => {
      if (this.isMultiParkingTenant() && this.isGlobalScope()) {
        this.loadParkingsComparison();
      }
    });
  }

  private applyIncomingSummaryUpdate(update: DashboardSummaryModel): void {
    const cacheKey = `summary:${update.parkingId ?? (update.scope === "GLOBAL" ? "global" : (this.activeScope().parkingId ?? "global"))}`;
    this.apiService.setCache(cacheKey, update);

    const currentScope = this.activeScope();
    const matchesGlobal =
      currentScope.mode === "GLOBAL" && update.scope === "GLOBAL";
    const matchesSingle =
      currentScope.mode === "SINGLE" &&
      Boolean(update.parkingId) &&
      update.parkingId === currentScope.parkingId;

    if (matchesGlobal || matchesSingle) {
      this.summary.set(update);
    }
  }

  refreshTelemetry(): void {
    this.apiService.clearCache();
    this.loadAll();
  }

  setScope(mode: "GLOBAL" | "SINGLE", parkingId?: string): void {
    this.userSelectedScope.set({ mode, parkingId });
    this.loadAll();
  }

  handleSseMessage(eventName: string, data: unknown): void {
    this.sseService.handleSseMessage(eventName, data);
    const update = this.sseService.updates();
    if (update) {
      this.applyIncomingSummaryUpdate(update);
    }
  }

  calculateBackoffDelay(retryCount?: number): number {
    return this.sseService.calculateBackoffDelay(retryCount);
  }

  async connectSse(parkingId?: string): Promise<void> {
    const targetParkingId = parkingId ?? this.activeScope().parkingId;
    await this.sseService.connect(targetParkingId);
  }

  setTimeGranularity(granularity: TimeGranularity): void {
    this.timeGranularity.set(granularity);
    const dates = this.calculateDateRange(granularity);
    this.loadHourlyOccupancy(dates.startDate, dates.endDate);
    this.loadParkingsComparison(dates.startLocalDate, dates.endLocalDate);
  }

  calculateDateRange(granularity?: TimeGranularity): DashboardDateRange {
    const target = granularity ?? this.timeGranularity();
    const now = new Date();

    const endOfDay = new Date(now);
    endOfDay.setUTCHours(23, 59, 59, 999);
    const endDate = endOfDay.toISOString();

    let startDate: string;
    if (target === "today") {
      const startOfDay = new Date(now);
      startOfDay.setUTCHours(0, 0, 0, 0);
      startDate = startOfDay.toISOString();
    } else if (target === "7days") {
      const past = new Date(now);
      past.setUTCDate(past.getUTCDate() - 7);
      past.setUTCHours(0, 0, 0, 0);
      startDate = past.toISOString();
    } else {
      const past = new Date(now);
      past.setUTCDate(past.getUTCDate() - 30);
      past.setUTCHours(0, 0, 0, 0);
      startDate = past.toISOString();
    }

    const startLocalDate = startDate.slice(0, 10);
    const endLocalDate = endDate.slice(0, 10);

    return {
      endDate,
      endLocalDate,
      startDate,
      startLocalDate,
    };
  }

  loadAll(): void {
    const dates = this.calculateDateRange(this.timeGranularity());
    this.loadSummary();
    this.loadHourlyOccupancy(dates.startDate, dates.endDate);
    if (this.isGlobalScope()) {
      this.loadParkingsComparison(dates.startLocalDate, dates.endLocalDate);
    }
    this.loadReports();
  }

  loadSummary(): void {
    const { parkingId } = this.activeScope();
    this.apiService.getSummary(parkingId).subscribe({
      error: (err: unknown) => {
        void err;
      },
      next: (res) => this.summary.set(res),
    });
  }

  loadHourlyOccupancy(startDate?: string, endDate?: string): void {
    const { parkingId } = this.activeScope();
    const dates =
      startDate !== undefined && endDate !== undefined
        ? { endDate, startDate }
        : this.calculateDateRange(this.timeGranularity());
    this.apiService
      .getHourlyOccupancy(parkingId, dates.startDate, dates.endDate)
      .subscribe({
        error: (err: unknown) => {
          void err;
        },
        next: (res) => this.hourlyOccupancy.set(res),
      });
  }

  loadParkingsComparison(startDate?: string, endDate?: string): void {
    const dates =
      startDate !== undefined && endDate !== undefined
        ? {
            endDate,
            endLocalDate: endDate.includes("T")
              ? (endDate.split("T")[0] ?? endDate)
              : endDate,
            startDate,
            startLocalDate: startDate.includes("T")
              ? (startDate.split("T")[0] ?? startDate)
              : startDate,
          }
        : this.calculateDateRange(this.timeGranularity());
    this.apiService
      .getParkingsComparison(dates.startLocalDate, dates.endLocalDate)
      .subscribe({
        error: (err: unknown) => {
          void err;
        },
        next: (res) => this.parkingsComparison.set(res),
      });
  }

  loadReports(page = 0): void {
    this.isLoading.set(true);
    const { parkingId } = this.activeScope();
    this.apiService.getOperationalReport(page, parkingId).subscribe({
      error: () => this.isLoading.set(false),
      next: (res) => {
        this.reports.set(res.items);
        this.reportsPage.set(res.page);
        this.reportsTotalPages.set(res.totalPages);
        this.isLoading.set(false);
      },
    });
  }

  exportCsv(): Observable<Blob> {
    const { parkingId } = this.activeScope();
    return this.apiService.exportOperationalReportCsv(parkingId);
  }

  disconnect(): void {
    this.sseService.disconnect();
  }
}
