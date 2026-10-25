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
    const flow = Math.round(active * 0.05);
    return flow > 0 ? `+${flow} veh/h` : "0 veh/h";
  });

  readonly hasDigitalRatio = computed(
    () =>
      this.summary()?.digitalPaymentRatio !== undefined &&
      this.summary()?.digitalPaymentRatio !== null
  );

  readonly digitalPaymentRatioText = computed(
    () => `${Math.round(this.summary()?.digitalPaymentRatio ?? 0)}%`
  );

  readonly hasRevenueDelta = computed(
    () =>
      this.summary()?.revenueDeltaPercentage !== undefined &&
      this.summary()?.revenueDeltaPercentage !== null
  );

  readonly revenueDelta = computed(
    () => this.summary()?.revenueDeltaPercentage ?? 0
  );

  readonly revenueDeltaText = computed(() => {
    const d = this.revenueDelta();
    return d > 0 ? `+${d.toFixed(1)}%` : `${d.toFixed(1)}%`;
  });

  readonly revenueDeltaClass = computed(() => {
    const d = this.revenueDelta();
    if (d > 0) {
      return "text-emerald-400";
    }
    if (d < 0) {
      return "text-rose-400";
    }
    return "text-zinc-400";
  });

  readonly revenueDeltaIcon = computed(() => {
    const d = this.revenueDelta();
    if (d > 0) {
      return "lucideArrowUpRight";
    }
    if (d < 0) {
      return "lucideArrowDownRight";
    }
    return "lucideMinus";
  });

  readonly hasGracePeriod = computed(
    () => (this.summary()?.gracePeriodMinutes ?? 0) > 0
  );

  readonly hasStayDelta = computed(
    () =>
      this.summary()?.avgStayDeltaMinutes !== undefined &&
      this.summary()?.avgStayDeltaMinutes !== null
  );

  readonly stayDelta = computed(() => this.summary()?.avgStayDeltaMinutes ?? 0);

  readonly stayDeltaText = computed(() => {
    const d = this.stayDelta();
    return d > 0 ? `+${d.toFixed(1)} min` : `${d.toFixed(1)} min`;
  });

  readonly stayDeltaClass = computed(() => {
    const d = this.stayDelta();
    if (d < 0) {
      return "text-emerald-400";
    }
    if (d > 0) {
      return "text-rose-400";
    }
    return "text-zinc-400";
  });

  readonly stayDeltaIcon = computed(() => {
    const d = this.stayDelta();
    if (d < 0) {
      return "lucideArrowDownRight";
    }
    if (d > 0) {
      return "lucideArrowUpRight";
    }
    return "lucideMinus";
  });
}
