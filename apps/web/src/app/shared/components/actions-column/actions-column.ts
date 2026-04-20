import { Component } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideEye, lucidePencil, lucideTrash2 } from '@ng-icons/lucide';
import { ButtonComponent } from '@nivo-sass/design-system';

@Component({
  selector: 'app-actions-column',
  imports: [NgIcon, ButtonComponent],
  providers: [provideIcons({ lucideEye, lucidePencil, lucideTrash2 })],
  templateUrl: './actions-column.html',
  styleUrl: './actions-column.css',
})
export class ActionsColumn {}
