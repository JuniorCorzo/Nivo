import {
  afterRenderEffect,
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  forwardRef,
  input,
  OnDestroy,
  output,
  signal,
  viewChild,
  viewChildren,
} from "@angular/core";
import {
  Combobox as AriaCombobox,
  ComboboxInput,
  ComboboxPopupContainer,
} from "@angular/aria/combobox";
import {
  Listbox as AriaListbox,
  Option as AriaOption,
} from "@angular/aria/listbox";
import { OverlayModule } from "@angular/cdk/overlay";

import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import { ValidationError } from "@angular/forms/signals";

@Component({
  selector: "nv-combobox",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AriaCombobox,
    ComboboxInput,
    ComboboxPopupContainer,
    AriaListbox,
    AriaOption,
    OverlayModule,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ComboboxComponent),
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
      <div ngCombobox filterMode="manual" [disabled]="isDisabled()">
        <div #origin class="relative">
          <input
            [id]="id()"
            type="text"
            ngComboboxInput
            [placeholder]="placeholder()"
            [disabled]="isDisabled()"
            [value]="searchText()"
            (valueChange)="onSearchValueChange($event)"
            (blur)="onBlur()"
            (keydown)="onKeydown($event)"
            [class]="inputClasses()"
          />
        </div>

        <ng-template ngComboboxPopupContainer>
          @if (isOpen()) {
            <ng-template
              [cdkConnectedOverlay]="{
                origin,
                usePopover: 'inline',
                matchWidth: true,
              }"
              [cdkConnectedOverlayOpen]="true"
            >
              <div
                class="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-(--input) bg-(--popover) text-(--popover-foreground) shadow-md"
              >
                @if (loading()) {
                  <div class="px-3 py-2 text-sm text-(--muted-foreground)">
                    Cargando...
                  </div>
                } @else if (hasErrors()) {
                  <ul
                    class="space-y-1 px-3 py-2 text-sm text-(--destructive)"
                    aria-live="polite"
                    role="alert"
                  >
                    @for (message of errorMessages(); track $index) {
                      <li>{{ message }}</li>
                    }
                  </ul>
                } @else if (filteredItems().length === 0) {
                  <div class="px-3 py-2 text-sm text-(--muted-foreground)">
                    Sin resultados
                  </div>
                } @else {
                  <div ngListbox selectionMode="follow">
                    @for (item of filteredItems(); track $index) {
                      <div
                        ngOption
                        [value]="item"
                        [label]="displayFn()(item)"
                        class="cursor-pointer px-3 py-2 text-sm font-sans transition-colors hover:bg-accent hover:text-accent-foreground data-[active=true]:bg-accent data-[active=true]:text-accent-foreground aria-selected:bg-accent aria-selected:text-accent-foreground"
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
        </ng-template>
      </div>
      @if (hasErrors() && !isOpen()) {
        <ul
          class="text-xs text-(--destructive) font-sans space-y-1 mt-1"
          aria-live="polite"
          role="alert"
        >
          @for (message of errorMessages(); track $index) {
            <li>
              {{ message }}
            </li>
          }
        </ul>
      }
    </div>
  `,
})
export class ComboboxComponent implements ControlValueAccessor, OnDestroy {
  // --- Public inputs ---
  readonly id = input<string>(
    `nv-combobox-${Math.random().toString(36).slice(2)}`,
  );
  readonly label = input<string>("");
  readonly required = input<boolean>(false);
  readonly placeholder = input<string>("");
  readonly items = input<unknown[]>([]);
  readonly displayFn = input<(item: unknown) => string>((item: unknown) =>
    String(item),
  );
  readonly filterFn = input<
    ((item: unknown, query: string) => boolean) | undefined
  >(undefined);
  readonly loading = input<boolean>(false);
  readonly error = input<string | ValidationError.WithFieldTree[] | undefined>(
    undefined,
  );
  readonly disabled = input<boolean>(false);
  readonly debounceMs = input<number>(300);

  readonly errorMessages = computed(() => {
    const error = this.error();

    if (!error) {
      return [];
    }

    if (typeof error === "string") {
      return [error];
    }

    return error.map((item) => item.message);
  });

  readonly hasErrors = computed(() => this.errorMessages().length > 0);

  // --- Output ---
  readonly selectionChange = output<unknown>();

  // --- Internal state ---
  readonly searchText = signal("");
  private formDisabled = signal(false);
  private debounceTimer: ReturnType<typeof setTimeout> | undefined;
  private readonly debouncedSearchText = signal("");
  private readonly combobox = viewChild<AriaCombobox<unknown>>(AriaCombobox);
  private readonly listbox = viewChild<AriaListbox<unknown>>(AriaListbox);
  private readonly options = viewChildren<AriaOption<unknown>>(AriaOption);

  // --- CVA callbacks ---
  onChange: (value: string) => void = () => {};
  onTouched: () => void = () => {};

  // --- Computed ---
  readonly isDisabled = computed(() => this.disabled() || this.formDisabled());

  readonly isOpen = computed(() => this.combobox()?.expanded() ?? false);

  readonly filteredItems = computed(() => {
    const query = this.debouncedSearchText();
    const items = this.items();
    if (!query) return items;
    const customFilter = this.filterFn();
    if (customFilter) {
      return items.filter((item) => customFilter(item, query));
    }
    return items.filter((item) => {
      const display = this.displayFn()(item).toLowerCase();
      return display.includes(query.toLowerCase());
    });
  });

  readonly inputClasses = computed(() => {
    const base =
      "flex h-10 w-full rounded-md border bg-transparent px-3 py-2 text-sm font-sans transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--ring)] disabled:cursor-not-allowed disabled:opacity-50";
    const border =
      this.hasErrors() && !this.isOpen()
        ? "border-[var(--destructive)]"
        : "border-[var(--input)]";
    return `${base} ${border} text-[var(--foreground)]`;
  });

  constructor() {
    effect(() => {
      if (this.isDisabled()) {
        this.combobox()?.close();
      }
    });

    afterRenderEffect(() => {
      const activeOption = this.options().find((option) => option.active());
      setTimeout(
        () => activeOption?.element.scrollIntoView({ block: "nearest" }),
        50,
      );
    });

    afterRenderEffect(() => {
      if (!this.isOpen()) {
        setTimeout(() => this.listbox()?.element.scrollTo(0, 0), 150);
      }
    });
  }

  // --- Public methods ---
  onSearchValueChange(value: string): void {
    if (this.isDisabled()) {
      return;
    }

    this.searchText.set(value);
    this.onChange(value);

    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    const ms = this.debounceMs();

    if (ms <= 0) {
      this.debouncedSearchText.set(value);
    } else {
      this.debounceTimer = setTimeout(() => {
        this.debouncedSearchText.set(value);
      }, ms);
    }
  }

  onBlur(): void {
    this.onTouched();
  }

  onKeydown(event: KeyboardEvent): void {
    if (this.isDisabled() || event.key !== "Enter") {
      return;
    }

    const item = this.getActiveOrSelectedItem();
    if (item === undefined) {
      return;
    }

    event.preventDefault();
    this.selectItem(item);
  }

  onOptionMouseDown(event: MouseEvent, item: unknown): void {
    if (this.isDisabled()) {
      return;
    }

    event.preventDefault();
    this.selectItem(item);
  }

  selectItem(item: unknown): void {
    if (this.isDisabled()) {
      return;
    }

    const displayText = this.displayFn()(item);
    this.searchText.set(displayText);
    this.debouncedSearchText.set(displayText);
    this.onChange(displayText);
    this.selectionChange.emit(item);
    this.combobox()?.close();
  }

  private getActiveOrSelectedItem(): unknown | undefined {
    const index = this.options().findIndex(
      (option) => option.active() || option.selected(),
    );

    return index >= 0 ? this.filteredItems()[index] : undefined;
  }

  // --- CVA ---
  writeValue(value: string): void {
    this.searchText.set(value ?? "");
    this.debouncedSearchText.set(value ?? "");
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

  ngOnDestroy(): void {
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
  }
}
