import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { NgIcon, provideIcons } from "@ng-icons/core";
import {
  lucideAlertTriangle,
  lucideArrowLeft,
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
} from "@ng-icons/lucide";
import {
  ButtonComponent,
  TableBodyComponent,
  TableCellComponent,
  TableComponent,
  TableHeadComponent,
  TableHeaderComponent,
  TableRowComponent,
} from "@nivo-sass/design-system";
import { PageHeaderComponent } from "@shared/components/page-header/page-header";
import { APP_ROUTES } from "@shared/constants/app-routes.constant";
import { APP_TEXTS } from "@shared/constants/app-texts.constant";
import { FlexRender } from "@tanstack/angular-table";

import { PaginationTable } from "@/app/shared/components/pagination-table/pagination-table";

import { SlotDetailDrawer } from "../../components/drawer/slot-detail-drawer/slot-detail-drawer";
import { SlotEmptyStateComponent } from "../../components/empty-state/slot-empty-state/slot-empty-state";
import { SlotDeleteModal } from "../../components/modals/slot-delete-modal/slot-delete-modal";
import { SlotDeleteState } from "../../components/modals/slot-delete-modal/slots-delete.state";
import { SlotGroupEditModalComponent } from "../../components/modals/slot-group-edit-modal/slot-group-edit-modal";
import { SlotMetadataBatchModalComponent } from "../../components/modals/slot-metadata-batch-modal/slot-metadata-batch-modal";
import { SlotStatusModal } from "../../components/modals/slot-status-modal/slot-status-modal";
import { SlotStatusState } from "../../components/modals/slot-status-modal/slot-status.state";
import { SlotBatchSelectionBarComponent } from "../../components/toolbar/slot-batch-selection-bar/slot-batch-selection-bar";
import { SlotFilterToolbarComponent } from "../../components/toolbar/slot-filter-toolbar/slot-filter-toolbar";
import {
  ParkingSlotsListFacade,
  SlotDrawerState,
  SlotGroupState,
  SlotMetadataBatchState,
  getHistoryCopy,
} from "../../facades/parking-slots-list.facade";
import { SLOT_TYPE_LABELS } from "../../shared/parking-slot-presentations";
import { SlotsSelectionState } from "./slots-selection.state";
import { SlotsTableState } from "./slots-table.state";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: "block w-full",
  },
  imports: [
    NgIcon,
    ButtonComponent,
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
    SlotMetadataBatchModalComponent,
    SlotGroupEditModalComponent,
    SlotFilterToolbarComponent,
    SlotBatchSelectionBarComponent,
    SlotEmptyStateComponent,
    PaginationTable,
    PageHeaderComponent,
  ],
  providers: [
    SlotsTableState,
    SlotsSelectionState,
    SlotDeleteState,
    SlotStatusState,
    SlotMetadataBatchState,
    SlotGroupState,
    SlotDrawerState,
    ParkingSlotsListFacade,
    provideIcons({
      lucideAlertTriangle,
      lucideArrowLeft,
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
