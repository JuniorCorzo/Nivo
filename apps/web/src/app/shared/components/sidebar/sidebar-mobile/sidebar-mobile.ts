import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  computed,
  inject,
  signal,
} from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { NavigationEnd, Router, RouterLink } from "@angular/router";
import { ActiveParkingService } from "@core/services/active-parking.service";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucideMenu, lucideX } from "@ng-icons/lucide";
import { BadgeComponent, ButtonComponent } from "@nivo-sass/design-system";
import { APP_ROUTES } from "@shared/constants/app-routes.constant";
import { filter } from "rxjs";

import { SidebarBase } from "../sidebar-base/sidebar-base";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, NgIcon, BadgeComponent, ButtonComponent, SidebarBase],
  providers: [
    provideIcons({
      lucideMenu,
      lucideX,
    }),
  ],
  selector: "app-sidebar-mobile",
  templateUrl: "./sidebar-mobile.html",
})
export class SidebarMobile {
  protected readonly homeUrl = APP_ROUTES.app.parkingLots;
  private readonly router = inject(Router);
  protected readonly activeParkingService = inject(ActiveParkingService, {
    optional: true,
  });

  public readonly mobileDrawerOpen = signal(false);

  protected readonly activeParkingName = computed(
    () => this.activeParkingService?.activeParkingName() ?? ""
  );

  constructor() {
    this.router.events
      .pipe(
        filter(
          (event): event is NavigationEnd => event instanceof NavigationEnd
        ),
        takeUntilDestroyed()
      )
      .subscribe(() => {
        this.closeDrawer();
      });
  }

  @HostListener("document:keydown.escape")
  protected onEscape(): void {
    if (this.mobileDrawerOpen()) {
      this.closeDrawer();
    }
  }

  public openDrawer(): void {
    this.mobileDrawerOpen.set(true);
  }

  public closeDrawer(): void {
    this.mobileDrawerOpen.set(false);
  }
}
