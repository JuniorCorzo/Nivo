import { BreakpointObserver } from "@angular/cdk/layout";
import type { OnInit } from "@angular/core";
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  linkedSignal,
  signal,
} from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { NavigationEnd, Router, RouterLink } from "@angular/router";
import { NgIcon, provideIcons } from "@ng-icons/core";
import {
  lucideCar,
  lucideLayoutDashboard,
  lucidePanelLeftClose,
  lucidePanelLeftOpen,
  lucideTicket,
} from "@ng-icons/lucide";
import { SidebarFooter } from "@shared/components/sidebar-footer/sidebar-footer";
import { APP_ROUTES } from "@shared/constants/app-routes.constant";
import { APP_TEXTS } from "@shared/constants/app-texts.constant";
import { filter, map } from "rxjs";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgIcon, SidebarFooter, RouterLink],
  providers: [
    provideIcons({
      lucideCar,
      lucideLayoutDashboard,
      lucidePanelLeftClose,
      lucidePanelLeftOpen,
      lucideTicket,
    }),
  ],
  selector: "app-sidebar",
  styleUrl: "./sidebar.css",
  templateUrl: "./sidebar.html",
})
export class Sidebar implements OnInit {
  protected readonly homeUrl = APP_ROUTES.app.parkingLots;
  protected navItems = signal(
    APP_TEXTS.sidebar.nav.map((item) => ({ ...item, isActive: false }))
  );
  private route = inject(Router);
  private breakpointObserver = inject(BreakpointObserver);

  private isTablet = toSignal(
    this.breakpointObserver
      .observe(["(min-width: 768px) and (max-width: 1024px)"])
      .pipe(map((result) => result.matches)),
    {
      initialValue:
        typeof window !== "undefined" &&
        window.innerWidth <= 1024 &&
        window.innerWidth >= 768,
    }
  );

  protected collapsed = linkedSignal(() => this.isTablet() ?? false);

  ngOnInit(): void {
    this.setActiveItem(this.route.url.split("?", 1)[0]);

    this.route.events
      .pipe(
        filter(
          (event): event is NavigationEnd => event instanceof NavigationEnd
        )
      )
      .subscribe((event) => {
        this.setActiveItem(event.urlAfterRedirects);
      });
  }

  protected toggleCollapsed(): void {
    this.collapsed.update((v) => !v);
  }

  private setActiveItem(url: string) {
    this.navItems.update((items) =>
      items.map((item) => ({ ...item, isActive: item.url.includes(url) }))
    );
  }
}
