import { BreakpointObserver, Breakpoints } from "@angular/cdk/layout";
import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  computed,
  inject,
  signal,
} from "@angular/core";
import { takeUntilDestroyed, toSignal } from "@angular/core/rxjs-interop";
import { NavigationEnd, Router, RouterLink, RouterOutlet } from "@angular/router";
import { ActiveParkingService } from "@core/services/active-parking.service";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucideMenu } from "@ng-icons/lucide";
import { BadgeComponent, ButtonComponent } from "@nivo-sass/design-system";
import { APP_ROUTES } from "@shared/constants/app-routes.constant";
import { filter, map } from "rxjs";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, NgIcon, BadgeComponent, ButtonComponent],
  providers: [
    provideIcons({
      lucideMenu,
    }),
  ],
  selector: "app-layout-component",
  styleUrl: "./layout-component.css",
  templateUrl: "./layout-component.html",
})
export class LayoutComponent {
  private readonly breakpointObserver = inject(BreakpointObserver);
  private readonly router = inject(Router);
  protected readonly activeParkingService = inject(ActiveParkingService, {
    optional: true,
  });

  public readonly isMobile = toSignal(
    this.breakpointObserver
      .observe([Breakpoints.XSmall, Breakpoints.Small, "(max-width: 767.98px)"])
      .pipe(map((result) => result.matches)),
    { initialValue: false }
  );

  public readonly mobileDrawerOpen = signal(false);

  protected readonly homeUrl = APP_ROUTES.app.parkingLots;

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
