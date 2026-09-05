import { Component, input, output } from "@angular/core";
import type { SlotSummary } from "@core/models/slot.model";
import { NgIcon, provideIcons } from "@ng-icons/core";
import {
  lucideX,
  lucideInbox,
  lucideCar,
  lucideBike,
  lucideMapPin,
  lucideLayers,
} from "@ng-icons/lucide";
import { TypographyH3, TypographyMuted } from "@nivo-sass/design-system";

import type { DrawerTab } from "../parking-slots-list/parking-slots-list.facade";
import { getHistoryCopy } from "../parking-slots-list/parking-slots-list.facade";

@Component({
  imports: [TypographyH3, TypographyMuted, NgIcon],
  providers: [
    provideIcons({
      lucideBike,
      lucideCar,
      lucideInbox,
      lucideLayers,
      lucideMapPin,
      lucideX,
    }),
  ],
  selector: "app-slot-detail-drawer",
  standalone: true,
  styleUrl: "./slot-detail-drawer.css",
  templateUrl: "./slot-detail-drawer.html",
})
export class SlotDetailDrawer {
  readonly slot = input.required<SlotSummary>();
  readonly drawerTab = input.required<DrawerTab>();
  readonly slotTypeLabel = input.required<Record<string, string>>();

  readonly close = output();
  readonly setTab = output<DrawerTab>();

  protected readonly getHistoryCopy = getHistoryCopy;
}
