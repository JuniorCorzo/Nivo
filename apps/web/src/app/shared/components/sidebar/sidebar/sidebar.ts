import { BreakpointObserver } from "@angular/cdk/layout";
import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { map } from "rxjs";

import { SidebarDesktop } from "../sidebar-desktop/sidebar-desktop";
import { SidebarMobile } from "../sidebar-mobile/sidebar-mobile";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SidebarMobile, SidebarDesktop],
  selector: "app-sidebar",
  styleUrl: "./sidebar.css",
  templateUrl: "./sidebar.html",
})
export class Sidebar {
  private readonly breakpointObserver = inject(BreakpointObserver);

  public readonly isMobile = toSignal(
    this.breakpointObserver
      .observe(["(max-width: 767.98px)"])
      .pipe(map((result) => result.matches)),
    { initialValue: false }
  );
}
