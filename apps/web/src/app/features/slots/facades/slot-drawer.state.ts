import { Injectable, inject, signal } from "@angular/core";
import { Router } from "@angular/router";
import type { SlotSummary } from "@core/models/slot.model";
import { APP_ROUTES } from "@shared/constants/app-routes.constant";

export type DrawerTab = "general" | "history";

export interface HistoryCopy {
  empty: boolean;
  message?: string;
  title?: string;
}

export const getHistoryCopy = (slot: SlotSummary | null): HistoryCopy => {
  if (!slot) {
    return { empty: true };
  }
  if (!slot.hasHistory) {
    return { empty: true, message: "Sin historial de tickets" };
  }
  return {
    empty: false,
    message: "El detalle de tickets no está disponible en esta vista.",
    title: "Esta plaza tiene tickets previos.",
  };
};

@Injectable()
export class SlotDrawerState {
  private readonly router = inject(Router);

  readonly drawerSlotId = signal<string | null>(null);
  readonly drawerTab = signal<DrawerTab>("general");

  drawerSlot(slots: SlotSummary[]): SlotSummary | null {
    const id = this.drawerSlotId();
    return id ? (slots.find((slot) => slot.id === id) ?? null) : null;
  }

  openDrawer(parkingId: string, slotId: string): void {
    this.drawerTab.set("general");
    this.drawerSlotId.set(slotId);
    this.router.navigate([
      APP_ROUTES.app.parkingLotSlotDetail(parkingId, slotId),
    ]);
  }

  closeDrawer(parkingId: string): void {
    this.drawerSlotId.set(null);
    this.router.navigate([APP_ROUTES.app.parkingLotSlots(parkingId)]);
  }

  setDrawerTab(tab: DrawerTab): void {
    this.drawerTab.set(tab);
  }
}
