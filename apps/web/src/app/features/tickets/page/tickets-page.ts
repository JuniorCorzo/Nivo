import { CommonModule } from "@angular/common";
import type { OnInit } from "@angular/core";
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { TicketReceiptComponent } from "@features/operations/components/ticket-receipt/ticket-receipt";
import { NgIcon, provideIcons } from "@ng-icons/core";
import {
  lucideArrowLeft,
  lucideCheckCircle2,
  lucideClock,
  lucideTicket,
} from "@ng-icons/lucide";
import {
  CardComponent,
  CardContentComponent,
  TypographyMuted,
} from "@nivo-sass/design-system";
import { PageHeaderComponent } from "@shared/components/page-header/page-header";
import { APP_ROUTES } from "@shared/constants/app-routes.constant";
import { APP_TEXTS } from "@shared/constants/app-texts.constant";

import { TicketDetailDrawerComponent } from "../components/ticket-detail-drawer/ticket-detail-drawer";
import { TicketFiltersComponent } from "../components/ticket-filters/ticket-filters";
import { TicketsTableComponent } from "../components/tickets-table/tickets-table";
import { TicketsFacade } from "../facades/tickets.facade";

interface HeaderContext {
  title: string;
  subtitle: string;
  back: string | null;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    NgIcon,
    CardComponent,
    CardContentComponent,
    TypographyMuted,
    TicketFiltersComponent,
    TicketsTableComponent,
    TicketDetailDrawerComponent,
    TicketReceiptComponent,
    PageHeaderComponent,
  ],
  providers: [
    TicketsFacade,
    provideIcons({
      lucideArrowLeft,
      lucideCheckCircle2,
      lucideClock,
      lucideTicket,
    }),
  ],
  selector: "app-tickets-page",
  standalone: true,
  templateUrl: "./tickets-page.html",
})
export class TicketsPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  readonly facade = inject(TicketsFacade);

  protected readonly APP_ROUTES = APP_ROUTES;
  readonly texts = APP_TEXTS.tickets;
  protected readonly title = computed(() =>
    this.facade.isTenantView()
      ? this.texts.titles.tenant.title
      : this.texts.titles.parkingLots.title
  );

  protected readonly headerContext = computed(() => this.initHeaderContext());

  ngOnInit(): void {
    const parkingId = this.route.snapshot.paramMap.get("parkingId");
    this.facade.loadTickets(parkingId);
  }

  private initHeaderContext(): HeaderContext {
    const isTenantView = this.facade.isTenantView();
    const parkingLotId = this.facade.parkingId();
    const tenantTexts = this.texts.titles.tenant;
    const parkingTexts = this.texts.titles.parkingLots;

    const title = isTenantView ? tenantTexts.title : parkingTexts.title;
    const subtitle = isTenantView
      ? tenantTexts.subtitle
      : parkingTexts.subtitle;

    const back =
      !isTenantView && parkingLotId
        ? APP_ROUTES.app.parkingLotOperations(parkingLotId)
        : null;

    return { back, subtitle, title };
  }
}
