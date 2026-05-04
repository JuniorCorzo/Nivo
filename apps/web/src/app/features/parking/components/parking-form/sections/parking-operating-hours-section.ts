import { Component, computed, input } from '@angular/core';
import { ValidationError, FormField, FieldTree } from '@angular/forms/signals';

import { APP_TEXTS } from '@shared/constants/app-texts.constant';
import { OperatingHours } from '@core/type/operating-hours.type';
import { InputComponent, TypographyH3 } from '@nivo-sass/design-system';

@Component({
  selector: 'app-parking-operating-hours-section',
  standalone: true,
  imports: [InputComponent, TypographyH3, FormField],
  template: `
    <nv-h3 class="text-base">{{ APP_TEXTS.parking.form.fields.operatingHours.title }}</nv-h3>
    <div class="form-row">
      <nv-input
        id="openTime"
        type="text"
        [label]="APP_TEXTS.parking.form.fields.operatingHours.openTime.label"
        placeholder="HH:mm (Ej. 08:00)"
        [formField]="operatingHours().openTime"
        [error]="openTimeError()"
      >
      </nv-input>
      <nv-input
        id="closeTime"
        type="text"
        [label]="APP_TEXTS.parking.form.fields.operatingHours.closeTime.label"
        placeholder="HH:mm (Ej. 20:00)"
        [formField]="operatingHours().closeTime"
        [error]="closeTimeError()"
      >
      </nv-input>
    </div>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .form-row {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
    }

    @media (max-width: 640px) {
      .form-row {
        grid-template-columns: 1fr;
      }
    }
  `,
})
export class ParkingOperatingHoursSectionComponent {
  protected readonly APP_TEXTS = APP_TEXTS;

  readonly operatingHours = input.required<FieldTree<OperatingHours>>();

  readonly openTimeError = computed(() =>
    this.getError(this.operatingHours().openTime),
  );
  readonly closeTimeError = computed(() =>
    this.getError(this.operatingHours().closeTime),
  );

  private getError(
    field: FieldTree<string, string>,
  ): ValidationError.WithFieldTree[] | undefined {
    if (!field().touched() && field().invalid()) return undefined;
    return field().errors() ?? [];
  }
}
