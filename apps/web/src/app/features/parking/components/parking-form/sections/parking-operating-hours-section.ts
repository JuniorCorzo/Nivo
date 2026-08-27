import { Component, computed, input } from '@angular/core';
import { ValidationError, FormField, FieldTree } from '@angular/forms/signals';

import { APP_TEXTS } from '@shared/constants/app-texts.constant';
import { OperatingHours } from '@core/type/operating-hours.type';
import { InputComponent, TypographyH3, TypographyMuted } from '@nivo-sass/design-system';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideClock } from '@ng-icons/lucide';

@Component({
  selector: 'app-parking-operating-hours-section',
  standalone: true,
  imports: [InputComponent, TypographyH3, TypographyMuted, FormField, NgIcon],
  providers: [provideIcons({ lucideClock })],
  template: `
    <div class="flex items-center gap-2">
      <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
        <ng-icon name="lucideClock" class="text-base" />
      </div>
      <div>
        <nv-h3 class="text-base font-bold text-neutral-900 dark:text-neutral-100">
          {{ APP_TEXTS.parking.form.fields.operatingHours.title }}
        </nv-h3>
        <nv-muted class="text-xs text-neutral-500 dark:text-neutral-400">
          Horarios de apertura y cierre para atención y cobro
        </nv-muted>
      </div>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <nv-input
        id="openTime"
        type="text"
        [label]="APP_TEXTS.parking.form.fields.operatingHours.openTime.label"
        placeholder="HH:mm (Ej. 08:00)"
        [formField]="operatingHours().openTime"
        [error]="openTimeError()"
      />
      <nv-input
        id="closeTime"
        type="text"
        [label]="APP_TEXTS.parking.form.fields.operatingHours.closeTime.label"
        placeholder="HH:mm (Ej. 20:00)"
        [formField]="operatingHours().closeTime"
        [error]="closeTimeError()"
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
