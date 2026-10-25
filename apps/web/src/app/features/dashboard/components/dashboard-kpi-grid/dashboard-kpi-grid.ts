import { DecimalPipe } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from "@angular/core";
import type { DashboardSummaryModel } from "@core/models/dashboard.model";
import { NgIcon, provideIcons } from "@ng-icons/core";
import {
  lucideActivity,
  lucideArrowDownRight,
  lucideArrowUpRight,
  lucideClock,
  lucideDollarSign,
  lucideMinus,
  lucideTicket,
  lucideTrendingUp,
} from "@ng-icons/lucide";
import { CardComponent, CardContentComponent } from "@nivo-sass/design-system";
import { APP_TEXTS } from "@shared/constants/app-texts.constant";

import { buildDashboardKpiMetrics } from "../../models/dashboard-kpi.model";
import type { DashboardKpiMetrics } from "../../models/dashboard-kpi.model";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe, NgIcon, CardComponent, CardContentComponent],
  providers: [
    provideIcons({
      lucideActivity,
      lucideArrowDownRight,
      lucideArrowUpRight,
      lucideClock,
      lucideDollarSign,
      lucideMinus,
      lucideTicket,
      lucideTrendingUp,
    }),
  ],
  selector: "app-dashboard-kpi-grid",
  standalone: true,
  templateUrl: "./dashboard-kpi-grid.html",
})
export class DashboardKpiGridComponent {
  readonly title = input<string>("");
  readonly metrics = input<DashboardKpiMetrics | null>(null);
  readonly summary = input<DashboardSummaryModel | null>(null);
  readonly occupancyPercentage = input<number>(0);

  protected readonly texts = APP_TEXTS.dashboard;

  readonly effectiveMetrics = computed(
    () =>
      this.metrics() ??
      buildDashboardKpiMetrics(this.summary(), this.occupancyPercentage())
  );
}
