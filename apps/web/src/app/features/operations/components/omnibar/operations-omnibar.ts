import { CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from "@angular/core";
import { FormsModule } from "@angular/forms";
import type { VehicleType } from "@core/models/rate.model";
import { NgIcon, provideIcons } from "@ng-icons/core";
import {
  lucideBike,
  lucideCamera,
  lucideCar,
  lucideLogIn,
  lucideLogOut,
  lucideQrCode,
  lucideSearch,
} from "@ng-icons/lucide";
import { ButtonComponent, DividerComponent } from "@nivo-sass/design-system";
import { APP_TEXTS } from "@shared/constants/app-texts.constant";
import { PlateMaskDirective } from "@shared/directives/plate-mask";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ButtonComponent,
    CommonModule,
    DividerComponent,
    FormsModule,
    NgIcon,
    PlateMaskDirective,
  ],
  providers: [
    provideIcons({
      lucideBike,
      lucideCamera,
      lucideCar,
      lucideLogIn,
      lucideLogOut,
      lucideQrCode,
      lucideSearch,
    }),
  ],
  selector: "app-operations-omnibar",
  standalone: true,
  templateUrl: "./operations-omnibar.html",
})
export class OperationsOmnibarComponent {
  readonly texts = APP_TEXTS.operations.omnibar;

  readonly hasMultipleVehicleTypes = input<boolean>(false);
  readonly expressVehicleType = input<VehicleType>("CAR");
  readonly expressPlate = input<string>("");
  readonly isSubmittingExpressCheckIn = input<boolean>(false);
  readonly availableCarSlotsCount = input<number>(0);
  readonly availableMotoSlotsCount = input<number>(0);
  readonly searchTicketQuery = input<string>("");

  readonly expressVehicleTypeChange = output<VehicleType>();
  readonly expressPlateChange = output<string>();
  readonly submitExpressCheckIn = output();
  readonly openUnplatedCheckIn = output();
  readonly searchTicketQueryChange = output<string>();
  readonly submitExpressCheckOut = output();
  readonly openQrScanner = output();

  onPlateInput(value: string): void {
    this.expressPlateChange.emit(value);
  }

  onSearchInput(event: Event): void {
    /* SAFETY: Target is guaranteed HTMLInputElement */
    const target = event.target as HTMLInputElement;
    this.searchTicketQueryChange.emit(target.value);
  }

  onVehicleTypeSelect(type: VehicleType): void {
    this.expressVehicleTypeChange.emit(type);
  }

  onSubmitCheckIn(): void {
    this.submitExpressCheckIn.emit();
  }

  onUnplatedClick(): void {
    this.openUnplatedCheckIn.emit();
  }

  onSubmitCheckOut(): void {
    this.submitExpressCheckOut.emit();
  }

  onScanQrClick(): void {
    this.openQrScanner.emit();
  }
}
