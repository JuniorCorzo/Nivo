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
  lucideTicket,
  lucideTrendingUp,
} from "@ng-icons/lucide";
import { CardComponent, CardContentComponent } from "@nivo-sass/design-system";
import { APP_TEXTS } from "@shared/constants/app-texts.constant";

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
  readonly summary = input<DashboardSummaryModel | null>(null);
  readonly occupancyPercentage = input<number>(0);

  protected readonly texts = APP_TEXTS.dashboard;

  readonly occupancyClampedPercentage = computed(() => {
    const pct = this.occupancyPercentage();
    return Math.min(Math.max(pct, 0), 100);
  });

  readonly occupancyProgressClass = computed(() => {
    const pct = this.occupancyPercentage();
    if (pct >= 90) {
      return "bg-rose-500";
    }
    if (pct >= 70) {
      return "bg-amber-500";
    }
    return "bg-emerald-500";
  });

  readonly occupancyDeltaClass = computed(() => {
    const pct = this.occupancyPercentage();
    if (pct >= 90) {
      return "text-rose-400";
    }
    if (pct >= 70) {
      return "text-amber-400";
    }
    return "text-emerald-400";
  });

  readonly occupancyDeltaText = computed(() => {
    const pct = this.occupancyPercentage();
    if (pct >= 90) {
      return this.texts.kpis.occupancy.critical;
    }
    if (pct >= 70) {
      return this.texts.kpis.occupancy.alert;
    }
    return this.texts.kpis.occupancy.normal;
  });

  readonly formattedAvgStayMinutes = computed(() => {
    const mins = this.summary()?.avgStayMinutes ?? 0;
    return Math.round(mins);
  });

  readonly formattedAvgStayHours = computed(() => {
    const mins = Math.round(this.summary()?.avgStayMinutes ?? 0);
    if (!mins) {
      return "~0m";
    }
    const hours = Math.floor(mins / 60);
    const remMins = mins % 60;
    return hours > 0 ? `~${hours}h ${remMins}m` : `~${remMins}m`;
  });

  readonly totalOrCompletedTickets = computed(() => {
    const s = this.summary();
    return s?.completedTickets ?? s?.totalTickets ?? 0;
  });

  readonly netFlowRateText = computed(() => {
    const active = this.summary()?.activeTickets ?? 0;
    return active > 0 ? `+${Math.round(active * 0.05) || 12} veh/h` : "0 veh/h";
  });
}
