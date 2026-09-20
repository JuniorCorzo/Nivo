import { CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from "@angular/core";
import { RouterLink } from "@angular/router";
import type { TimeUnit, VehicleType } from "@core/models/rate.model";
import { NgIcon, provideIcons } from "@ng-icons/core";
import {
  lucideArrowLeft,
  lucideChevronRight,
  lucidePlus,
  lucideSave,
  lucideCoins,
  lucideSliders,
  lucideLoader2,
} from "@ng-icons/lucide";
import {
  ButtonComponent,
  InputComponent,
  SelectComponent,
} from "@nivo-sass/design-system";
import { PageHeaderComponent } from "@shared/components/page-header/page-header";
import type { PageHeaderBreadcrumbItem } from "@shared/components/page-header/page-header";
import { APP_ROUTES } from "@shared/constants/app-routes.constant";

import { RateFormFacade } from "../../../facades/rate-form.facade";
import type { Option } from "../../../shared/rate-presentations";
import {
  TIME_UNIT_OPTIONS,
  VEHICLE_TYPE_OPTIONS,
  displayOptionFn,
  valueOptionFn,
} from "../../../shared/rate-presentations";
import { RatePreviewComponent } from "../../calculator/rate-calculator/rate-preview";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterLink,
    NgIcon,
    ButtonComponent,
    InputComponent,
    SelectComponent,
    RatePreviewComponent,
    PageHeaderComponent,
  ],
  providers: [
    RateFormFacade,
    provideIcons({
      lucideArrowLeft,
      lucideChevronRight,
      lucideCoins,
      lucideLoader2,
      lucidePlus,
      lucideSave,
      lucideSliders,
    }),
  ],
  selector: "app-rate-form",
  standalone: true,
  templateUrl: "./rate-form.html",
})
export class RateFormComponent {
  protected readonly facade = inject(RateFormFacade);
  protected readonly APP_ROUTES = APP_ROUTES;

  readonly vehicleTypeOptions = VEHICLE_TYPE_OPTIONS;
  readonly timeUnitOptions = TIME_UNIT_OPTIONS;
  readonly displayOptionFn = displayOptionFn;
  readonly valueOptionFn = valueOptionFn;

  readonly breadcrumbs = computed<PageHeaderBreadcrumbItem[]>(() => {
    const p = this.facade.parking();
    const modeLabel =
      this.facade.mode() === "create" ? "Nueva tarifa" : "Editar tarifa";
    const modeIcon =
      this.facade.mode() === "create" ? "lucidePlus" : "lucideEdit";
    if (!p) {
      return [
        {
          icon: "lucideParkingSquare",
          label: "Parqueaderos",
          url: APP_ROUTES.app.parkingLots,
        },
        { icon: modeIcon, label: modeLabel },
      ];
    }
    return [
      {
        icon: "lucideParkingSquare",
        label: "Parqueaderos",
        url: APP_ROUTES.app.parkingLots,
      },
      {
        icon: "lucideBuilding2",
        isParking: true,
        label: p.name,
        url: APP_ROUTES.app.parkingLots,
      },
      {
        icon: "lucideCoins",
        label: "Tarifas",
        url: APP_ROUTES.app.parkingLotRates(p.id),
      },
      { icon: modeIcon, label: modeLabel },
    ];
  });

  readonly policyOptions = computed<Option[]>(() => {
    const defaultOption: Option = { label: "Ninguna", value: "" };
    const items: Option[] = this.facade.specialPolicies().map((p) => ({
      label: `${p.name} (${p.valueToModify}% ${p.modifies})`,
      value: p.id ?? "",
    }));
    return [defaultOption, ...items];
  });

  onNameInput(event: Event): void {
    /* SAFETY: Target is HTMLInputElement */
    const target = event.target as HTMLInputElement;
    this.facade.form.name.set(target.value);
  }

  onDescInput(event: Event): void {
    /* SAFETY: Target is HTMLInputElement */
    const target = event.target as HTMLInputElement;
    this.facade.form.description.set(target.value);
  }

  onPriceInput(event: Event): void {
    /* SAFETY: Target is HTMLInputElement */
    const target = event.target as HTMLInputElement;
    this.facade.form.pricePerUnit.set(target.valueAsNumber || 0);
  }

  onMinTimeInput(event: Event): void {
    /* SAFETY: Target is HTMLInputElement */
    const target = event.target as HTMLInputElement;
    this.facade.form.minChargeTimeMinutes.set(target.valueAsNumber || 0);
  }

  onVehicleTypeChange(val: string | null | undefined): void {
    if (val) {
      /* SAFETY: Value matches VehicleType union */
      this.facade.form.vehicleType.set(val as VehicleType);
    }
  }

  onTimeUnitChange(val: string | null | undefined): void {
    if (val) {
      /* SAFETY: Value matches TimeUnit union */
      this.facade.form.timeUnit.set(val as TimeUnit);
    }
  }

  onPolicyChange(val: string | null | undefined): void {
    this.facade.form.specialPolicyId.set(val ? String(val) : null);
  }

  onDurationChange(event: Event): void {
    /* SAFETY: Target is HTMLInputElement */
    const target = event.target as HTMLInputElement;
    this.facade.previewDurationMinutes.set(target.valueAsNumber || 0);
  }
}
