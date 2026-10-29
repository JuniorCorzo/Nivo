import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from "@angular/core";
import type { OccupiedSlotDetail } from "@core/models/parking-telemetry.model";
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
  ToastService,
  TypographyH3,
  TypographyMono,
  TypographyMuted,
} from "@nivo-sass/design-system";
import { APP_TEXTS } from "@shared/constants/app-texts.constant";

export interface VisualSlotItem {
  name: string;
  isOccupied: boolean;
  plate?: string;
  type: string;
}

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
  private readonly toastService = inject(ToastService, { optional: true });
  protected readonly LABELS_DETAIL = APP_TEXTS.parking.detail;
  protected readonly slotTypeIcon = SLOT_TYPE_ICONS;

  public readonly slotDistribution = input.required<SlotDistribution[]>();
  public readonly occupiedSlots = input.required<number>();
  public readonly availableSlots = input.required<number>();
  public readonly totalSlots = input.required<number>();
  public readonly occupiedSlotsDetail = input<OccupiedSlotDetail[]>([]);

  public static slotLabel(slot: SlotDistribution): string {
    return [slot.zone, slot.type].filter(Boolean).join(" · ").toUpperCase();
  }

  public readonly slotLabel = ParkingSlotDistribution.slotLabel;

  public readonly visualSlots = computed<VisualSlotItem[]>(() => {
    const dist = this.slotDistribution();
    if (!dist || dist.length === 0) {
      return [];
    }

    const maxSlots = 12;
    const details = this.occupiedSlotsDetail() ?? [];

    if (details.length > 0) {
      const occupiedItems: VisualSlotItem[] = details
        .slice(0, maxSlots)
        .map((detail) => ({
          isOccupied: true,
          name:
            detail.prefix && !detail.slotNumber.startsWith(detail.prefix)
              ? `${detail.prefix}-${detail.slotNumber}`
              : detail.slotNumber,
          plate: detail.licensePlate || undefined,
          type: detail.type,
        }));

      const remainingCount = maxSlots - occupiedItems.length;
      if (remainingCount <= 0) {
        return occupiedItems;
      }

      const occupiedNames = new Set(occupiedItems.map((s) => s.name));
      const availableItems: VisualSlotItem[] = [];
      let slotCounter = 1;
      let groupIdx = 0;

      while (availableItems.length < remainingCount) {
        const group = dist[groupIdx % dist.length];
        groupIdx++;
        const prefix = group?.prefix || "P";
        const slotNum = slotCounter < 10 ? `0${slotCounter}` : `${slotCounter}`;
        const candidateName = `${prefix}-${slotNum}`;
        slotCounter++;
        if (!occupiedNames.has(candidateName)) {
          availableItems.push({
            isOccupied: false,
            name: candidateName,
            type: group?.type || "CAR",
          });
        }
      }

      return [...occupiedItems, ...availableItems];
    }

    const total = this.totalSlots() || 1;
    const occupiedTarget = Math.min(
      maxSlots,
      Math.max(
        0,
        Math.round(maxSlots * (this.occupiedSlots() / total)) ||
          (this.occupiedSlots() > 0 ? 8 : 0)
      )
    );

    const items: VisualSlotItem[] = [];
    let remaining = maxSlots;
    for (let g = 0; g < dist.length; g++) {
      const group = dist[g];
      const isLast = g === dist.length - 1;
      const groupCount = isLast
        ? remaining
        : Math.min(
            remaining,
            Math.max(1, Math.round((group.count / total) * maxSlots))
          );
      remaining -= groupCount;

      const prefix = group.prefix || "P";
      for (let i = 1; i <= groupCount; i++) {
        const slotNum = i < 10 ? `0${i}` : `${i}`;
        items.push({
          isOccupied: false,
          name: `${prefix}-${slotNum}`,
          type: group.type,
        });
      }
    }

    for (let i = 0; i < items.length; i++) {
      const shouldOccupy = i < occupiedTarget;
      if (shouldOccupy) {
        items[i].isOccupied = true;
        items[i].plate = undefined;
      }
    }

    return items;
  });

  public onSlotClick(slot: VisualSlotItem): void {
    if (slot.isOccupied) {
      this.toastService?.showToast({
        message: `Bahía ${slot.name} (${slot.plate || "vehículo"}) ocupada`,
        type: "info",
      });
    } else {
      this.toastService?.showToast({
        message: `Bahía ${slot.name} disponible para ingreso`,
        type: "success",
      });
    }
  }
}
