import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideArrowLeft,
  lucideChevronLeft,
  lucideChevronRight,
  lucideEye,
  lucideFilterX,
  lucideInbox,
  lucidePencil,
  lucidePlus,
  lucideSearch,
  lucideToggleLeft,
  lucideTrash2,
  lucideX,
  lucideCar,
  lucideBike,
  lucideParkingSquare,
  lucideAlertTriangle,
} from '@ng-icons/lucide';
import {
  ButtonComponent,
  SelectComponent,
  TableBodyComponent,
  TableCellComponent,
  TableComponent,
  TableHeadComponent,
  TableHeaderComponent,
  TableRowComponent,
  InputComponent,
} from '@nivo-sass/design-system';
import { FlexRender } from '@tanstack/angular-table';

import { APP_ROUTES } from '@shared/constants/app-routes.constant';
import { APP_TEXTS } from '@shared/constants/app-texts.constant';
import { SLOT_TYPE_LABELS } from '../../shared/parking-slot-presentations';
import { ParkingSlotsListFacade, getHistoryCopy } from './parking-slots-list.facade';
import { SlotsTableState } from './slots-table.state';
import { SlotsSelectionState } from './slots-selection.state';
import { SlotDeleteState } from '../slot-delete-modal/slots-delete.state';
import { SlotStatusState } from '../slot-status-modal/slot-status.state';
import { SlotDeleteModal } from '../slot-delete-modal/slot-delete-modal';
import { SlotStatusModal } from '../slot-status-modal/slot-status-modal';
import { SlotDetailDrawer } from '../slot-detail-drawer/slot-detail-drawer';
import { PaginationTable } from '@/app/shared/components/pagination-table/pagination-table';

@Component({
  selector: 'app-parking-slots-list',
  standalone: true,
  imports: [
    RouterLink,
    NgIcon,
    ButtonComponent,
    SelectComponent,
    TableComponent,
    TableBodyComponent,
    TableHeaderComponent,
    TableRowComponent,
    TableCellComponent,
    TableHeadComponent,
    FlexRender,
    SlotDeleteModal,
    SlotStatusModal,
    SlotDetailDrawer,
    PaginationTable,
    InputComponent,
  ],
  providers: [
    SlotsTableState,
    SlotsSelectionState,
    SlotDeleteState,
    SlotStatusState,
    ParkingSlotsListFacade,
    provideIcons({
      lucideArrowLeft,
      lucideChevronLeft,
      lucideChevronRight,
      lucideEye,
      lucideFilterX,
      lucideInbox,
      lucidePencil,
      lucidePlus,
      lucideSearch,
      lucideToggleLeft,
      lucideTrash2,
      lucideX,
      lucideCar,
      lucideBike,
      lucideParkingSquare,
      lucideAlertTriangle,
    }),
  ],
  templateUrl: './parking-slots-list.html',
  host: {
    class: 'block w-full',
  },
})
export class ParkingSlotsListPage {
  protected readonly facade = inject(ParkingSlotsListFacade);
  protected readonly APP_ROUTES = APP_ROUTES;
  protected readonly texts = APP_TEXTS.parking.slots;
  protected readonly getHistoryCopy = getHistoryCopy;

  protected readonly slotTypeLabel = SLOT_TYPE_LABELS;
}
