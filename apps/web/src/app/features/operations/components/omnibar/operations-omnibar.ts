import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from "@angular/core";
import { FormsModule } from "@angular/forms";
import type {
  OperationsOmnibarAction,
  OperationsOmnibarState,
  OperationsVehicleToggleOption,
} from "@core/models/operations-cockpit.model";
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
import {
  ButtonComponent,
  DividerComponent,
  InputComponent,
} from "@nivo-sass/design-system";
import { APP_TEXTS } from "@shared/constants/app-texts.constant";
import { PlateMaskDirective } from "@shared/directives/plate-mask";
import { normalizeRawPlate } from "@shared/utils/plate.utils";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ButtonComponent,
    DividerComponent,
    FormsModule,
    InputComponent,
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

  readonly state = input.required<OperationsOmnibarState>();
  readonly action = output<OperationsOmnibarAction>();

  readonly plateInputClass =
    "border-input bg-background text-foreground placeholder:text-muted-foreground focus:ring-primary w-full rounded-lg border px-3 py-2 text-center font-mono text-sm font-bold tracking-wider uppercase transition-colors focus:ring-2 focus:outline-hidden";
  readonly kbdPrimaryClass =
    "border-primary-foreground/30 bg-primary-foreground/20 text-primary-foreground ml-1 hidden rounded border px-1.5 py-0.5 font-mono text-[10px] font-semibold sm:inline-block";
  readonly kbdMutedClass =
    "border-border bg-muted text-muted-foreground ml-1.5 hidden rounded border px-1.5 py-0.5 font-mono text-[10px] font-semibold sm:inline-block";
  readonly sectionTitleClass =
    "text-foreground font-mono text-xs font-bold tracking-wider uppercase";
  readonly hotkeyHintClass =
    "text-muted-foreground hidden font-mono text-xs sm:inline-block";
  readonly toggleGroupClass =
    "bg-muted/60 border-border inline-flex w-full shrink-0 rounded-lg border p-1 text-xs sm:w-auto";

  readonly vehicleToggleOptions = computed<OperationsVehicleToggleOption[]>(
    () => {
      const s = this.state();
      return [
        {
          availableCount: s.availableCarSlotsCount,
          icon: "lucideCar",
          label: this.texts.car,
          type: "CAR",
        },
        {
          availableCount: s.availableMotoSlotsCount,
          icon: "lucideBike",
          label: this.texts.moto,
          type: "MOTORCYCLE",
        },
      ];
    }
  );

  onPlateInput(plate: string): void {
    this.action.emit({ plate, type: "updatePlate" });
  }

  onSearchChange(query: string): void {
    this.action.emit({ query, type: "updateSearchQuery" });
  }

  onVehicleTypeSelect(vehicleType: VehicleType): void {
    this.action.emit({ type: "selectVehicleType", vehicleType });
  }

  onSubmitCheckIn(): void {
    const s = this.state();
    const cleanPlate = normalizeRawPlate(s.expressPlate);
    if (
      s.isSubmittingExpressCheckIn ||
      cleanPlate.length < 3 ||
      cleanPlate.length > 7
    ) {
      return;
    }
    this.action.emit({ type: "submitCheckIn" });
  }

  onUnplatedClick(): void {
    this.action.emit({ type: "openUnplatedCheckIn" });
  }

  onSearchEnter(): void {
    if (this.state().searchTicketQuery.trim().length >= 1) {
      this.action.emit({ type: "submitCheckOut" });
    }
  }

  onSubmitCheckOut(): void {
    this.action.emit({ type: "submitCheckOut" });
  }

  onScanQrClick(): void {
    this.action.emit({ type: "openQrScanner" });
  }

  getVehicleToggleClass(type: VehicleType): string {
    const active =
      this.state().expressVehicleType === type
        ? "bg-card text-foreground shadow-xs"
        : "text-muted-foreground";
    return `h-auto flex-1 gap-1.5 rounded-md px-2.5 py-1.5 text-xs sm:flex-initial ${active}`;
  }
}
