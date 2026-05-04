import { Component, input, output } from '@angular/core';
import { ValidationError, FormField, FieldTree } from '@angular/forms/signals';

import { APP_TEXTS } from '@shared/constants/app-texts.constant';
import { ComboboxComponent, InputComponent, TypographyH3 } from '@nivo-sass/design-system';

@Component({
  selector: 'app-parking-address-section',
  standalone: true,
  imports: [InputComponent, ComboboxComponent, TypographyH3, FormField],
  template: `
    <nv-h3 class="text-base">{{ APP_TEXTS.parking.form.fields.address.title }}</nv-h3>

    <div class="form-row">
      <nv-input
        id="street"
        class="full-width"
        [label]="APP_TEXTS.parking.form.fields.address.street.label"
        [placeholder]="APP_TEXTS.parking.form.fields.address.street.placeholder"
        [formField]="streetField()"
        [error]="streetError()"
      >
      </nv-input>
    </div>

    <div class="form-row">
      <nv-combobox
        id="state"
        [label]="APP_TEXTS.parking.form.fields.address.state.label"
        [placeholder]="APP_TEXTS.parking.form.fields.address.state.placeholder"
        [formField]="stateField()"
        [items]="departments()"
        [error]="stateError()"
        (selectionChange)="stateSelectionChange.emit($event)"
      >
      </nv-combobox>
      <nv-combobox
        id="city"
        [label]="APP_TEXTS.parking.form.fields.address.city.label"
        [placeholder]="APP_TEXTS.parking.form.fields.address.city.placeholder"
        [formField]="cityField()"
        [items]="cities()"
        [error]="cityError()"
        (selectionChange)="citySelectionChange.emit($event)"
      >
      </nv-combobox>
    </div>

    <nv-input
      id="zipCode"
      [label]="APP_TEXTS.parking.form.fields.address.zipCode.label"
      [placeholder]="APP_TEXTS.parking.form.fields.address.zipCode.placeholder"
      [formField]="zipCodeField()"
      [error]="zipCodeError()"
    >
    </nv-input>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .form-row {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
    }

    .full-width {
      grid-column: span 2;
    }

    @media (max-width: 640px) {
      .form-row {
        grid-template-columns: 1fr;
      }

      .full-width {
        grid-column: span 1;
      }
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
