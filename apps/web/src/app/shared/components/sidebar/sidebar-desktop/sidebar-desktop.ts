import { BreakpointObserver } from "@angular/cdk/layout";
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  linkedSignal,
} from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { RouterLink } from "@angular/router";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucidePanelLeftClose, lucidePanelLeftOpen } from "@ng-icons/lucide";
import { ButtonComponent } from "@nivo-sass/design-system";
import { APP_ROUTES } from "@shared/constants/app-routes.constant";
import { map } from "rxjs";

import { SidebarBase } from "../sidebar-base/sidebar-base";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgIcon, RouterLink, SidebarBase, ButtonComponent],
  providers: [
    provideIcons({
      lucidePanelLeftClose,
      lucidePanelLeftOpen,
    }),
  ],
  selector: "app-sidebar-desktop",
  styleUrl: "./sidebar-desktop.css",
  templateUrl: "./sidebar-desktop.html",
})
export class SidebarDesktop {
  protected readonly homeUrl = APP_ROUTES.app.parkingLots;
  private readonly breakpointObserver = inject(BreakpointObserver);

  private readonly isTablet = toSignal(
    this.breakpointObserver
      .observe(["(min-width: 768px) and (max-width: 1024px)"])
      .pipe(map((result) => result.matches)),
    {
      initialValue: false,
    }
  );

  public readonly collapsed = linkedSignal(() => this.isTablet() ?? false);

  public toggleCollapsed(): void {
    this.collapsed.update((v) => !v);
  }
}
