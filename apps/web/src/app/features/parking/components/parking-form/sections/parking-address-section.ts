import { Component, input, output } from '@angular/core';
import { ValidationError, FormField, FieldTree } from '@angular/forms/signals';

import { APP_TEXTS } from '@shared/constants/app-texts.constant';
import { ComboboxComponent, InputComponent, TypographyH3, TypographyMuted } from '@nivo-sass/design-system';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideMapPin } from '@ng-icons/lucide';

@Component({
  selector: 'app-parking-address-section',
  standalone: true,
  imports: [InputComponent, ComboboxComponent, TypographyH3, TypographyMuted, FormField, NgIcon],
  providers: [provideIcons({ lucideMapPin })],
  template: `
    <div class="flex items-center gap-2">
      <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
        <ng-icon name="lucideMapPin" class="text-base" />
      </div>
      <div>
        <nv-h3 class="text-base font-bold text-neutral-900 dark:text-neutral-100">
          {{ APP_TEXTS.parking.form.fields.address.title }}
        </nv-h3>
        <nv-muted class="text-xs text-neutral-500 dark:text-neutral-400">
          Dirección física, departamento, ciudad y código postal
        </nv-muted>
      </div>
    </div>

    <div class="grid grid-cols-1 gap-4">
      <nv-input
        id="street"
        class="w-full"
        [label]="APP_TEXTS.parking.form.fields.address.street.label"
        [placeholder]="APP_TEXTS.parking.form.fields.address.street.placeholder"
        [formField]="streetField()"
        [error]="streetError()"
      />
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <nv-combobox
        id="state"
        [label]="APP_TEXTS.parking.form.fields.address.state.label"
        [placeholder]="APP_TEXTS.parking.form.fields.address.state.placeholder"
        [formField]="stateField()"
        [items]="departments()"
        [error]="stateError()"
        (selectionChange)="stateSelectionChange.emit($event)"
      />
      <nv-combobox
        id="city"
        [label]="APP_TEXTS.parking.form.fields.address.city.label"
        [placeholder]="APP_TEXTS.parking.form.fields.address.city.placeholder"
        [formField]="cityField()"
        [items]="cities()"
        [error]="cityError()"
        (selectionChange)="citySelectionChange.emit($event)"
      />
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <nv-input
        id="zipCode"
        [label]="APP_TEXTS.parking.form.fields.address.zipCode.label"
        [placeholder]="APP_TEXTS.parking.form.fields.address.zipCode.placeholder"
        [formField]="zipCodeField()"
        [error]="zipCodeError()"
      />
    </div>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }
  `,
})
export class ParkingAddressSectionComponent {
  protected readonly APP_TEXTS = APP_TEXTS;

  readonly streetField = input.required<FieldTree<string, string>>();
  readonly streetError = input<ValidationError.WithFieldTree[] | undefined>(undefined);
  readonly stateField = input.required<FieldTree<string, string>>();
  readonly stateError = input<ValidationError.WithFieldTree[] | undefined>(undefined);
  readonly cityField = input.required<FieldTree<string, string>>();
  readonly cityError = input<ValidationError.WithFieldTree[] | undefined>(undefined);
  readonly zipCodeField = input.required<FieldTree<string, string>>();
  readonly zipCodeError = input<ValidationError.WithFieldTree[] | undefined>(undefined);
  readonly departments = input<string[]>([]);
  readonly cities = input<string[]>([]);

  readonly stateSelectionChange = output<unknown>();
  readonly citySelectionChange = output<unknown>();
}
