import { Component, input, output } from '@angular/core';

import { APP_TEXTS } from '@shared/constants/app-texts.constant';
import { SlotDistribution, SlotType } from '@core/type/slot-distribution.type';
import { ButtonComponent, SelectComponent, TypographyH3 } from '@nivo-sass/design-system';

type SlotTypeOption = { value: SlotType; label: string };

@Component({
  selector: 'app-parking-slot-groups-section',
  standalone: true,
  imports: [ButtonComponent, SelectComponent, TypographyH3],
  template: `
    <nv-h3 class="text-base">{{ APP_TEXTS.parking.form.fields.slots.title }}</nv-h3>
    <p class="text-sm text-muted-foreground">
      {{ APP_TEXTS.parking.form.fields.slots.description }}
    </p>

    <div class="flex flex-col gap-4">
      @for (slot of slots(); track $index) {
        <div class="slot-card">
          <div class="flex items-center justify-between gap-3">
            <nv-h3 class="text-sm"
              >{{ APP_TEXTS.parking.form.fields.slots.itemLabel }} {{ $index + 1 }}</nv-h3
            >
            <nv-button variant="outline" size="sm" (click)="removeSlot.emit($index)">
              {{ APP_TEXTS.parking.form.fields.slots.actions.remove }}
            </nv-button>
          </div>

          <div class="form-row">
            <label class="slot-field">
              <span>{{ APP_TEXTS.parking.form.fields.slots.prefix.label }}</span>
              <input
                class="slot-input"
                type="text"
                [value]="slot.prefix"
                [placeholder]="APP_TEXTS.parking.form.fields.slots.prefix.placeholder"
                (input)="emitSlotChange($index, 'prefix', $any($event.target).value)"
              />
            </label>

            <label class="slot-field">
              <span>{{ APP_TEXTS.parking.form.fields.slots.zone.label }}</span>
              <input
                class="slot-input"
                type="text"
                [value]="slot.zone"
                [placeholder]="APP_TEXTS.parking.form.fields.slots.zone.placeholder"
                (input)="emitSlotChange($index, 'zone', $any($event.target).value)"
              />
            </label>
          </div>

          <div class="form-row">
            <label class="slot-field">
              <span>{{ APP_TEXTS.parking.form.fields.slots.type.label }}</span>
              <nv-select
                [items]="slotTypeOptions()"
                [displayFn]="displaySlotTypeFn"
                [valueFn]="valueSlotTypeFn"
                [value]="slot.type"
                [placeholder]="APP_TEXTS.parking.form.fields.slots.type.placeholder"
                (valueChange)="emitSlotChange($index, 'type', $any($event))"
              >
              </nv-select>
            </label>

            <label class="slot-field">
              <span>{{ APP_TEXTS.parking.form.fields.slots.count.label }}</span>
              <input
                class="slot-input"
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

      <div class="flex justify-start">
        <nv-button variant="outline" size="sm" (click)="addSlot.emit()">
          {{ APP_TEXTS.parking.form.fields.slots.actions.add }}
        </nv-button>
      </div>
    </div>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .slot-card {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      padding: 1rem;
      border: 1px solid var(--color-border);
      border-radius: 0.5rem;
      background-color: color-mix(in srgb, var(--color-muted) 18%, transparent);
    }

    .slot-field {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--color-foreground);
    }

    .slot-input {
      display: flex;
      height: 2.5rem;
      width: 100%;
      border-radius: 0.375rem;
      border: 1px solid var(--color-input);
      background: transparent;
      padding: 0.5rem 0.75rem;
      font-size: 0.875rem;
      color: var(--color-foreground);
    }

    .slot-input:focus-visible {
      outline: none;
      box-shadow: 0 0 0 1px var(--color-ring);
    }

    .form-row {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
    }

    @media (max-width: 640px) {
      .form-row {
        grid-template-columns: 1fr;
      }
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
