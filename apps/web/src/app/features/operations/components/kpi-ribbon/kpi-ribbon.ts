import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from "@angular/core";
import type {
  OperationsKpiMetrics,
  OperationsKpiVehicleCard,
} from "@core/models/operations-cockpit.model";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucideBike, lucideCar, lucideGauge } from "@ng-icons/lucide";
import { BadgeComponent } from "@nivo-sass/design-system";
import { APP_TEXTS } from "@shared/constants/app-texts.constant";

import {
  buildOperationsKpiVehicleCards,
  calculateOccupancyRate,
} from "./kpi-ribbon.helpers";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BadgeComponent, NgIcon],
  providers: [provideIcons({ lucideBike, lucideCar, lucideGauge })],
  selector: "app-operations-kpi-ribbon",
  standalone: true,
  templateUrl: "./kpi-ribbon.html",
})
export class OperationsKpiRibbonComponent {
  readonly texts = APP_TEXTS.operations.ribbon;
  readonly metrics = input.required<OperationsKpiMetrics>();

  readonly vehicleCards = computed<OperationsKpiVehicleCard[]>(() =>
    buildOperationsKpiVehicleCards(this.metrics(), this.texts)
  );

  readonly activeSlotsPct = computed(() => {
    const metrics = this.metrics();
    return calculateOccupancyRate(
      metrics.occupiedSlotsCount,
      metrics.totalSlotsCount
    );
  });

  readonly badgeVariant = computed<"destructive" | "outline" | "warning">(
    () => {
      const { occupationPercentage } = this.metrics();
      if (occupationPercentage >= 90) {
        return "destructive";
      }
      if (occupationPercentage >= 75) {
        return "warning";
      }
      return "outline";
    }
  );

  readonly occupationBarClass = computed(() => {
    const { occupationPercentage } = this.metrics();
    let tone = "bg-success";
    if (occupationPercentage >= 90) {
      tone = "bg-destructive";
    } else if (occupationPercentage >= 75) {
      tone = "bg-warning";
    }
    return `h-full rounded-full transition-all duration-500 ${tone}`;
  });
}
