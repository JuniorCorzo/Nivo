import {
  ChangeDetectionStrategy,
  Component,
  computed,
  forwardRef,
  input,
  signal,
} from "@angular/core";
import type { ControlValueAccessor } from "@angular/forms";
import { NG_VALUE_ACCESSOR } from "@angular/forms";
import type { ValidationError } from "@angular/forms/signals";
import { InputComponent } from "@nivo-sass/design-system";

import { PercentageConverter } from "../../utils/percentage.utils";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [InputComponent],
  providers: [
    {
      multi: true,
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PercentageInputComponent),
    },
  ],
  selector: "app-percentage-input",
  standalone: true,
  template: `
    <div class="flex flex-col gap-1.5" (focusout)="onBlur()">
      <nv-input
        [id]="id()"
        type="number"
        [label]="label()"
        [placeholder]="placeholder()"
        [value]="percentage().toString()"
        [disabled]="disabled()"
        [error]="normalizedError()"
        (input)="onPercentageInput($event)"
        (blur)="onBlur()"
      />
    </div>
  `,
})
export class PercentageInputComponent implements ControlValueAccessor {
  readonly id = input<string>("percentage-input");
  readonly label = input<string>("Tasa IVA (%)");
  readonly placeholder = input<string>("19");
  readonly error = input<
    string | ValidationError.WithFieldTree[] | undefined
  >();

  readonly percentage = signal<number>(0);
  readonly disabled = signal<boolean>(false);

  readonly normalizedError = computed<
    ValidationError.WithFieldTree[] | undefined
  >(() => {
    const err = this.error();
    if (typeof err === "string") {
      return [{ message: err } as ValidationError.WithFieldTree];
    }
    return err;
  });

  private onChange: (value: number) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(rate: number | null | undefined): void {
    const parsed = PercentageConverter.rateToPercentage(rate ?? 0);
    this.percentage.set(parsed);
  }

  registerOnChange(fn: (value: number) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  onPercentageInput(event: Event): void {
    const target = event.target as HTMLInputElement | null;
    const val = target?.value ? Number(target.value) : 0;
    this.percentage.set(val);
    const decimalRate = PercentageConverter.percentageToRate(val);
    this.onChange(decimalRate);
  }

  onBlur(): void {
    this.onTouched();
  }
}
