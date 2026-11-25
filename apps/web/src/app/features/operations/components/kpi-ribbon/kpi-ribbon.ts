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

  readonly vehicleCards = computed<OperationsKpiVehicleCard[]>(() => {
    const m = this.metrics();
    const cards: OperationsKpiVehicleCard[] = [];
    if (m.totalCarSlotsCount > 0) {
      cards.push({
        available: m.availableCarSlotsCount,
        barClass: "bg-success/80",
        icon: "lucideCar",
        iconBoxClass: "bg-success/10 text-success border-success/20",
        id: "CAR",
        label: this.texts.cars,
        occupiedPct:
          ((m.totalCarSlotsCount - m.availableCarSlotsCount) /
            m.totalCarSlotsCount) *
          100,
        total: m.totalCarSlotsCount,
      });
    }
    if (m.totalMotoSlotsCount > 0) {
      cards.push({
        available: m.availableMotoSlotsCount,
        barClass: "bg-primary/80",
        icon: "lucideBike",
        iconBoxClass: "bg-primary/10 text-primary border-primary/20",
        id: "MOTORCYCLE",
        label: this.texts.motos,
        occupiedPct:
          ((m.totalMotoSlotsCount - m.availableMotoSlotsCount) /
            m.totalMotoSlotsCount) *
          100,
        total: m.totalMotoSlotsCount,
      });
    }
    return cards;
  });

  readonly activeSlotsPct = computed(() => {
    const m = this.metrics();
    return m.totalSlotsCount > 0
      ? (m.occupiedSlotsCount / m.totalSlotsCount) * 100
      : 0;
  });

  readonly badgeVariant = computed<"destructive" | "outline" | "warning">(
    () => {
      const pct = this.metrics().occupationPercentage;
      if (pct >= 90) {
        return "destructive";
      }
      if (pct >= 75) {
        return "warning";
      }
      return "outline";
    }
  );

  readonly occupationBarClass = computed(() => {
    const pct = this.metrics().occupationPercentage;
    let tone = "bg-success";
    if (pct >= 90) {
      tone = "bg-destructive";
    } else if (pct >= 75) {
      tone = "bg-warning";
    }
    return `h-full rounded-full transition-all duration-500 ${tone}`;
  });
}
