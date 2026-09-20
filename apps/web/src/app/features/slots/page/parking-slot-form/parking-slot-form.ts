import { ChangeDetectionStrategy, Component, computed, inject } from "@angular/core";
import { RouterLink } from "@angular/router";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucideArrowLeft, lucidePlus, lucideSave, lucideLayers } from "@ng-icons/lucide";
import { ButtonComponent } from "@nivo-sass/design-system";
import { PageHeaderComponent } from "@shared/components/page-header/page-header";
import type { PageHeaderBreadcrumbItem } from "@shared/components/page-header/page-header";
import { APP_ROUTES } from "@shared/constants/app-routes.constant";

import { ParkingSlotFormFacade } from "../../facades/parking-slot-form.facade";
import { ParkingSlotCreateForm } from "./components/parking-slot-create-form/parking-slot-create-form";
import { ParkingSlotEditForm } from "./components/parking-slot-edit-form/parking-slot-edit-form";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: "block",
  },
  imports: [
    RouterLink,
    NgIcon,
    ButtonComponent,
    PageHeaderComponent,
    ParkingSlotCreateForm,
    ParkingSlotEditForm,
  ],
  providers: [
    provideIcons({
      lucideArrowLeft,
      lucideLayers,
      lucidePlus,
      lucideSave,
    }),
    ParkingSlotFormFacade,
  ],
  selector: "app-parking-slot-form",
  standalone: true,
  templateUrl: "./parking-slot-form.html",
})
export class ParkingSlotFormPage {
  protected readonly APP_ROUTES = APP_ROUTES;
  protected readonly facade = inject(ParkingSlotFormFacade);

  readonly breadcrumbs = computed<PageHeaderBreadcrumbItem[]>(() => {
    const p = this.facade.parking();
    const modeLabel = this.facade.mode() === "create" ? "Crear plazas" : "Editar plaza";
    const modeIcon = this.facade.mode() === "create" ? "lucidePlus" : "lucideEdit";
    if (!p) {
      return [
        {
          icon: "lucideParkingSquare",
          label: "Parqueaderos",
          url: APP_ROUTES.app.parkingLots,
        },
        { icon: modeIcon, label: modeLabel },
      ];
    }
    return [
      {
        icon: "lucideParkingSquare",
        label: "Parqueaderos",
        url: APP_ROUTES.app.parkingLots,
      },
      {
        icon: "lucideBuilding2",
        isParking: true,
        label: p.name,
        url: APP_ROUTES.app.parkingLotSlots(p.id),
      },
      { icon: modeIcon, label: modeLabel },
    ];
  });
}
