import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from "@angular/core";
import type { SimulateRateResponse } from "@core/api/generated/models";
import type { VehicleType } from "@core/type/vehicle-type.type";
import {
  BadgeComponent,
  TypographyH2,
  TypographyP,
} from "@nivo-sass/design-system";
import { APP_TEXTS } from "@shared/constants/app-texts.constant";

import { LandingSimulatorControlsComponent } from "./landing-simulator-controls.component";
import { LandingSimulatorTicketComponent } from "./landing-simulator-ticket.component";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    BadgeComponent,
    TypographyH2,
    TypographyP,
    LandingSimulatorControlsComponent,
    LandingSimulatorTicketComponent,
  ],
  selector: "landing-simulator",
  standalone: true,
  templateUrl: "./landing-simulator.component.html",
})
export class LandingSimulatorComponent {
  protected readonly texts = APP_TEXTS.landing.simulator;

  readonly vehicleType = input.required<VehicleType>();
  readonly minutesStayed = input.required<number>();
  readonly pricePerUnit = input.required<number>();
  readonly gracePeriodMinutes = input.required<number>();
  readonly ivaRate = input.required<number>();
  readonly simulationResult = input<SimulateRateResponse | null>(null);
  readonly isCalculating = input<boolean>(false);

  readonly vehicleTypeChange = output<VehicleType>();
  readonly durationChange = output<number>();
  readonly registerClick = output<void>();
}
