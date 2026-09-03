import { computed, inject, Injectable, signal } from '@angular/core';
import { ParkingLotListItemModel } from '@core/models/parking.model';
import { ParkingService } from '@core/services/parking-service';

export const ACTIVE_PARKING_STORAGE_KEY = 'nivo_active_parking_id';

@Injectable({
  providedIn: 'root',
})
export class ActiveParkingService {
  private readonly parkingService = inject(ParkingService);

  private readonly _activeParkingId = signal<string | null>(this.getInitialStoredId());

  public readonly activeParkingId = this._activeParkingId.asReadonly();

  public readonly activeParkingLot = computed<ParkingLotListItemModel | null>(() => {
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
  });

  public readonly hasActiveParking = computed<boolean>(() => {
    return this.activeParkingLot() !== null;
  });

  public readonly activeParkingName = computed<string>(() => {
    return this.activeParkingLot()?.name ?? '';
  });

  public setActiveParkingId(id: string | null): void {
    this._activeParkingId.set(id);
    this.persistStoredId(id);
  }

  public setActiveParking(lot: ParkingLotListItemModel | null): void {
    this.setActiveParkingId(lot?.id ?? null);
  }

  public clearActiveParking(): void {
    this.setActiveParkingId(null);
  }

  private getInitialStoredId(): string | null {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(ACTIVE_PARKING_STORAGE_KEY);
      }
    } catch {
      // Ignore storage access errors
    }
    return null;
  }

  private persistStoredId(id: string | null): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        if (id) {
          window.localStorage.setItem(ACTIVE_PARKING_STORAGE_KEY, id);
        } else {
          window.localStorage.removeItem(ACTIVE_PARKING_STORAGE_KEY);
        }
      }
    } catch {
      // Ignore storage access errors
    }
  }
}
