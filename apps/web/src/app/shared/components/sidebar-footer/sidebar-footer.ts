import { ChangeDetectionStrategy, Component, input } from "@angular/core";

import { LogoutButton } from "../logout-button/logout-button";
import { ThemeButton } from "../theme-button/theme-button";
import { UserMenu } from "../user-menu/user-menu";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [UserMenu, ThemeButton, LogoutButton],
  selector: "app-sidebar-footer",
  styleUrl: "./sidebar-footer.css",
  templateUrl: "./sidebar-footer.html",
})
export class SidebarFooter {
  readonly collapsed = input(false);
}
