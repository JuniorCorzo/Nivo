import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { NgIcon, provideIcons } from "@ng-icons/core";
import {
  lucideCoins,
  lucideLogIn,
  lucideMapPin,
  lucideParkingSquare,
  lucidePencil,
  lucideTrash2,
} from "@ng-icons/lucide";
import {
  ButtonComponent,
  CardComponent,
  TypographyH3,
} from "@nivo-sass/design-system";
import { DeleteParkingModal } from "@shared/components/delete-parking-modal/delete-parking-modal";
import { APP_TEXTS } from "@shared/constants/app-texts.constant";

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
    TypographyH3,
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
      lucideTrash2,
    }),
  ],
  selector: "app-parking-home",
  standalone: true,
  templateUrl: "./parking-home.html",
})
export class ParkingHome {
  protected readonly LABELS_DETAIL = APP_TEXTS.parking.detail;
  protected readonly facade = inject(ParkingHomeFacade);
}
