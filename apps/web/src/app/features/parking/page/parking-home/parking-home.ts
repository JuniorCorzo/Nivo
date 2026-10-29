import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from "@angular/core";
import type { Coordinates } from "@core/type/coordinates.type";
import { NgIcon, provideIcons } from "@ng-icons/core";
import {
  lucideBuilding2,
  lucideCoins,
  lucideEdit,
  lucideLayers,
  lucideLogIn,
  lucideMapPin,
  lucideParkingSquare,
  lucidePencil,
  lucideSearch,
  lucideTag,
  lucideTicket,
  lucideTrash2,
} from "@ng-icons/lucide";
import {
  ButtonComponent,
  CardComponent,
  TypographyH3,
} from "@nivo-sass/design-system";
import { DeleteParkingModal } from "@shared/components/delete-parking-modal/delete-parking-modal";
import { PageHeaderComponent } from "@shared/components/page-header/page-header";
import { APP_TEXTS } from "@shared/constants/app-texts.constant";

import { ParkingLotSelector } from "../../components/controls/parking-lot-selector/parking-lot-selector";
import { ParkingGeneralInfo } from "../../components/detail/parking-general-info/parking-general-info";
import { ParkingMapComponent } from "../../components/detail/parking-map/parking-map";
import { ParkingSlotDistribution } from "../../components/detail/parking-slot-distribution/parking-slot-distribution";
import { ParkingStatsGrid } from "../../components/detail/parking-stats-grid/parking-stats-grid";
import { ParkingEmptyState } from "../../components/empty-state/parking-empty-state/parking-empty-state";
import { ParkingHomeFacade } from "../../facades/parking-home.facade";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgIcon,
    ButtonComponent,
    CardComponent,
    PageHeaderComponent,
    ParkingMapComponent,
    DeleteParkingModal,
    ParkingStatsGrid,
    ParkingGeneralInfo,
    ParkingSlotDistribution,
    ParkingEmptyState,
  ],
  providers: [
    ParkingHomeFacade,
    provideIcons({
      lucideBuilding2,
      lucideCoins,
      lucideEdit,
      lucideLayers,
      lucideLogIn,
      lucideMapPin,
      lucideParkingSquare,
      lucidePencil,
      lucideSearch,
      lucideTag,
      lucideTicket,
      lucideTrash2,
    }),
  ],
  selector: "app-parking-home",
  standalone: true,
  templateUrl: "./parking-home.html",
})
export class ParkingHome {
  public readonly activeTab = signal<"capacity" | "technical">("capacity");
  protected readonly LABELS_DETAIL = APP_TEXTS.parking.detail;
  protected readonly facade = inject(ParkingHomeFacade);

  public setTab(tab: "capacity" | "technical"): void {
    this.activeTab.set(tab);
  }

  public activeParkingSubtitle(): string {
    const lot = this.facade.activeParkingLot();
    if (!lot) {
      return "";
    }
    return ParkingLotSelector.getFormattedAddress(lot);
  }

  public formatGps(coords?: Coordinates): string {
    if (!coords || coords.latitude == null || coords.longitude == null) {
      return "0.0000° N · 0.0000° W";
    }
    const latDir = coords.latitude >= 0 ? "N" : "S";
    const lngDir = coords.longitude >= 0 ? "E" : "W";
    const lat = `${Math.abs(coords.latitude).toFixed(4)}° ${latDir}`;
    const lng = `${Math.abs(coords.longitude).toFixed(4)}° ${lngDir}`;
    return `${lat} · ${lng}`;
  }
}
