import { Component, inject, input } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideEye, lucidePencil, lucideTrash2 } from '@ng-icons/lucide';
import { ButtonComponent } from '@nivo-sass/design-system';
import { Router } from '@angular/router';
import { APP_ROUTES } from '@shared/constants/app-routes.constant';

@Component({
  selector: 'app-actions-column',
  imports: [NgIcon, ButtonComponent],
  providers: [provideIcons({ lucideEye, lucidePencil, lucideTrash2 })],
  templateUrl: './actions-column.html',
  styleUrl: './actions-column.css',
})
export class ActionsColumn {
  private readonly router = inject(Router);

  readonly parkingId = input.required<string>();

  onEdit(): void {
    this.router.navigate([APP_ROUTES.app.editParkingLots(this.parkingId())]);
  }
}
