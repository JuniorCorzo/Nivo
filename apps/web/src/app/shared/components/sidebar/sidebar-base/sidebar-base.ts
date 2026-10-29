import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  signal,
} from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { NavigationEnd, Router, RouterLink } from "@angular/router";
import { ActiveParkingService } from "@core/services/active-parking.service";
import { TicketService } from "@core/services/ticket-service";
import { UserService } from "@core/services/user/user-service";
import type { Role } from "@core/type/role.type";
import { NgIcon, provideIcons } from "@ng-icons/core";
import {
  lucideCar,
  lucideCoins,
  lucideLayoutDashboard,
  lucideLayoutGrid,
  lucideTicket,
  lucideUsers,
} from "@ng-icons/lucide";
import { SidebarFooter } from "@shared/components/sidebar-footer/sidebar-footer";
import { APP_ROUTES } from "@shared/constants/app-routes.constant";
import { APP_TEXTS } from "@shared/constants/app-texts.constant";
import type { SidebarNavItem } from "@shared/constants/app-texts.constant";
import { filter } from "rxjs";

export interface ResolvedSidebarNavItem {
  hasLiveCount?: boolean;
  hasLiveDot?: boolean;
  icon: string;
  isActive: boolean;
  label: string;
  roles?: Role[];
  url: string;
}

export interface ResolvedSidebarNavGroup {
  items: ResolvedSidebarNavItem[];
  label: string;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: "h-full min-h-0 flex flex-col justify-between overflow-hidden",
  },
  imports: [RouterLink, NgIcon, SidebarFooter],
  providers: [
    provideIcons({
      lucideCar,
      lucideCoins,
      lucideLayoutDashboard,
      lucideLayoutGrid,
      lucideTicket,
      lucideUsers,
    }),
  ],
  selector: "app-sidebar-base",
  templateUrl: "./sidebar-base.html",
})
export class SidebarBase {
  readonly collapsed = input<boolean>(false);
  protected readonly homeUrl = APP_ROUTES.app.parkingLots;

  private readonly router = inject(Router);
  private readonly userService = inject(UserService);
  private readonly activeParkingService = inject(ActiveParkingService, {
    optional: true,
  });
  private readonly ticketService = inject(TicketService, { optional: true });

  private readonly currentUrl = signal(this.router.url.split("?", 1)[0]);

  protected readonly ticketCount = computed(() => {
    return this.ticketService?.activeTickets?.()?.length ?? 0;
  });

  public readonly navGroups = computed<ResolvedSidebarNavGroup[]>(() => {
    const currentRole = this.userService.currentUser()?.role;
    const url = this.currentUrl();
    const activeLot = this.activeParkingService?.activeParkingLot?.() ?? null;
    const activeId =
      activeLot?.id ?? this.activeParkingService?.activeParkingId?.() ?? null;

    return APP_TEXTS.sidebar.groups
      .map((group) => {
        const items = group.items
          .filter((item) => {
            if (!item.roles) {
              return true;
            }
            return Boolean(currentRole && item.roles.includes(currentRole));
          })
          .map((item) => {
            const resolvedUrl =
              typeof item.url === "function" ? item.url(activeId) : item.url;

            return {
              ...item,
              isActive: this.checkIsActive(item, url),
              url: resolvedUrl,
            };
          });

        return {
          items,
          label: group.label,
        };
      })
      .filter((group) => group.items.length > 0);
  });

  public readonly navItems = computed(() =>
    this.navGroups().flatMap((g) => g.items)
  );

  constructor() {
    this.router.events
      .pipe(
        filter(
          (event): event is NavigationEnd => event instanceof NavigationEnd
        ),
        takeUntilDestroyed()
      )
      .subscribe((event) => {
        this.currentUrl.set(event.urlAfterRedirects.split("?", 1)[0]);
      });
  }

  private checkIsActive(item: SidebarNavItem, currentUrl: string): boolean {
    if (item.hasLiveCount) {
      return currentUrl.includes("/tickets");
    }
    if (item.icon === "lucideLayoutDashboard") {
      return currentUrl === APP_ROUTES.app.dashboard;
    }
    if (item.icon === "lucideCar") {
      return (
        currentUrl === APP_ROUTES.app.parkingLots ||
        currentUrl === APP_ROUTES.app.createParkingLots
      );
    }
    if (item.icon === "lucideCoins") {
      return currentUrl.includes("/rates");
    }
    if (item.icon === "lucideLayoutGrid") {
      return currentUrl.includes("/slots");
    }
    if (item.icon === "lucideUsers") {
      return currentUrl.includes("/users");
    }
    return false;
  }
}
