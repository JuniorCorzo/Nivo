import { Component, input, output } from '@angular/core';

import { APP_TEXTS } from '@shared/constants/app-texts.constant';
import { SlotDistribution, SlotType } from '@core/type/slot-distribution.type';
import { SelectComponent, TypographyH3, TypographyMuted } from '@nivo-sass/design-system';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucidePlus, lucideTrash2, lucideLayers } from '@ng-icons/lucide';

type SlotTypeOption = { value: SlotType; label: string };

@Component({
  selector: 'app-parking-slot-groups-section',
  standalone: true,
  imports: [SelectComponent, TypographyH3, TypographyMuted, NgIcon],
  providers: [provideIcons({ lucidePlus, lucideTrash2, lucideLayers })],
  template: `
    <div class="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
      <div class="flex items-center gap-2">
        <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
          <ng-icon name="lucideLayers" class="text-base" />
        </div>
        <div>
          <nv-h3 class="text-base font-bold text-neutral-900 dark:text-neutral-100">
            {{ APP_TEXTS.parking.form.fields.slots.title }}
          </nv-h3>
          <nv-muted class="text-xs text-neutral-500 dark:text-neutral-400">
            {{ APP_TEXTS.parking.form.fields.slots.description }}
          </nv-muted>
        </div>
      </div>

      <button
        type="button"
        (click)="addSlot.emit()"
        class="inline-flex items-center gap-1.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-1.5 text-xs font-semibold text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-750 transition-colors shadow-xs"
      >
        <ng-icon name="lucidePlus" size="14" />
        <span>{{ APP_TEXTS.parking.form.fields.slots.actions.add }}</span>
      </button>
    </div>

    <div class="flex flex-col gap-3.5 mt-1">
      @for (slot of slots(); track $index) {
        <div class="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-850 p-4 transition-all">
          <div class="flex items-center justify-between gap-3 pb-3 border-b border-neutral-200/60 dark:border-neutral-800">
            <span class="text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
              {{ APP_TEXTS.parking.form.fields.slots.itemLabel }} {{ $index + 1 }}
            </span>
            <button
              type="button"
              (click)="removeSlot.emit($index)"
              class="inline-flex items-center gap-1 text-xs font-medium text-red-600 dark:text-red-400 hover:text-red-700 transition-colors"
            >
              <ng-icon name="lucideTrash2" size="13" />
              <span>{{ APP_TEXTS.parking.form.fields.slots.actions.remove }}</span>
            </button>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mt-3">
            <label class="flex flex-col gap-1 text-xs font-medium text-neutral-700 dark:text-neutral-300">
              <span>{{ APP_TEXTS.parking.form.fields.slots.prefix.label }}</span>
              <input
                class="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-xs font-medium text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:border-primary-500 focus:outline-hidden"
                type="text"
                [value]="slot.prefix"
                [placeholder]="APP_TEXTS.parking.form.fields.slots.prefix.placeholder"
                (input)="emitSlotChange($index, 'prefix', $any($event.target).value)"
              />
            </label>

            <label class="flex flex-col gap-1 text-xs font-medium text-neutral-700 dark:text-neutral-300">
              <span>{{ APP_TEXTS.parking.form.fields.slots.zone.label }}</span>
              <input
                class="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-xs font-medium text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:border-primary-500 focus:outline-hidden"
                type="text"
                [value]="slot.zone"
                [placeholder]="APP_TEXTS.parking.form.fields.slots.zone.placeholder"
                (input)="emitSlotChange($index, 'zone', $any($event.target).value)"
              />
            </label>

            <label class="flex flex-col gap-1 text-xs font-medium text-neutral-700 dark:text-neutral-300">
              <span>{{ APP_TEXTS.parking.form.fields.slots.type.label }}</span>
              <nv-select
                [items]="slotTypeOptions()"
                [displayFn]="displaySlotTypeFn"
                [valueFn]="valueSlotTypeFn"
                [value]="slot.type"
                [placeholder]="APP_TEXTS.parking.form.fields.slots.type.placeholder"
                (valueChange)="emitSlotChange($index, 'type', $any($event))"
              />
            </label>

            <label class="flex flex-col gap-1 text-xs font-medium text-neutral-700 dark:text-neutral-300">
              <span>{{ APP_TEXTS.parking.form.fields.slots.count.label }}</span>
              <input
                class="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-xs font-mono font-medium text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:border-primary-500 focus:outline-hidden"
                type="number"
                min="0"
                [value]="slot.count"
                [placeholder]="APP_TEXTS.parking.form.fields.slots.count.placeholder"
                (input)="emitSlotCountChange($index, $event)"
              />
            </label>
          </div>
        </div>
      }
    </div>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
  `,
})
export class ParkingSlotGroupsSectionComponent {
  protected readonly APP_TEXTS = APP_TEXTS;

  readonly slots = input<SlotDistribution[]>([]);
  readonly slotTypeOptions = input<SlotTypeOption[]>([]);

  readonly addSlot = output<void>();
  readonly removeSlot = output<number>();
  readonly slotChange = output<{
    index: number;
    field: keyof SlotDistribution;
    value: SlotDistribution[keyof SlotDistribution];
  }>();

  readonly displaySlotTypeFn = (item: unknown): string =>
    (item as { label?: string }).label ?? String(item);
  readonly valueSlotTypeFn = (item: unknown): string =>
    (item as { value?: string }).value ?? String(item);

  emitSlotChange<K extends keyof SlotDistribution>(
    index: number,
    field: K,
    value: SlotDistribution[K],
  ): void {
    this.slotChange.emit({ index, field, value });
  }

  emitSlotCountChange(index: number, event: Event): void {
    const value = Number((event.target as HTMLInputElement).value);
    this.slotChange.emit({
      index,
      field: 'count',
      value: Number.isNaN(value) ? 0 : value,
    });
  }
}
