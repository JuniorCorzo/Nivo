import {
  Component,
  input,
  computed,
  ChangeDetectionStrategy,
  forwardRef,
  signal,
  effect,
} from "@angular/core";

import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
} from "@angular/forms";
import { ValidationError } from "@angular/forms/signals";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucideEye, lucideEyeClosed } from "@ng-icons/lucide";

@Component({
  selector: "nv-input",
  standalone: true,
  imports: [NgIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    provideIcons({ lucideEye, lucideEyeClosed }),
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true,
    },
  ],
  styles: `
    input::placeholder {
      color: var(--muted-foreground);
      opacity: 1;
    }
  `,
  template: `
    <div class="flex flex-col gap-1.5">
      @if (label()) {
        <label
          [for]="id()"
          class="text-sm font-medium text-(--foreground) font-sans"
        >
          {{ label() }}
          @if (required()) {
            <span class="text-(--destructive) ml-0.5" aria-hidden="true">*</span>
          }
        </label>
      }
      <div class="relative">
        <div class="relative">
          @if (startIcon()) {
            <ng-icon
              [name]="startIcon()!"
              size="16"
              class="absolute left-3 top-1/2 -translate-y-1/2 text-(--muted-foreground) pointer-events-none"
              aria-hidden="true"
            />
          }
          <input
            [id]="id()"
            [attr.aria-describedby]="ariaDescribedBy()"
            [type]="actualType()"
            [placeholder]="placeholder()"
            [disabled]="disabled()"
            [value]="value()"
            (input)="onInput($event)"
            (blur)="onTouched()"
            [class]="classes()"
          />
          @if (type() === "password") {
            <button
              type="button"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-(--muted-foreground) hover:text-(--foreground) transition-colors"
              (click)="togglePasswordVisibility()"
            >
              <ng-icon
                [name]="showPassword() ? 'lucideEyeClosed' : 'lucideEye'"
                size="16"
              />
            </button>
          }
        </div>
      </div>
      @if (hasErrors()) {
        <ul
          class="text-xs text-(--destructive) font-sans space-y-1 mt-1"
          aria-live="polite"
          role="alert"
          [id]="ariaDescribedBy()"
        >
          @for (err of error(); track $index) {
            <li>
              {{ err.message }}
            </li>
          }
        </ul>
      }
      @if (hint() && !hasErrors()) {
        <p class="text-xs text-(--muted-foreground) font-sans">
          {{ hint() }}
        </p>
      }
    </div>
  `,
})
export class InputComponent implements ControlValueAccessor {
  readonly id = input<string>(
    `nv-input-${Math.random().toString(36).slice(2)}`,
  );
  readonly ariaDescribedBy = computed(() => `${this.id()}-error`);
  readonly label = input<string>("");
  readonly required = input<boolean>(false);
  readonly type = input<string>("text");
  readonly placeholder = input<string>("");
  readonly disabled = input<boolean>(false);
  readonly startIcon = input<string | undefined>(undefined);
  readonly error = input<ValidationError.WithFieldTree[] | undefined>(
    undefined,
  );
  readonly hint = input<string>("");
  readonly hasErrors = computed(() => (this.error()?.length ?? 0) > 0);

  readonly showPassword = signal(false);
  readonly actualType = computed(() =>
    this.type() === "password" && this.showPassword() ? "text" : this.type(),
  );

  readonly value = signal("");
  readonly initialValue = input<string>("", { alias: "value" });

  onChange: (value: string) => void = () => {};
  onTouched: () => void = () => {};

  constructor() {
    effect(() => {
      const val = this.initialValue();
      if (val) {
        this.value.set(val);
      }
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword.update((v) => !v);
  }

  onInput(event: Event): void {
    this.value.set((event.target as HTMLInputElement).value);
    this.onChange(this.value());
  }

  readonly classes = computed(() => {
    const base =
      "flex h-10 w-full rounded-md border bg-transparent px-3 py-2 text-sm font-sans transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--ring)] disabled:cursor-not-allowed disabled:opacity-50";
    const errorClass = this.hasErrors()
      ? "border-[var(--destructive)]"
      : "border-[var(--input)]";
    const startIconClass = this.startIcon() ? "pl-9" : "";
    const passwordClass = this.type() === "password" ? "pr-10" : "";

    return `${base} ${errorClass} ${startIconClass} ${passwordClass} text-[var(--foreground)]`;
  });

  writeValue(value: string): void {
    this.value.set(value ?? "");
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
}
