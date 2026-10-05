import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { NgIcon, provideIcons } from "@ng-icons/core";
import {
  lucideCoins,
  lucideCopy,
  lucideLogIn,
  lucideParkingSquare,
  lucidePencil,
  lucideTrash2,
} from "@ng-icons/lucide";
import {
  ButtonComponent,
  DividerComponent,
  ToastService,
} from "@nivo-sass/design-system";

import { MeatballMenu } from "@/app/shared/components/meatball-menu/meatball-menu";
import type { MeatballMenuItem } from "@/app/shared/components/meatball-menu/meatball-menu";
import { APP_TEXTS } from "@/app/shared/constants/app-texts.constant";

import { ParkingHomeFacade } from "../../../facades/parking-home.facade";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: "flex w-full flex-wrap items-center gap-2 sm:w-auto",
  },
  imports: [ButtonComponent, NgIcon, DividerComponent, MeatballMenu],
  providers: [
    provideIcons({
      lucideCoins,
      lucideCopy,
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
  private readonly toastService = inject(ToastService, { optional: true });
  protected readonly LABELS_DETAIL = APP_TEXTS.parking;

  readonly menuItems: MeatballMenuItem[] = [
    {
      action: () => this.copyParkingId(),
      icon: "lucideCopy",
      label: "Copiar ID",
    },
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

  copyParkingId(): void {
    const id = this.facade.activeParkingLot()?.id;
    if (id) {
      navigator.clipboard?.writeText(id);
      this.toastService?.showToast({
        message: "ID del parqueadero copiado al portapapeles",
        type: "success",
      });
    }
  }
}
