import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from "@angular/core";
import type {
  SlotDistribution,
  SlotType,
} from "@core/type/slot-distribution.type";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucidePlus, lucideTrash2, lucideLayers } from "@ng-icons/lucide";
import {
  SelectComponent,
  TypographyH3,
  TypographyMuted,
} from "@nivo-sass/design-system";
import { APP_TEXTS } from "@shared/constants/app-texts.constant";

interface SlotTypeOption {
  value: SlotType;
  label: string;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SelectComponent, TypographyH3, TypographyMuted, NgIcon],
  providers: [provideIcons({ lucideLayers, lucidePlus, lucideTrash2 })],
  selector: "app-parking-slot-groups-section",
  standalone: true,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
  `,
  template: `
    <div class="border-border flex items-center justify-between border-b pb-3">
      <div class="flex items-center gap-2">
        <div
          class="bg-info/10 text-info border-info/20 flex h-8 w-8 items-center justify-center rounded-lg border"
        >
          <ng-icon name="lucideLayers" class="text-base" />
        </div>
        <div>
          <nv-h3 class="text-foreground text-base font-bold">
            {{ APP_TEXTS.parking.form.fields.slots.title }}
          </nv-h3>
          <nv-muted class="text-muted-foreground text-xs">
            {{ APP_TEXTS.parking.form.fields.slots.description }}
          </nv-muted>
        </div>
      </div>

      <button
        type="button"
        (click)="addSlot.emit()"
        class="border-border bg-card text-foreground hover:bg-accent hover:text-accent-foreground inline-flex cursor-pointer items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold shadow-xs transition-colors"
      >
        <ng-icon name="lucidePlus" size="14" />
        <span>{{ APP_TEXTS.parking.form.fields.slots.actions.add }}</span>
      </button>
    </div>

    <div class="mt-1 flex flex-col gap-3.5">
      @for (slot of slots(); track $index) {
        <div
          class="border-border bg-muted/40 rounded-xl border p-4 transition-all"
        >
          <div
            class="border-border flex items-center justify-between gap-3 border-b pb-3"
          >
            <span
              class="text-foreground text-xs font-bold tracking-wider uppercase"
            >
              {{ APP_TEXTS.parking.form.fields.slots.itemLabel }}
              {{ $index + 1 }}
            </span>
            <button
              type="button"
              (click)="removeSlot.emit($index)"
              class="text-destructive inline-flex cursor-pointer items-center gap-1 text-xs font-medium transition-colors hover:opacity-80"
            >
              <ng-icon name="lucideTrash2" size="13" />
              <span>{{
                APP_TEXTS.parking.form.fields.slots.actions.remove
              }}</span>
            </button>
          </div>

          <div
            class="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4"
          >
            <label
              class="text-muted-foreground flex flex-col gap-1 text-xs font-medium"
            >
              <span>{{
                APP_TEXTS.parking.form.fields.slots.prefix.label
              }}</span>
              <input
                class="border-input bg-background text-foreground placeholder:text-muted-foreground focus:border-ring w-full rounded-lg border px-3 py-2 text-xs font-medium focus:outline-hidden"
                type="text"
                [value]="slot.prefix"
                [placeholder]="
                  APP_TEXTS.parking.form.fields.slots.prefix.placeholder
                "
                (input)="
                  emitSlotChange($index, 'prefix', $any($event.target).value)
                "
              />
            </label>

            <label
              class="text-muted-foreground flex flex-col gap-1 text-xs font-medium"
            >
              <span>{{ APP_TEXTS.parking.form.fields.slots.zone.label }}</span>
              <input
                class="border-input bg-background text-foreground placeholder:text-muted-foreground focus:border-ring w-full rounded-lg border px-3 py-2 text-xs font-medium focus:outline-hidden"
                type="text"
                [value]="slot.zone"
                [placeholder]="
                  APP_TEXTS.parking.form.fields.slots.zone.placeholder
                "
                (input)="
                  emitSlotChange($index, 'zone', $any($event.target).value)
                "
              />
            </label>

            <label
              class="text-muted-foreground flex flex-col gap-1 text-xs font-medium"
            >
              <span>{{ APP_TEXTS.parking.form.fields.slots.type.label }}</span>
              <nv-select
                [items]="slotTypeOptions()"
                [displayFn]="displaySlotTypeFn"
                [valueFn]="valueSlotTypeFn"
                [value]="slot.type"
                [placeholder]="
                  APP_TEXTS.parking.form.fields.slots.type.placeholder
                "
                (valueChange)="emitSlotChange($index, 'type', $any($event))"
              />
            </label>

            <label
              class="text-muted-foreground flex flex-col gap-1 text-xs font-medium"
            >
              <span>{{ APP_TEXTS.parking.form.fields.slots.count.label }}</span>
              <input
                class="border-input bg-background text-foreground placeholder:text-muted-foreground focus:border-ring w-full rounded-lg border px-3 py-2 font-mono text-xs font-medium focus:outline-hidden"
                type="number"
                min="0"
                [value]="slot.count"
                [placeholder]="
                  APP_TEXTS.parking.form.fields.slots.count.placeholder
                "
                (input)="emitSlotCountChange($index, $event)"
              />
            </label>
          </div>
        </div>
      }
    </div>
  `,
})
export class ParkingSlotGroupsSectionComponent {
  protected readonly APP_TEXTS = APP_TEXTS;

  readonly slots = input<SlotDistribution[]>([]);
  readonly slotTypeOptions = input<SlotTypeOption[]>([]);

  readonly addSlot = output();
  readonly removeSlot = output<number>();
  readonly slotChange = output<{
    index: number;
    field: keyof SlotDistribution;
    value: SlotDistribution[keyof SlotDistribution];
  }>();

  static displaySlotTypeFn(item: SlotTypeOption): string {
    return item.label;
  }

  static valueSlotTypeFn(item: SlotTypeOption): string {
    return item.value;
  }

  readonly displaySlotTypeFn =
    ParkingSlotGroupsSectionComponent.displaySlotTypeFn;
  readonly valueSlotTypeFn = ParkingSlotGroupsSectionComponent.valueSlotTypeFn;

  emitSlotChange<K extends keyof SlotDistribution>(
    index: number,
    field: K,
    value: SlotDistribution[K]
  ): void {
    this.slotChange.emit({ field, index, value });
  }

  emitSlotCountChange(index: number, event: Event): void {
    /* SAFETY: event.target is guaranteed to be an HTMLInputElement for change/input events */
    const value = Number((event.target as HTMLInputElement).value);
    this.slotChange.emit({
      field: "count",
      index,
      value: Number.isNaN(value) ? 0 : value,
    });
  }
}
