import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import type { SlotDistribution } from "@core/type/slot-distribution.type";
import { SLOT_TYPE_ICONS } from "@features/slots/shared/parking-slot-presentations";
import { NgIcon, provideIcons } from "@ng-icons/core";
import {
  lucideAccessibility,
  lucideBike,
  lucideCar,
  lucideZap,
} from "@ng-icons/lucide";
import {
  CardComponent,
  TypographyH3,
  TypographyMono,
  TypographyMuted,
} from "@nivo-sass/design-system";
import { APP_TEXTS } from "@shared/constants/app-texts.constant";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgIcon,
    CardComponent,
    TypographyH3,
    TypographyMuted,
    TypographyMono,
  ],
  providers: [
    provideIcons({
      lucideAccessibility,
      lucideBike,
      lucideCar,
      lucideZap,
    }),
  ],
  selector: "app-parking-slot-distribution",
  standalone: true,
  templateUrl: "./parking-slot-distribution.html",
})
export class ParkingSlotDistribution {
  protected readonly LABELS_DETAIL = APP_TEXTS.parking.detail;
  protected readonly slotTypeIcon = SLOT_TYPE_ICONS;

  public readonly slotDistribution = input.required<SlotDistribution[]>();
  public readonly occupiedSlots = input.required<number>();
  public readonly availableSlots = input.required<number>();
  public readonly totalSlots = input.required<number>();

  public static slotLabel(slot: SlotDistribution): string {
    return [slot.zone, slot.type].filter(Boolean).join(" · ").toUpperCase();
  }

  public readonly slotLabel = ParkingSlotDistribution.slotLabel;
}
