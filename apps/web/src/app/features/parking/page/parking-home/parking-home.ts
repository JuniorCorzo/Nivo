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
import { CardComponent, TypographyH3 } from "@nivo-sass/design-system";
import { DeleteParkingModal } from "@shared/components/delete-parking-modal/delete-parking-modal";
import { PageHeaderComponent } from "@shared/components/page-header/page-header";
import { APP_TEXTS } from "@shared/constants/app-texts.constant";

import { ParkingActionButton } from "../../components/controls/parking-action-button/parking-action-button";
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
    CardComponent,
    TypographyH3,
    PageHeaderComponent,
    ParkingMapComponent,
    DeleteParkingModal,
    ParkingActionButton,
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

  public activeParkingSubtitle(): string {
    const lot = this.facade.activeParkingLot();
    if (!lot) {
      return "";
    }
    return ParkingLotSelector.getFormattedAddress(lot);
  }
}
