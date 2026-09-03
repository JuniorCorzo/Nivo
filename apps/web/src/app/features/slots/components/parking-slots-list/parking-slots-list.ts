import { Component, inject } from "@angular/core";
import { RouterLink } from "@angular/router";
import { NgIcon, provideIcons } from "@ng-icons/core";
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
} from "@ng-icons/lucide";
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
} from "@nivo-sass/design-system";
import { APP_ROUTES } from "@shared/constants/app-routes.constant";
import { APP_TEXTS } from "@shared/constants/app-texts.constant";
import { FlexRender } from "@tanstack/angular-table";

import { PaginationTable } from "@/app/shared/components/pagination-table/pagination-table";

import { SLOT_TYPE_LABELS } from "../../shared/parking-slot-presentations";
import { SlotDeleteModal } from "../slot-delete-modal/slot-delete-modal";
import { SlotDeleteState } from "../slot-delete-modal/slots-delete.state";
import { SlotDetailDrawer } from "../slot-detail-drawer/slot-detail-drawer";
import { SlotStatusModal } from "../slot-status-modal/slot-status-modal";
import { SlotStatusState } from "../slot-status-modal/slot-status.state";
import {
  ParkingSlotsListFacade,
  getHistoryCopy,
} from "./parking-slots-list.facade";
import { SlotsSelectionState } from "./slots-selection.state";
import { SlotsTableState } from "./slots-table.state";

@Component({
  host: {
    class: "block w-full",
  },
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
      lucideAlertTriangle,
      lucideArrowLeft,
      lucideBike,
      lucideCar,
      lucideChevronLeft,
      lucideChevronRight,
      lucideEye,
      lucideFilterX,
      lucideInbox,
      lucideParkingSquare,
      lucidePencil,
      lucidePlus,
      lucideSearch,
      lucideToggleLeft,
      lucideTrash2,
      lucideX,
    }),
  ],
  selector: "app-parking-slots-list",
  standalone: true,
  templateUrl: "./parking-slots-list.html",
})
export class ParkingSlotsListPage {
  protected readonly facade = inject(ParkingSlotsListFacade);
  protected readonly APP_ROUTES = APP_ROUTES;
  protected readonly texts = APP_TEXTS.parking.slots;
  protected readonly getHistoryCopy = getHistoryCopy;

  protected readonly slotTypeLabel = SLOT_TYPE_LABELS;
}
