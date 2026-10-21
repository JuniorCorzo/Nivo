import type { OnDestroy, OnInit } from "@angular/core";
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
} from "@angular/core";
import { ParkingService } from "@core/services/parking-service";
import type { PageHeaderBreadcrumbItem } from "@shared/components/page-header/page-header";
import { APP_ROUTES } from "@shared/constants/app-routes.constant";
import { APP_TEXTS } from "@shared/constants/app-texts.constant";

import { DashboardChartsSectionComponent } from "../components/dashboard-charts-section/dashboard-charts-section";
import { DashboardHeaderComponent } from "../components/dashboard-header/dashboard-header";
import { DashboardKpiGridComponent } from "../components/dashboard-kpi-grid/dashboard-kpi-grid";
import { DashboardOperationsSectionComponent } from "../components/dashboard-operations-section/dashboard-operations-section";
import { DashboardReportsSectionComponent } from "../components/dashboard-reports-section/dashboard-reports-section";
import type { TimeGranularity } from "../facade/dashboard.facade";
import { DashboardFacade } from "../facade/dashboard.facade";

export type { TimeGranularity } from "../facade/dashboard.facade";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DashboardHeaderComponent,
    DashboardKpiGridComponent,
    DashboardChartsSectionComponent,
    DashboardOperationsSectionComponent,
    DashboardReportsSectionComponent,
  ],
  selector: "app-dashboard-page",
  standalone: true,
  styleUrl: "./dashboard-page.css",
  templateUrl: "./dashboard-page.html",
})
export class DashboardPage implements OnInit, OnDestroy {
  readonly facade = inject(DashboardFacade);
  private readonly parkingService = inject(ParkingService, { optional: true });
  protected readonly texts = APP_TEXTS.dashboard;

  readonly timeGranularity = this.facade.timeGranularity;

  readonly breadcrumbs: PageHeaderBreadcrumbItem[] = [
    { label: "Dashboard", url: APP_ROUTES.app.dashboard },
  ];

  readonly kpiSectionTitle = computed(() => {
    const scope = this.facade.activeScope();
    if (scope.mode === "SINGLE" && scope.parkingId) {
      const parking = this.facade
        .accessibleParkings()
        .find((p) => p.id === scope.parkingId);
      if (parking) {
        return parking.name;
      }
      return this.texts.kpis.singleTitle;
    }
    return this.texts.kpis.title;
  });

  readonly chartTitle = computed(() =>
    this.timeGranularity() === "today"
      ? this.texts.chart.titleHourly
      : this.texts.chart.titleDaily
  );

  readonly chartSubtitle = computed(() => {
    const granularity = this.timeGranularity();
    if (granularity === "7days") {
      return this.texts.chart.subtitles.sevenDays;
    }
    if (granularity === "30days") {
      return this.texts.chart.subtitles.thirtyDays;
    }
    return this.texts.chart.subtitles.today;
  });

  constructor() {
    effect(() => {
      const lots = this.parkingService?.parkingLots() ?? [];
      if (lots.length > 0 && this.facade.accessibleParkings().length === 0) {
        this.facade.accessibleParkings.set(
          lots.map((l) => ({ id: l.id, name: l.name }))
        );
      }
    });
  }

  ngOnInit(): void {
    if (this.facade.accessibleParkings().length === 0) {
      this.parkingService?.refresh?.();
    }
    this.facade.loadAll();
    this.facade.connectSse();
  }

  ngOnDestroy(): void {
    this.facade.disconnect();
  }

  setTimeGranularity(granularity: TimeGranularity): void {
    this.facade.setTimeGranularity(granularity);
  }

  onScopeChange(scope: {
    mode: "GLOBAL" | "SINGLE";
    parkingId?: string;
  }): void {
    this.facade.setScope(scope.mode, scope.parkingId);
  }

  onParkingSelected(parkingId: string): void {
    this.facade.setScope("SINGLE", parkingId);
  }

  onPageChange(page: number): void {
    this.facade.loadReports(page);
  }

  exportCsv(): void {
    this.facade.exportCsv().subscribe({
      error: (err: unknown) => {
        void err;
      },
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `operational-report-${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
    });
  }

  refreshTelemetry(): void {
    this.facade.refreshTelemetry();
  }
}
