import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { NgIcon, provideIcons } from "@ng-icons/core";
import {
  lucideCoins,
  lucideLogIn,
  lucideParkingSquare,
  lucidePencil,
  lucideTrash2,
} from "@ng-icons/lucide";
import { ButtonComponent, DividerComponent } from "@nivo-sass/design-system";

import { MeatballMenu } from "@/app/shared/components/meatball-menu/meatball-menu";
import type { MeatballMenuItem } from "@/app/shared/components/meatball-menu/meatball-menu";
import { APP_TEXTS } from "@/app/shared/constants/app-texts.constant";

import { ParkingHomeFacade } from "../../facades/parking-home.facade";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: "flex flex-wrap items-center gap-2",
  },
  imports: [ButtonComponent, NgIcon, DividerComponent, MeatballMenu],
  providers: [
    provideIcons({
      lucideCoins,
      lucideLogIn,
      lucideParkingSquare,
      lucidePencil,
      lucideTrash2,
    }),
  ],
  selector: "app-parking-action-button",
  templateUrl: "./parking-action-button.html",
})
export class ParkingActionButton {
  protected readonly facade = inject(ParkingHomeFacade);
  protected readonly LABELS_DETAIL = APP_TEXTS.parking;

  readonly menuItems: MeatballMenuItem[] = [
    {
      action: () => this.facade.onEdit(),
      icon: "lucidePencil",
      label: "Editar",
    },
    {
      action: () => this.facade.onDeleteClick(),
      icon: "lucideTrash2",
      label: "Eliminar",
      variant: "destructive",
    },
  ];
}
