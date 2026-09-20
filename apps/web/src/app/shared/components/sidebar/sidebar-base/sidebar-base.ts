import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  signal,
} from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { NavigationEnd, Router, RouterLink } from "@angular/router";
import { NgIcon, provideIcons } from "@ng-icons/core";
import {
  lucideCar,
  lucideLayoutDashboard,
  lucideTicket,
} from "@ng-icons/lucide";
import { SidebarFooter } from "@shared/components/sidebar-footer/sidebar-footer";
import { APP_ROUTES } from "@shared/constants/app-routes.constant";
import { APP_TEXTS } from "@shared/constants/app-texts.constant";
import { filter } from "rxjs";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: "h-full flex flex-col",
  },
  imports: [RouterLink, NgIcon, SidebarFooter],
  providers: [
    provideIcons({
      lucideCar,
      lucideLayoutDashboard,
      lucideTicket,
    }),
  ],
  selector: "app-sidebar-base",
  templateUrl: "./sidebar-base.html",
})
export class SidebarBase {
  readonly collapsed = input<boolean>(false);
  protected readonly homeUrl = APP_ROUTES.app.parkingLots;

  public readonly navItems = signal(
    APP_TEXTS.sidebar.nav.map((item) => ({ ...item, isActive: false }))
  );

  private readonly router = inject(Router);

  constructor() {
    this.setActiveItem(this.router.url.split("?", 1)[0]);

    this.router.events
      .pipe(
        filter(
          (event): event is NavigationEnd => event instanceof NavigationEnd
        ),
        takeUntilDestroyed()
      )
      .subscribe((event) => {
        this.setActiveItem(event.urlAfterRedirects);
      });
  }

  private setActiveItem(url: string): void {
    this.navItems.update((items) =>
      items.map((item) => ({
        ...item,
        isActive: Boolean(item.url && url.includes(item.url)),
      }))
    );
  }
}
