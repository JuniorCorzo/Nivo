import { computed, inject, Injectable, signal } from "@angular/core";
import type { ParkingLotListItemModel } from "@core/models/parking.model";
import { ParkingService } from "@core/services/parking-service";

export const ACTIVE_PARKING_STORAGE_KEY = "nivo_active_parking_id";

@Injectable({
  providedIn: "root",
})
export class ActiveParkingService {
  private readonly parkingService = inject(ParkingService);

  private readonly _activeParkingId = signal<string | null>(
    ActiveParkingService.getInitialStoredId()
  );

  public readonly activeParkingId = this._activeParkingId.asReadonly();

  public readonly activeParkingLot = computed<ParkingLotListItemModel | null>(
    () => {
      const lots = this.parkingService.parkingLots();
      if (!lots || lots.length === 0) {
        return null;
      }

      const currentId = this._activeParkingId();
      if (currentId) {
        const match = lots.find((p) => p.id === currentId);
        if (match) {
          return match;
        }
      }

      // Default to the first parking lot if none is explicitly active or id not found
      return lots[0] ?? null;
    }
  );

  public readonly hasActiveParking = computed<boolean>(
    () => this.activeParkingLot() !== null
  );

  public readonly activeParkingName = computed<string>(
    () => this.activeParkingLot()?.name ?? ""
  );

  public setActiveParkingId(id: string | null): void {
    this._activeParkingId.set(id);
    ActiveParkingService.persistStoredId(id);
  }

  public setActiveParking(lot: ParkingLotListItemModel | null): void {
    this.setActiveParkingId(lot?.id ?? null);
  }

  public clearActiveParking(): void {
    this.setActiveParkingId(null);
  }

  private static getInitialStoredId(): string | null {
    try {
      return (
        globalThis.localStorage?.getItem(ACTIVE_PARKING_STORAGE_KEY) ?? null
      );
    } catch {
      // Ignore storage access errors
      return null;
    }
  }

  private static persistStoredId(id: string | null): void {
    try {
      if (id) {
        globalThis.localStorage?.setItem(ACTIVE_PARKING_STORAGE_KEY, id);
      } else {
        globalThis.localStorage?.removeItem(ACTIVE_PARKING_STORAGE_KEY);
      }
    } catch {
      // Ignore storage access errors
    }
  }
}
