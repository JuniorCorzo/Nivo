import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from "@angular/core";
import type { ValidationError, FieldTree } from "@angular/forms/signals";
import { FormField } from "@angular/forms/signals";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucideMapPin } from "@ng-icons/lucide";
import {
  ComboboxComponent,
  InputComponent,
  TypographyH3,
  TypographyMuted,
} from "@nivo-sass/design-system";
import { APP_TEXTS } from "@shared/constants/app-texts.constant";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    InputComponent,
    ComboboxComponent,
    TypographyH3,
    TypographyMuted,
    FormField,
    NgIcon,
  ],
  providers: [provideIcons({ lucideMapPin })],
  selector: "app-parking-address-section",
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
        class="bg-success/10 text-success border-success/20 flex h-8 w-8 items-center justify-center rounded-lg border"
      >
        <ng-icon name="lucideMapPin" class="text-base" />
      </div>
      <div>
        <nv-h3 class="text-foreground text-base font-bold">
          {{ APP_TEXTS.parking.form.fields.address.title }}
        </nv-h3>
        <nv-muted class="text-muted-foreground text-xs">
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

    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
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

    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <nv-input
        id="zipCode"
        [label]="APP_TEXTS.parking.form.fields.address.zipCode.label"
        [placeholder]="
          APP_TEXTS.parking.form.fields.address.zipCode.placeholder
        "
        [formField]="zipCodeField()"
        [error]="zipCodeError()"
      />
    </div>
  `,
})
export class ParkingAddressSectionComponent {
  protected readonly APP_TEXTS = APP_TEXTS;

  readonly streetField = input.required<FieldTree<string, string>>();
  readonly streetError = input<ValidationError.WithFieldTree[] | undefined>();
  readonly stateField = input.required<FieldTree<string, string>>();
  readonly stateError = input<ValidationError.WithFieldTree[] | undefined>();
  readonly cityField = input.required<FieldTree<string, string>>();
  readonly cityError = input<ValidationError.WithFieldTree[] | undefined>();
  readonly zipCodeField = input.required<FieldTree<string, string>>();
  readonly zipCodeError = input<ValidationError.WithFieldTree[] | undefined>();
  readonly departments = input<string[]>([]);
  readonly cities = input<string[]>([]);

  readonly stateSelectionChange = output<string>();
  readonly citySelectionChange = output<string>();
}
