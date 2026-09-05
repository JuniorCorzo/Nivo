import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from "@angular/core";
import type { ValidationError, FieldTree } from "@angular/forms/signals";
import { FormField } from "@angular/forms/signals";
import type { OperatingHours } from "@core/type/operating-hours.type";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucideClock } from "@ng-icons/lucide";
import {
  InputComponent,
  TypographyH3,
  TypographyMuted,
} from "@nivo-sass/design-system";
import { APP_TEXTS } from "@shared/constants/app-texts.constant";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [InputComponent, TypographyH3, TypographyMuted, FormField, NgIcon],
  providers: [provideIcons({ lucideClock })],
  selector: "app-parking-operating-hours-section",
  standalone: true,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }
  `,
  template: `
    <div class="flex items-center gap-2">
      <div
        class="bg-warning/10 text-warning border-warning/20 flex h-8 w-8 items-center justify-center rounded-lg border"
      >
        <ng-icon name="lucideClock" class="text-base" />
      </div>
      <div>
        <nv-h3 class="text-foreground text-base font-bold">
          {{ APP_TEXTS.parking.form.fields.operatingHours.title }}
        </nv-h3>
        <nv-muted class="text-muted-foreground text-xs">
          Horarios de apertura y cierre para atención y cobro
        </nv-muted>
      </div>
    </div>

    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
})
export class ParkingOperatingHoursSectionComponent {
  protected readonly APP_TEXTS = APP_TEXTS;

  readonly operatingHours = input.required<FieldTree<OperatingHours>>();

  readonly openTimeError = computed(() =>
    ParkingOperatingHoursSectionComponent.getError(
      this.operatingHours().openTime
    )
  );
  readonly closeTimeError = computed(() =>
    ParkingOperatingHoursSectionComponent.getError(
      this.operatingHours().closeTime
    )
  );

  private static getError(
    field: FieldTree<string, string>
  ): ValidationError.WithFieldTree[] | undefined {
    if (!field().touched() && field().invalid()) {
      return undefined;
    }
    return field().errors() ?? [];
  }
}
