import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucideBike, lucideCar, lucideGauge } from "@ng-icons/lucide";
import { BadgeComponent } from "@nivo-sass/design-system";
import { APP_TEXTS } from "@shared/constants/app-texts.constant";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BadgeComponent, CommonModule, NgIcon],
  providers: [
    provideIcons({
      lucideBike,
      lucideCar,
      lucideGauge,
    }),
  ],
  selector: "app-operations-kpi-ribbon",
  standalone: true,
  templateUrl: "./kpi-ribbon.html",
})
export class OperationsKpiRibbonComponent {
  readonly texts = APP_TEXTS.operations.ribbon;

  readonly totalSlotsCount = input.required<number>();
  readonly availableSlotsCount = input.required<number>();
  readonly occupationPercentage = input.required<number>();
  readonly occupationBarPercentage = input.required<number>();

  readonly totalCarSlotsCount = input.required<number>();
  readonly availableCarSlotsCount = input.required<number>();

  readonly totalMotoSlotsCount = input.required<number>();
  readonly availableMotoSlotsCount = input.required<number>();

  readonly occupiedSlotsCount = input.required<number>();
}
