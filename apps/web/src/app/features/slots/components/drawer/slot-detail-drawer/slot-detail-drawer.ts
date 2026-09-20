import { ChangeDetectionStrategy, Component, input, output } from "@angular/core";
import type { SlotSummary } from "@core/models/slot.model";
import { NgIcon, provideIcons } from "@ng-icons/core";
import {
  lucideAccessibility,
  lucideBike,
  lucideCar,
  lucideInbox,
  lucideLayers,
  lucideMapPin,
  lucideX,
  lucideZap,
} from "@ng-icons/lucide";
import { BadgeComponent, TypographyH3, TypographyMuted } from "@nivo-sass/design-system";

import type { DrawerTab } from "../../../facades/parking-slots-list.facade";
import { getHistoryCopy } from "../../../facades/parking-slots-list.facade";
import { SLOT_TYPE_ICONS } from "../../../shared/parking-slot-presentations";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TypographyH3, TypographyMuted, NgIcon, BadgeComponent],
  providers: [
    provideIcons({
      lucideAccessibility,
      lucideBike,
      lucideCar,
      lucideInbox,
      lucideLayers,
      lucideMapPin,
      lucideX,
      lucideZap,
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
  protected readonly slotTypeIcon = SLOT_TYPE_ICONS;
}
