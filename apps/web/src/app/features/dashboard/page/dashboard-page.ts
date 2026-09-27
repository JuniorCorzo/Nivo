import { CommonModule, DecimalPipe } from "@angular/common";
import type { OnDestroy, OnInit } from "@angular/core";
import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
} from "@angular/core";
import { ParkingService } from "@core/services/parking-service";
import { NgIcon, provideIcons } from "@ng-icons/core";
import {
  lucideBuilding2,
  lucideCar,
  lucideClock,
  lucideDollarSign,
  lucideDownload,
  lucideLayers,
  lucideLayoutDashboard,
  lucideTicket,
  lucideTrendingUp,
} from "@ng-icons/lucide";
import {
  ButtonComponent,
  CardComponent,
  CardContentComponent,
  CardDescriptionComponent,
  CardHeaderComponent,
  CardTitleComponent,
} from "@nivo-sass/design-system";
import type { PageHeaderBreadcrumbItem } from "@shared/components/page-header/page-header";
import { PageHeaderComponent } from "@shared/components/page-header/page-header";
import { APP_ROUTES } from "@shared/constants/app-routes.constant";

import { OccupancyTrendChartComponent } from "../components/occupancy-trend-chart/occupancy-trend-chart";
import { OperationalReportsTableComponent } from "../components/operational-reports-table/operational-reports-table";
import { ParkingComparisonChartComponent } from "../components/parking-comparison-chart/parking-comparison-chart";
import { SlotDistributionDonutChartComponent } from "../components/slot-distribution-donut-chart/slot-distribution-donut-chart";
import { DashboardFacade } from "../facade/dashboard.facade";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    DecimalPipe,
    NgIcon,
    PageHeaderComponent,
    CardComponent,
    CardHeaderComponent,
    CardTitleComponent,
    CardDescriptionComponent,
    CardContentComponent,
    ButtonComponent,
    OccupancyTrendChartComponent,
    SlotDistributionDonutChartComponent,
    ParkingComparisonChartComponent,
    OperationalReportsTableComponent,
  ],
  providers: [
    provideIcons({
      lucideBuilding2,
      lucideCar,
      lucideClock,
      lucideDollarSign,
      lucideDownload,
      lucideLayers,
      lucideLayoutDashboard,
      lucideTicket,
      lucideTrendingUp,
    }),
  ],
  selector: "app-dashboard-page",
  standalone: true,
  styleUrl: "./dashboard-page.css",
  templateUrl: "./dashboard-page.html",
})
export class DashboardPage implements OnInit, OnDestroy {
  readonly facade = inject(DashboardFacade);
  private readonly parkingService = inject(ParkingService, { optional: true });

  readonly breadcrumbs: PageHeaderBreadcrumbItem[] = [
    { label: "Dashboard", url: APP_ROUTES.app.dashboard },
  ];

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
    this.facade.loadAll();
    this.facade.connectSse();
  }

  ngOnDestroy(): void {
    this.facade.disconnect();
  }

  onParkingSelected(parkingId: string): void {
    this.facade.setScope("SINGLE", parkingId);
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
}
