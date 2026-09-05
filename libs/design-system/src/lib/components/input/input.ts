import {
  Component,
  input,
  computed,
  ChangeDetectionStrategy,
  forwardRef,
  signal,
  effect,
} from "@angular/core";
import type { ControlValueAccessor } from "@angular/forms";
import { NG_VALUE_ACCESSOR } from "@angular/forms";
import type { ValidationError } from "@angular/forms/signals";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucideEye, lucideEyeClosed } from "@ng-icons/lucide";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgIcon],
  providers: [
    provideIcons({ lucideEye, lucideEyeClosed }),
    {
      multi: true,
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
    },
  ],
  selector: "nv-input",
  standalone: true,
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
          class="font-sans text-sm font-medium text-(--foreground)"
        >
          {{ label() }}
          @if (required()) {
            <span class="ml-0.5 text-(--destructive)" aria-hidden="true"
              >*</span
            >
          }
        </label>
      }
      <div class="relative">
        <div class="relative">
          @if (startIcon()) {
            <ng-icon
              [name]="startIcon()!"
              size="16"
              class="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-(--muted-foreground)"
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
            (blur)="onBlur()"
            [class]="classes()"
          />
          @if (type() === "password") {
            <button
              type="button"
              class="absolute top-1/2 right-3 -translate-y-1/2 text-(--muted-foreground) transition-colors hover:text-(--foreground)"
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
          class="mt-1 space-y-1 font-sans text-xs text-(--destructive)"
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
        <p class="font-sans text-xs text-(--muted-foreground)">
          {{ hint() }}
        </p>
      }
    </div>
  `,
})
export class InputComponent implements ControlValueAccessor {
  readonly id = input<string>(
    `nv-input-${Math.random().toString(36).slice(2)}`
  );
  readonly ariaDescribedBy = computed(() => `${this.id()}-error`);
  readonly label = input<string>("");
  readonly required = input<boolean>(false);
  readonly type = input<string>("text");
  readonly placeholder = input<string>("");
  readonly disabled = input<boolean>(false);
  readonly startIcon = input<string | undefined>();
  readonly error = input<ValidationError.WithFieldTree[] | undefined>();
  readonly hint = input<string>("");
  readonly hasErrors = computed(() => (this.error()?.length ?? 0) > 0);

  readonly showPassword = signal(false);
  readonly actualType = computed(() =>
    this.type() === "password" && this.showPassword() ? "text" : this.type()
  );

  readonly value = signal("");
  readonly initialValue = input<string>("", { alias: "value" });

  private onModelChange?: (value: string) => void;
  private onModelTouched?: () => void;

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

  onBlur(): void {
    this.onModelTouched?.();
  }

  onInput(event: Event): void {
    /* SAFETY: event.target is guaranteed to be an HTMLInputElement for this input element */
    const target = event.target as HTMLInputElement;
    this.value.set(target.value);
    this.onModelChange?.(this.value());
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
    this.onModelChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onModelTouched = fn;
  }
}
