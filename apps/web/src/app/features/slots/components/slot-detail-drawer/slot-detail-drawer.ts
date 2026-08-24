import { Component, input, output } from '@angular/core';
import { TypographyH3, TypographyMuted } from '@nivo-sass/design-system';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideX, lucideInbox } from '@ng-icons/lucide';
import { SlotSummary } from '@core/models/slot.model';
import { DrawerTab, getHistoryCopy } from '../parking-slots-list/parking-slots-list.facade';

@Component({
  selector: 'app-slot-detail-drawer',
  standalone: true,
  imports: [TypographyH3, TypographyMuted, NgIcon],
  providers: [provideIcons({ lucideX, lucideInbox })],
  templateUrl: './slot-detail-drawer.html',
  styleUrl: './slot-detail-drawer.css',
})
export class SlotDetailDrawer {
  readonly slot = input.required<SlotSummary>();
  readonly drawerTab = input.required<DrawerTab>();
  readonly slotTypeLabel = input.required<Record<string, string>>();

  readonly close = output<void>();
  readonly setTab = output<DrawerTab>();

  protected readonly getHistoryCopy = getHistoryCopy;
}
