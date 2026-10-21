import { ChangeDetectionStrategy, Component, computed, input } from "@angular/core";
import type { SlotType } from "@core/type/slot-distribution.type";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucideAccessibility, lucideBike, lucideCar, lucideZap } from "@ng-icons/lucide";

import { SLOT_TYPE_ICONS, SLOT_TYPE_LABELS } from "../../../shared/parking-slot-presentations";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgIcon],
  providers: [
    provideIcons({
      lucideAccessibility,
      lucideBike,
      lucideCar,
      lucideZap,
    }),
  ],
  selector: "app-slot-type-cell",
  standalone: true,
  template: `
    <div class="text-foreground inline-flex items-center gap-1.5 font-medium">
      <ng-icon [name]="icon()" class="text-muted-foreground text-sm" />
      <span>{{ label() }}</span>
    </div>
  `,
})
export class SlotTypeCellComponent {
  readonly type = input.required<SlotType>();

  readonly icon = computed(() => SLOT_TYPE_ICONS[this.type()] ?? "lucideCar");
  readonly label = computed(() => SLOT_TYPE_LABELS[this.type()] ?? this.type());
}
