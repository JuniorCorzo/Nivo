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

@Injectable({
  providedIn: "root",
})
export class DashboardFacade {
  private readonly apiService = inject(DashboardApiService);
  private readonly sseService = inject(DashboardSseService);

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
        this.summary.set(update);
      }
    });

    effect(() => {
      if (this.isMultiParkingTenant() && this.isGlobalScope()) {
        this.loadParkingsComparison();
      }
    });
  }

  setScope(mode: "GLOBAL" | "SINGLE", parkingId?: string): void {
    this.userSelectedScope.set({ mode, parkingId });
    this.loadAll();
    this.connectSse(parkingId);
  }

  handleSseMessage(eventName: string, data: unknown): void {
    this.sseService.handleSseMessage(eventName, data);
    const update = this.sseService.updates();
    if (update) {
      this.summary.set(update);
    }
  }

  calculateBackoffDelay(retryCount?: number): number {
    return this.sseService.calculateBackoffDelay(retryCount);
  }

  async connectSse(parkingId?: string): Promise<void> {
    const targetParkingId = parkingId ?? this.activeScope().parkingId;
    await this.sseService.connect(targetParkingId);
  }

  loadAll(): void {
    this.loadSummary();
    this.loadHourlyOccupancy();
    if (this.isGlobalScope()) {
      this.loadParkingsComparison();
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

  loadHourlyOccupancy(): void {
    const { parkingId } = this.activeScope();
    this.apiService.getHourlyOccupancy(parkingId).subscribe({
      error: (err: unknown) => {
        void err;
      },
      next: (res) => this.hourlyOccupancy.set(res),
    });
  }

  loadParkingsComparison(): void {
    this.apiService.getParkingsComparison().subscribe({
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
