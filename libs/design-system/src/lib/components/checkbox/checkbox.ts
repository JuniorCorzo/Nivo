import {
  ChangeDetectionStrategy,
  Component,
  computed,
  forwardRef,
  input,
  model,
  output,
  signal,
} from "@angular/core";
import type { ControlValueAccessor } from "@angular/forms";
import { NG_VALUE_ACCESSOR } from "@angular/forms";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: "contents",
  },
  providers: [
    {
      multi: true,
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CheckboxComponent),
    },
  ],
  selector: "nv-checkbox",
  standalone: true,
  template: `
    <label [class]="containerClasses()" (click)="onContainerClick($event)">
      <button
        type="button"
        role="checkbox"
        [id]="id()"
        [name]="name() || null"
        [disabled]="isDisabled()"
        [attr.aria-checked]="indeterminate() ? 'mixed' : checked()"
        [attr.aria-disabled]="isDisabled()"
        [attr.aria-required]="required() || null"
        [class]="boxClasses()"
        (click)="onButtonClick($event)"
        (keydown.space)="onSpaceKeyDown($event)"
        (blur)="onBlur()"
      >
        @if (indeterminate()) {
          <svg
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="3"
            class="h-3.5 w-3.5 shrink-0"
            aria-hidden="true"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M5 12h14" />
          </svg>
        } @else if (checked()) {
          <svg
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="3"
            class="h-3.5 w-3.5 shrink-0"
            aria-hidden="true"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        }
      </button>
      @if (label()) {
        <span class="text-sm font-medium text-[var(--foreground)] select-none">
          {{ label() }}
        </span>
      }
      <ng-content />
    </label>
  `,
})
export class CheckboxComponent implements ControlValueAccessor {
  readonly checked = model<boolean>(false);
  readonly indeterminate = input<boolean>(false);
  readonly disabled = input<boolean>(false);
  readonly required = input<boolean>(false);
  readonly label = input<string>("");
  readonly id = input<string>(`nv-checkbox-${Math.random().toString(36).slice(2)}`);
  readonly name = input<string>("");
  readonly className = input<string>("", { alias: "class" });

  readonly change = output<boolean>();

  private readonly formDisabled = signal(false);
  readonly isDisabled = computed(() => this.disabled() || this.formDisabled());

  private onModelChange?: (value: boolean) => void;
  private onModelTouched?: () => void;

  readonly boxClasses = computed(() => {
    const base =
      "flex items-center justify-center h-4 w-4 shrink-0 rounded border transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:outline-none";
    const state =
      this.checked() || this.indeterminate()
        ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
        : "border-[var(--border)] bg-transparent hover:border-[var(--primary)]/60";
    const disabled = this.isDisabled() ? "opacity-50 cursor-not-allowed pointer-events-none" : "";

    return `${base} ${state} ${disabled}`.trim();
  });

  readonly containerClasses = computed(() => {
    const base = "inline-flex items-center gap-2";
    const disabled = this.isDisabled() ? "cursor-not-allowed opacity-50" : "cursor-pointer";
    const custom = this.className();

    return `${base} ${disabled} ${custom}`.trim();
  });

  toggle(): void {
    if (this.isDisabled()) {
      return;
    }
    const next = !this.checked();
    this.checked.set(next);
    this.change.emit(next);
    this.onModelChange?.(next);
    this.onModelTouched?.();
  }

  onButtonClick(event: MouseEvent): void {
    event.stopPropagation();
    this.toggle();
  }

  onContainerClick(event: MouseEvent): void {
    /* SAFETY: event.target is a DOM Element or null */
    const target = event.target as HTMLElement | null;
    if (target?.closest("a, button")) {
      return;
    }
    event.preventDefault();
    this.toggle();
  }

  onSpaceKeyDown(event: Event): void {
    event.preventDefault();
    this.toggle();
  }

  onBlur(): void {
    this.onModelTouched?.();
  }

  writeValue(value: unknown): void {
    this.checked.set(Boolean(value));
  }

  registerOnChange(fn: (value: boolean) => void): void {
    this.onModelChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onModelTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.formDisabled.set(isDisabled);
  }
}
