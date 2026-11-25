import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  inject,
} from "@angular/core";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucideTicket } from "@ng-icons/lucide";
import { PageHeaderComponent } from "@shared/components/page-header/page-header";
import { APP_ROUTES } from "@shared/constants/app-routes.constant";
import { APP_TEXTS } from "@shared/constants/app-texts.constant";

import { OperationsActiveTicketsTableComponent } from "../components/active-tickets-table/active-tickets-table";
import { OperationsKpiRibbonComponent } from "../components/kpi-ribbon/kpi-ribbon";
import { CheckInModalComponent } from "../components/modals/check-in-modal/check-in-modal";
import { CheckOutModalComponent } from "../components/modals/check-out-modal/check-out-modal";
import { QrScannerModalComponent } from "../components/modals/qr-scanner-modal/qr-scanner-modal";
import { OperationsOmnibarComponent } from "../components/omnibar/operations-omnibar";
import { OperationsSlotsGridComponent } from "../components/slots-grid/operations-slots-grid";
import { OperationsModalsStore } from "../facades/operations-modals.store";
import { OperationsFacade } from "../facades/operations.facade";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    NgIcon,
    PageHeaderComponent,
    CheckInModalComponent,
    CheckOutModalComponent,
    QrScannerModalComponent,
    OperationsActiveTicketsTableComponent,
    OperationsKpiRibbonComponent,
    OperationsOmnibarComponent,
    OperationsSlotsGridComponent,
  ],
  providers: [
    OperationsModalsStore,
    OperationsFacade,
    provideIcons({ lucideTicket }),
  ],
  selector: "app-operations-page",
  standalone: true,
  styleUrl: "./operations-page.css",
  templateUrl: "./operations-page.html",
})
export class OperationsPageComponent {
  readonly texts = APP_TEXTS.operations;
  readonly APP_ROUTES = APP_ROUTES;

  readonly facade = inject(OperationsFacade);
  private readonly route = inject(ActivatedRoute);

  constructor() {
    this.facade.bindRoute(this.route.paramMap, this.route.queryParamMap);
  }

  @HostListener("window:keydown", ["$event"])
  handleKeyboardShortcuts(event: KeyboardEvent): void {
    if (
      this.facade.isCheckInModalOpen() ||
      this.facade.isCheckOutModalOpen() ||
      this.facade.isQrScannerOpen()
    ) {
      return;
    }

    /* SAFETY: event.target is HTMLElement or null on window keyboard event */
    const target = event.target as HTMLElement | null;
    const tagName = target?.tagName?.toUpperCase();
    if (
      tagName === "INPUT" ||
      tagName === "TEXTAREA" ||
      tagName === "SELECT" ||
      target?.isContentEditable
    ) {
      return;
    }

    if (event.key === "i" || event.key === "I") {
      event.preventDefault();
      this.facade.openCheckInModal();
    } else if (event.key === "o" || event.key === "O") {
      event.preventDefault();
      this.facade.openDirectCheckOutModal();
    } else if (event.key === "q" || event.key === "Q") {
      event.preventDefault();
      this.facade.openQrScanner();
    }
  }
}
