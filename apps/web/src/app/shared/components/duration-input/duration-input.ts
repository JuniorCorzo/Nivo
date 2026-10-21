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
import { InputComponent, SelectComponent } from "@nivo-sass/design-system";

import type { DurationOption, DurationUnit } from "../../utils/duration.utils";
import {
  DURATION_UNIT_OPTIONS,
  DurationConverter,
} from "../../utils/duration.utils";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [InputComponent, SelectComponent],
  providers: [
    {
      multi: true,
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DurationInputComponent),
    },
  ],
  selector: "app-duration-input",
  standalone: true,
  template: `
    <div class="flex flex-col gap-1.5">
      <div class="grid grid-cols-3 gap-2">
        <div class="col-span-2">
          <nv-input
            [id]="id() + '-amount'"
            type="number"
            [label]="label()"
            [placeholder]="placeholder()"
            [value]="amount().toString()"
            [disabled]="disabled()"
            [error]="normalizedError()"
            (input)="onAmountInput($event)"
            (blur)="onBlur()"
          />
        </div>
        <div class="col-span-1">
          <nv-select
            [id]="id() + '-unit'"
            label="Unidad"
            [items]="unitOptions"
            [displayFn]="displayUnitFn"
            [valueFn]="valueUnitFn"
            [value]="unit()"
            [disabled]="disabled()"
            (valueChange)="onUnitChange($event)"
            (blur)="onBlur()"
          />
        </div>
      </div>
    </div>
  `,
})
export class DurationInputComponent implements ControlValueAccessor {
  readonly id = input<string>("duration-input");
  readonly label = input<string>("Tiempo de gracia");
  readonly placeholder = input<string>("0");
  readonly error = input<
    string | ValidationError.WithFieldTree[] | undefined
  >();

  readonly amount = signal<number>(0);
  readonly unit = signal<DurationUnit>("MINUTES");
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

  readonly unitOptions: DurationOption[] = [...DURATION_UNIT_OPTIONS];
  readonly displayUnitFn = (opt: DurationOption): string => opt.label;
  readonly valueUnitFn = (opt: DurationOption): string => opt.value;

  private onChange: (value: number) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: number | null | undefined): void {
    const parsed = DurationConverter.fromMinutes(value ?? 0);
    this.amount.set(parsed.amount);
    this.unit.set(parsed.unit);
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

  onAmountInput(event: Event): void {
    const target = event.target as HTMLInputElement | null;
    const val = target?.value ? Number(target.value) : 0;
    this.onAmountChange(val);
  }

  onAmountChange(amount: number): void {
    this.amount.set(amount);
    this.notifyChange();
  }

  onUnitChange(unit: string): void {
    if (unit === "MINUTES" || unit === "HOURS" || unit === "DAYS") {
      this.unit.set(unit);
      this.notifyChange();
    }
  }

  onBlur(): void {
    this.onTouched();
  }

  private notifyChange(): void {
    const totalMinutes = DurationConverter.toMinutes(
      this.amount(),
      this.unit()
    );
    this.onChange(totalMinutes);
  }
}
