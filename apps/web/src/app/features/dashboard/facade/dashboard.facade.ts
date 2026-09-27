import { HttpClient } from "@angular/common/http";
import { Injectable, computed, inject, signal } from "@angular/core";
import type { Observable } from "rxjs";

import type { HourlyOccupancyPoint } from "../components/occupancy-trend-chart/occupancy-trend-chart";
import type { ParkingComparisonItem } from "../components/parking-comparison-chart/parking-comparison-chart";

export interface ParkingItem {
  id: string;
  name: string;
}

export interface ScopeState {
  mode: "GLOBAL" | "SINGLE";
  parkingId?: string;
}

export interface DashboardSummary {
  scope: string;
  parkingId?: string;
  totalCapacity: number;
  occupiedSlots: number;
  availableSlots: number;
  occupancyRate: number;
  todayRevenue: number;
  currency?: string;
  avgStayMinutes?: number;
  totalTickets?: number;
  activeTickets?: number;
  completedTickets?: number;
}

export interface OperationalReportItem {
  ticketId: string;
  licensePlate: string;
  slotNumber: string;
  slotType: string;
  parkingName?: string;
  entryTime: string;
  exitTime?: string;
  durationMinutes?: number;
  ticketStatus: string;
  totalToCharge?: number;
  paymentStatus?: string;
  paymentMethod?: string;
  paidAmount?: number;
}

const isStringPayload = (val: unknown): val is string =>
  Object.prototype.toString.call(val) === "[object String]";

