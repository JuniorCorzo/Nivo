import { Component, inject, input, output } from "@angular/core";
import { Router } from "@angular/router";
import { ActiveParkingService } from "@core/services/active-parking.service";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucideEye, lucidePencil, lucideTrash2 } from "@ng-icons/lucide";
import { ButtonComponent } from "@nivo-sass/design-system";
import { APP_ROUTES } from "@shared/constants/app-routes.constant";

@Component({
  imports: [NgIcon, ButtonComponent],
  providers: [provideIcons({ lucideEye, lucidePencil, lucideTrash2 })],
  selector: "app-actions-column",
  styleUrl: "./actions-column.css",
  templateUrl: "./actions-column.html",
})
export class ActionsColumn {
  private readonly router = inject(Router);
  private readonly activeParkingService = inject(ActiveParkingService);

  readonly parkingId = input.required<string>();
  readonly deleteClick = output<string>();

  onViewDetails(): void {
    this.activeParkingService.setActiveParkingId(this.parkingId());
    this.router.navigate([APP_ROUTES.app.parkingLots]);
  }

  onEdit(): void {
    this.router.navigate([APP_ROUTES.app.editParkingLots(this.parkingId())]);
  }

  onDelete(): void {
    this.deleteClick.emit(this.parkingId());
  }
}
