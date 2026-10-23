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

import { SimulatorControlsComponent } from "./simulator-controls.component";
import { SimulatorTicketComponent } from "./simulator-ticket.component";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    BadgeComponent,
    TypographyH2,
    TypographyP,
    SimulatorControlsComponent,
    SimulatorTicketComponent,
  ],
  selector: "app-simulator",
  standalone: true,
  templateUrl: "./simulator.component.html",
})
export class SimulatorComponent {
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
  readonly registerClick = output();
}

export { SimulatorComponent as LandingSimulatorComponent };
