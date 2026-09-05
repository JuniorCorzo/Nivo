import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { NgIcon, provideIcons } from "@ng-icons/core";
import {
  lucideCoins,
  lucideLogIn,
  lucideMapPin,
  lucideParkingSquare,
  lucidePencil,
  lucidePlus,
  lucideTrash2,
} from "@ng-icons/lucide";
import { ButtonComponent, CardComponent } from "@nivo-sass/design-system";
import { DeleteParkingModal } from "@shared/components/delete-parking-modal/delete-parking-modal";

import { ParkingEmptyState } from "../../components/parking-empty-state/parking-empty-state";
import { ParkingGeneralInfo } from "../../components/parking-general-info/parking-general-info";
import { ParkingLotSelector } from "../../components/parking-lot-selector/parking-lot-selector";
import { ParkingMapComponent } from "../../components/parking-map/parking-map";
import { ParkingSlotDistribution } from "../../components/parking-slot-distribution/parking-slot-distribution";
import { ParkingStatsGrid } from "../../components/parking-stats-grid/parking-stats-grid";
import { ParkingHomeFacade } from "../../facades/parking-home.facade";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgIcon,
    ButtonComponent,
    CardComponent,
    ParkingLotSelector,
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
      lucideCoins,
      lucideLogIn,
      lucideMapPin,
      lucideParkingSquare,
      lucidePencil,
      lucidePlus,
      lucideTrash2,
    }),
  ],
  selector: "app-parking-home-mobile",
  standalone: true,
  templateUrl: "./parking-home-mobile.html",
})
export class ParkingHomeMobile {
  protected readonly facade = inject(ParkingHomeFacade);
}
