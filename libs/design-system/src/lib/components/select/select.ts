import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  effect,
  forwardRef,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { ConnectedPosition, OverlayModule } from '@angular/cdk/overlay';
import { Listbox as AriaListbox, Option as AriaOption } from '@angular/aria/listbox';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ValidationError } from '@angular/forms/signals';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideChevronDown } from '@ng-icons/lucide';

@Component({
  selector: 'nv-select',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [OverlayModule, AriaListbox, AriaOption, NgIcon],
  providers: [
    provideIcons({ lucideChevronDown }),
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectComponent),
      multi: true,
    },
  ],
  template: `
    <div class="flex flex-col gap-1.5">
      @if (label()) {
        <label [for]="id()" class="text-sm font-medium text-(--foreground) font-sans">
          {{ label() }}
          @if (required()) {
            <span class="text-(--destructive) ml-0.5" aria-hidden="true">*</span>
          }
        </label>
      }

      <div #origin class="relative">
        <button
          [id]="id()"
          type="button"
          [disabled]="isDisabled()"
          [attr.aria-expanded]="isOpen()"
          aria-haspopup="listbox"
          [class]="triggerClasses()"
          (click)="toggleOpen()"
          (blur)="onBlur()"
          (keydown)="onTriggerKeydown($event)"
        >
          <span [class]="valueClasses()">
            {{ triggerText() }}
          </span>
          <ng-icon name="lucideChevronDown" size="16" class="text-(--muted-foreground)" />
        </button>

        @if (isOpen()) {
          <ng-template
            cdkConnectedOverlay
            [cdkConnectedOverlayOrigin]="origin"
            [cdkConnectedOverlayOpen]="true"
            [cdkConnectedOverlayPositions]="overlayPositions"
            (overlayOutsideClick)="close()"
            (detach)="close()"
          >
            <div
              [style.width.px]="overlayWidth()"
              class="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-(--input) bg-(--popover) text-(--popover-foreground) shadow-md"
            >
              @if (hasErrors()) {
                <ul
                  class="space-y-1 px-3 py-2 text-sm text-(--destructive)"
                  aria-live="polite"
                  role="alert"
                >
                  @for (message of errorMessages(); track $index) {
                    <li>{{ message }}</li>
                  }
                </ul>
              } @else if (items().length === 0) {
                <div class="px-3 py-2 text-sm text-(--muted-foreground)">Sin opciones</div>
              } @else {
                <div ngListbox selectionMode="follow">
                  @for (item of items(); track $index) {
                    <div
                      ngOption
                      [value]="item"
                      [label]="displayFn()(item)"
                      [class]="optionClasses(item)"
                      (mousedown)="onOptionMouseDown($event, item)"
                    >
                      {{ displayFn()(item) }}
                    </div>
                  }
                </div>
              }
            </div>
          </ng-template>
        }
      </div>

      @if (hasErrors() && !isOpen()) {
        <ul
          class="text-xs text-(--destructive) font-sans space-y-1 mt-1"
          aria-live="polite"
          role="alert"
        >
          @for (message of errorMessages(); track $index) {
            <li>{{ message }}</li>
          }
        </ul>
      }
    </div>
  `,
})
export class SelectComponent implements ControlValueAccessor {
  readonly id = input<string>(`nv-select-${Math.random().toString(36).slice(2)}`);
  readonly label = input<string>('');
  readonly required = input<boolean>(false);
  readonly placeholder = input<string>('Selecciona una opción');
  readonly items = input<unknown[]>([]);
  readonly displayFn = input<(item: unknown) => string>((item: unknown) => String(item));
  readonly valueFn = input<(item: unknown) => string>((item: unknown) => String(item));
  readonly error = input<string | ValidationError.WithFieldTree[] | undefined>(undefined);
  readonly disabled = input<boolean>(false);
  readonly value = input<string | undefined>(undefined);

  readonly selectionChange = output<unknown>();
  readonly valueChange = output<string>();

  readonly isOpen = signal(false);
  private readonly internalValue = signal('');
  private readonly formDisabled = signal(false);
  private readonly originElement = viewChild<ElementRef<HTMLElement>>('origin');
  private readonly listbox = viewChild<AriaListbox<unknown>>(AriaListbox);

  readonly overlayPositions: ConnectedPosition[] = [
    {
      originX: 'start',
      originY: 'bottom',
      overlayX: 'start',
      overlayY: 'top',
    },
    {
      originX: 'start',
      originY: 'top',
      overlayX: 'start',
      overlayY: 'bottom',
    },
  ];

  readonly errorMessages = computed(() => {
    const error = this.error();
    if (!error) return [];
    if (typeof error === 'string') return [error];
    return error.map((item) => item.message);
  });

  readonly hasErrors = computed(() => this.errorMessages().length > 0);
  readonly isDisabled = computed(() => this.disabled() || this.formDisabled());
  readonly selectedItem = computed(() =>
    this.items().find((item) => this.valueFn()(item) === this.internalValue()),
  );
  readonly triggerText = computed(() => {
    const selected = this.selectedItem();
    return selected ? this.displayFn()(selected) : this.placeholder();
  });
  readonly overlayWidth = computed(() => this.originElement()?.nativeElement.offsetWidth ?? 0);

  readonly triggerClasses = computed(() => {
    const base =
      'flex h-10 w-full items-center justify-between rounded-md border bg-transparent px-3 py-2 text-sm font-sans transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--ring)] disabled:cursor-not-allowed disabled:opacity-50';
    const border =
      this.hasErrors() && !this.isOpen() ? 'border-[var(--destructive)]' : 'border-[var(--input)]';
    return `${base} ${border} text-[var(--foreground)]`;
  });

  readonly valueClasses = computed(() =>
    this.selectedItem() ? 'text-[var(--foreground)]' : 'text-(--muted-foreground)',
  );

  onChange: (value: string) => void = () => {};
  onTouched: () => void = () => {};

  constructor() {
    effect(() => {
      const value = this.value();
      if (value !== undefined) {
        this.internalValue.set(value);
      }
    });

    effect(() => {
      if (this.isDisabled()) {
        this.close();
      }
    });
  }

  toggleOpen(): void {
    if (this.isDisabled()) return;
    this.isOpen.update((current) => !current);
  }

  close(): void {
    this.isOpen.set(false);
  }

  onBlur(): void {
    this.onTouched();
  }

  onTriggerKeydown(event: KeyboardEvent): void {
    if (this.isDisabled()) return;

    if (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowDown') {
      event.preventDefault();
      this.isOpen.set(true);
      setTimeout(() => this.listbox()?.element.focus(), 0);
    }

    if (event.key === 'Escape') {
      this.close();
    }
  }

  onOptionMouseDown(event: MouseEvent, item: unknown): void {
    if (this.isDisabled()) return;
    event.preventDefault();
    this.selectItem(item);
  }

  selectItem(item: unknown): void {
    if (this.isDisabled()) return;

    const value = this.valueFn()(item);
    this.internalValue.set(value);
    this.onChange(value);
    this.valueChange.emit(value);
    this.selectionChange.emit(item);
    this.close();
  }

  optionClasses(item: unknown): string {
    const selected = this.valueFn()(item) === this.internalValue();
    const selectedClasses = selected ? 'bg-accent text-accent-foreground' : '';
    return `cursor-pointer px-3 py-2 text-sm font-sans transition-colors hover:bg-accent hover:text-accent-foreground data-[active=true]:bg-accent data-[active=true]:text-accent-foreground ${selectedClasses}`;
  }

  writeValue(value: string): void {
    this.internalValue.set(value ?? '');
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.formDisabled.set(isDisabled);
  }
}
