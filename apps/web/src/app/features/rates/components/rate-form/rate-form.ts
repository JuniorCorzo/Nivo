import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideArrowLeft, lucideChevronRight, lucidePlus, lucideSave } from '@ng-icons/lucide';
import {
  ButtonComponent,
  CardComponent,
  InputComponent,
  SelectComponent,
  TypographyH2,
  TypographyMono,
  TypographyMuted,
} from '@nivo-sass/design-system';

import { RateFormFacade } from '../../facades/rate-form.facade';
import { RatePreviewComponent } from '../rate-calculator/rate-preview';
import { TimeUnit, VehicleType } from '@core/models/rate.model';
import { APP_ROUTES } from '@shared/constants/app-routes.constant';
import {
  Option,
  TIME_UNIT_OPTIONS,
  VEHICLE_TYPE_OPTIONS,
  displayOptionFn,
  valueOptionFn,
} from '../../shared/rate-presentations';

@Component({
  selector: 'app-rate-form',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    NgIcon,
    ButtonComponent,
    CardComponent,
    InputComponent,
    SelectComponent,
    TypographyH2,
    TypographyMuted,
    TypographyMono,
    RatePreviewComponent,
  ],
  providers: [
    RateFormFacade,
    provideIcons({ lucideArrowLeft, lucideChevronRight, lucidePlus, lucideSave }),
  ],
  templateUrl: './rate-form.html',
})
export class RateFormComponent {
  protected readonly facade = inject(RateFormFacade);
  protected readonly APP_ROUTES = APP_ROUTES;

  readonly vehicleTypeOptions = VEHICLE_TYPE_OPTIONS;
  readonly timeUnitOptions = TIME_UNIT_OPTIONS;
  readonly displayOptionFn = displayOptionFn;
  readonly valueOptionFn = valueOptionFn;

  readonly policyOptions = computed<Option[]>(() => {
    const defaultOption: Option = { label: 'Ninguna', value: '' };
    const items: Option[] = this.facade.specialPolicies().map((p) => ({
      label: `${p.name} (${p.valueToModify}% ${p.modifies})`,
      value: p.id ?? '',
    }));
    return [defaultOption, ...items];
  });

  onNameInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.facade.form.name.set(target.value);
  }

  onDescInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.facade.form.description.set(target.value);
  }

  onPriceInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.facade.form.pricePerUnit.set(target.valueAsNumber || 0);
  }

  onMinTimeInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.facade.form.minChargeTimeMinutes.set(target.valueAsNumber || 0);
  }

  onVehicleTypeChange(val: any): void {
    if (val) this.facade.form.vehicleType.set(val as VehicleType);
  }

  onTimeUnitChange(val: any): void {
    if (val) this.facade.form.timeUnit.set(val as TimeUnit);
  }

  onPolicyChange(val: any): void {
    this.facade.form.specialPolicyId.set(val ? String(val) : null);
  }

  onDurationChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.facade.previewDurationMinutes.set(target.valueAsNumber || 0);
  }
}
