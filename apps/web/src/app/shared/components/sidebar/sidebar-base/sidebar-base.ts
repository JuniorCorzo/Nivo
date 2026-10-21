import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { NavigationEnd, Router, RouterLink } from "@angular/router";
import { UserService } from "@core/services/user/user-service";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucideCar, lucideLayoutDashboard, lucideTicket, lucideUsers } from "@ng-icons/lucide";
import { SidebarFooter } from "@shared/components/sidebar-footer/sidebar-footer";
import { APP_ROUTES } from "@shared/constants/app-routes.constant";
import { APP_TEXTS } from "@shared/constants/app-texts.constant";
import { filter } from "rxjs";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: "h-full min-h-0 flex flex-col justify-between overflow-hidden",
  },
  imports: [RouterLink, NgIcon, SidebarFooter],
  providers: [
    provideIcons({
      lucideCar,
      lucideLayoutDashboard,
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

  private readonly currentUrl = signal(this.router.url.split("?", 1)[0]);

  public readonly navItems = computed(() => {
    const currentRole = this.userService.currentUser()?.role;
    const url = this.currentUrl();

    return APP_TEXTS.sidebar.nav
      .filter((item) => {
        if (!item.roles) {
          return true;
        }
        return Boolean(currentRole && item.roles.includes(currentRole));
      })
      .map((item) => ({
        ...item,
        isActive: Boolean(item.url && url.includes(item.url)),
      }));
  });

  constructor() {
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe((event) => {
        this.currentUrl.set(event.urlAfterRedirects);
      });
  }
}