@Injectable({
  providedIn: "root",
})
export class DashboardFacade {
  private readonly http = inject(HttpClient);

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
      if (selected) {
        if (
          selected.mode === "SINGLE" &&
          selected.parkingId &&
          !parkings.some((p) => p.id === selected.parkingId)
        ) {
          return { mode: "GLOBAL" };
        }
        return selected;
      }
      return { mode: "GLOBAL" };
    }),
    {
      set: (val: ScopeState) => {
        this.userSelectedScope.set(val);
        this._activeScopeOverride.set(val);
      },
    }
  );

  readonly summary = signal<DashboardSummary | null>(null);
  readonly hourlyOccupancy = signal<HourlyOccupancyPoint[]>([]);
  readonly parkingsComparison = signal<ParkingComparisonItem[]>([]);
  readonly reports = signal<OperationalReportItem[]>([]);
  readonly reportsPage = signal<number>(0);
  readonly reportsTotalPages = signal<number>(0);
  readonly isLoading = signal<boolean>(false);

  readonly occupancyPercentage = computed(
    () => this.summary()?.occupancyRate ?? 0
  );

  private sseAbortController: AbortController | null = null;
  private retryCount = 0;

  setScope(mode: "GLOBAL" | "SINGLE", parkingId?: string): void {
    this.userSelectedScope.set({ mode, parkingId });
    this.loadAll();
    this.connectSse(parkingId);
  }

  handleSseMessage(eventName: string, data: unknown): void {
    if (!data) {
      return;
    }
    /* SAFETY: SSE payload from backend matches DashboardSummary schema contract */
    const parsed = (
      isStringPayload(data) ? JSON.parse(data) : data
    ) as DashboardSummary;

    if (
      eventName === "snapshot" ||
      eventName === "summary" ||
      eventName === "occupancy-update"
    ) {
      this.summary.set(parsed);
    }
  }

  calculateBackoffDelay(retryCount?: number): number {
    const count = retryCount ?? this.retryCount;
    return Math.min(1000 * 2 ** count, 30_000);
  }

  async connectSse(parkingId?: string): Promise<void> {
    if (this.sseAbortController) {
      this.sseAbortController.abort();
      this.sseAbortController = null;
    }

    const abortController = new AbortController();
    this.sseAbortController = abortController;

    const url = parkingId
      ? `/api/dashboard/stream?parkingId=${encodeURIComponent(parkingId)}`
      : `/api/dashboard/stream`;

    try {
      const response = await fetch(url, {
        headers: {
          Accept: "text/event-stream",
        },
        signal: abortController.signal,
      });

      if (!response.ok || !response.body) {
        throw new Error(`SSE HTTP error ${response.status}`);
      }
      this.retryCount = 0;
      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";

      const readStreamChunks = async (): Promise<void> => {
        const chunk = await reader.read();
        if (chunk.done) {
          return;
        }
        buffer += decoder.decode(chunk.value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const block of lines) {
          this.parseSseBlock(block);
        }
        return readStreamChunks();
      };

      await readStreamChunks();
    } catch (error: unknown) {
      /* SAFETY: error could be an AbortError when manually disconnecting */
      const err = error as { name?: string };
      if (err.name === "AbortError") {
        return;
      }
      const delay = this.calculateBackoffDelay(this.retryCount);
      this.retryCount += 1;
      setTimeout(() => {
        if (!abortController.signal.aborted) {
          void this.connectSse(parkingId);
        }
      }, delay);
    }
  }

  private parseSseBlock(block: string): void {
    const lines = block.split("\n");
    let eventName = "message";
    let data = "";

    for (const line of lines) {
      if (line.startsWith("event:")) {
        eventName = line.slice(6).trim();
      } else if (line.startsWith("data:")) {
        data = line.slice(5).trim();
      }
    }

    if (data) {
      try {
        const json = JSON.parse(data);
        this.handleSseMessage(eventName, json);
      } catch {
        this.handleSseMessage(eventName, data);
      }
    }
  }

  loadAll(): void {
    this.loadSummary();
    this.loadHourlyOccupancy();
    if (this.isMultiParkingTenant() && this.activeScope().mode === "GLOBAL") {
      this.loadParkingsComparison();
    }
    this.loadReports();
  }

  loadSummary(): void {
    const { parkingId } = this.activeScope();
    const url = parkingId
      ? `/api/dashboard/summary?parkingId=${encodeURIComponent(parkingId)}`
      : `/api/dashboard/summary`;

    this.http.get<DashboardSummary>(url).subscribe({
      error: (err: unknown) => {
        void err;
      },
      next: (res) => this.summary.set(res),
    });
  }

  loadHourlyOccupancy(): void {
    const { parkingId } = this.activeScope();
    const url = parkingId
      ? `/api/dashboard/occupancy-hourly?parkingId=${encodeURIComponent(parkingId)}`
      : `/api/dashboard/occupancy-hourly`;

    this.http.get<HourlyOccupancyPoint[]>(url).subscribe({
      error: (err: unknown) => {
        void err;
      },
      next: (res) => this.hourlyOccupancy.set(res || []),
    });
  }

  loadParkingsComparison(): void {
    this.http
      .get<ParkingComparisonItem[]>("/api/dashboard/parkings-comparison")
      .subscribe({
        error: (err: unknown) => {
          void err;
        },
        next: (res) => this.parkingsComparison.set(res || []),
      });
  }

  loadReports(page = 0): void {
    this.isLoading.set(true);
    const { parkingId } = this.activeScope();
    let url = `/api/reports/operational?page=${page}`;
    if (parkingId) {
      url += `&parkingId=${encodeURIComponent(parkingId)}`;
    }

    this.http
      .get<{
        content?: OperationalReportItem[];
        number?: number;
        totalPages?: number;
      }>(url)
      .subscribe({
        error: () => this.isLoading.set(false),
        next: (res) => {
          this.reports.set(res.content || []);
          this.reportsPage.set(res.number || page);
          this.reportsTotalPages.set(res.totalPages || 1);
          this.isLoading.set(false);
        },
      });
  }

  exportCsv(): Observable<Blob> {
    const { parkingId } = this.activeScope();
    const url = parkingId
      ? `/api/reports/operational/csv?parkingId=${encodeURIComponent(parkingId)}`
      : `/api/reports/operational/csv`;

    return this.http.get(url, { responseType: "blob" });
  }

  disconnect(): void {
    if (this.sseAbortController) {
      this.sseAbortController.abort();
      this.sseAbortController = null;
    }
  }
}
