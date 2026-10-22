import { DecimalPipe } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from "@angular/core";
import type { SimulateRateResponse } from "@core/models/simulator.model";
import { NgIcon, provideIcons } from "@ng-icons/core";
import {
  lucideArrowRight,
  lucideBadgeCheck,
  lucideBike,
  lucideCar,
  lucideMotorbike,
  lucideReceipt,
  lucideShieldCheck,
} from "@ng-icons/lucide";
import {
  BadgeComponent,
  ButtonComponent,
  CardComponent,
  CardContentComponent,
  CardDescriptionComponent,
  CardHeaderComponent,
  CardTitleComponent,
  TypographyH2,
  TypographyMuted,
  TypographyP,
} from "@nivo-sass/design-system";
import { APP_TEXTS } from "@shared/constants/app-texts.constant";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DecimalPipe,
    NgIcon,
    ButtonComponent,
    CardComponent,
    CardHeaderComponent,
    CardTitleComponent,
    CardDescriptionComponent,
    CardContentComponent,
    BadgeComponent,
    TypographyH2,
    TypographyP,
    TypographyMuted,
  ],
  providers: [
    provideIcons({
      lucideArrowRight,
      lucideBadgeCheck,
      lucideBike,
      lucideCar,
      lucideMotorbike,
      lucideReceipt,
      lucideShieldCheck,
    }),
  ],
  selector: "landing-simulator",
  standalone: true,
  templateUrl: "./landing-simulator.component.html",
})
export class LandingSimulatorComponent {
  protected readonly texts = APP_TEXTS.landing.simulator;

  readonly vehicleType = input.required<"CAR" | "MOTORCYCLE" | "BIKE">();
  readonly minutesStayed = input.required<number>();
  readonly pricePerUnit = input.required<number>();
  readonly gracePeriodMinutes = input.required<number>();
  readonly ivaRate = input.required<number>();
  readonly simulationResult = input<SimulateRateResponse | null>(null);
  readonly isCalculating = input<boolean>(false);

  readonly vehicleTypeChange = output<"CAR" | "MOTORCYCLE" | "BIKE">();
  readonly durationChange = output<number>();
  readonly registerClick = output();

  onMinutesInputChange(event: Event): void {
    /* SAFETY: event.target is bound to HTMLInputElement on input change */
    const target = event.target as HTMLInputElement;
    const value = Math.trunc(Number(target.value));
    if (!Number.isNaN(value) && value > 0) {
      this.durationChange.emit(value);
    }
  }
}
