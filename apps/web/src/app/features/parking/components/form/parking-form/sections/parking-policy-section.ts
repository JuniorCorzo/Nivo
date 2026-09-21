import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from "@angular/core";
import type { FieldTree, ValidationError } from "@angular/forms/signals";
import { FormField } from "@angular/forms/signals";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucideReceipt } from "@ng-icons/lucide";
import {
  InputComponent,
  TypographyH3,
  TypographyMuted,
} from "@nivo-sass/design-system";
import { DurationInputComponent } from "@shared/components/duration-input/duration-input";
import { PercentageInputComponent } from "@shared/components/percentage-input/percentage-input";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    InputComponent,
    DurationInputComponent,
    PercentageInputComponent,
    TypographyH3,
    TypographyMuted,
    FormField,
    NgIcon,
  ],
  providers: [provideIcons({ lucideReceipt })],
  selector: "app-parking-policy-section",
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
        class="bg-primary/10 text-primary border-primary/20 flex h-8 w-8 items-center justify-center rounded-lg border"
      >
        <ng-icon name="lucideReceipt" class="text-base" />
      </div>
      <div>
        <nv-h3 class="text-foreground text-base font-bold">
          Políticas de liquidación
        </nv-h3>
        <nv-muted class="text-muted-foreground text-xs">
          Reglas de tiempo de gracia, cobro por gracia y tasa de IVA aplicable
        </nv-muted>
      </div>
    </div>

    <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <app-duration-input
        id="gracePeriodMinutes"
        label="Tiempo de gracia"
        placeholder="0"
        [formField]="gracePeriodMinutes()"
        [error]="gracePeriodMinutesError()"
      />
      <nv-input
        id="gracePeriodPrice"
        type="number"
        label="Tarifa tiempo de gracia ($)"
        placeholder="0"
        [formField]="gracePeriodPrice()"
        [error]="gracePeriodPriceError()"
      />
      <app-percentage-input
        id="ivaRate"
        label="Tasa IVA (%)"
        placeholder="19"
        [formField]="ivaRate()"
        [error]="ivaRateError()"
      />
    </div>
  `,
})
export class ParkingPolicySectionComponent {
  readonly gracePeriodMinutes = input.required<FieldTree<number, string>>();
  readonly gracePeriodPrice = input.required<FieldTree<number, string>>();
  readonly ivaRate = input.required<FieldTree<number, string>>();

  readonly gracePeriodMinutesError = computed(() =>
    ParkingPolicySectionComponent.getError(this.gracePeriodMinutes())
  );
  readonly gracePeriodPriceError = computed(() =>
    ParkingPolicySectionComponent.getError(this.gracePeriodPrice())
  );
  readonly ivaRateError = computed(() =>
    ParkingPolicySectionComponent.getError(this.ivaRate())
  );

  private static getError(
    field: FieldTree<unknown, string>
  ): ValidationError.WithFieldTree[] | undefined {
    if (!field().touched() && field().invalid()) {
      return undefined;
    }
    return field().errors() ?? [];
  }
}
