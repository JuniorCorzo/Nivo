import type { ConnectedPosition } from "@angular/cdk/overlay";
import { OverlayModule } from "@angular/cdk/overlay";
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  HostListener,
  inject,
  input,
  signal,
} from "@angular/core";
import { UserService } from "@core/services/user/user-service";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucideChevronsUpDown } from "@ng-icons/lucide";
import { DividerComponent, TypographyMuted } from "@nivo-sass/design-system";
import { APP_TEXTS } from "@shared/constants/app-texts.constant";

import { LogoutButton } from "../logout-button/logout-button";
import { ThemeButton } from "../theme-button/theme-button";

export const USER_MENU_OVERLAY_POSITIONS: ConnectedPosition[] = [
  {
    originX: "start",
    originY: "top",
    overlayX: "start",
    overlayY: "bottom",
    offsetY: -8,
  },
  {
    originX: "end",
    originY: "top",
    overlayX: "end",
    overlayY: "bottom",
    offsetY: -8,
  },
  {
    originX: "start",
    originY: "bottom",
    overlayX: "start",
    overlayY: "top",
    offsetY: 8,
  },
  {
    originX: "end",
    originY: "bottom",
    overlayX: "end",
    overlayY: "top",
    offsetY: 8,
  },
];

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    OverlayModule,
    NgIcon,
    ThemeButton,
    LogoutButton,
    DividerComponent,
    TypographyMuted,
  ],
  providers: [provideIcons({ lucideChevronsUpDown })],
  selector: "app-user-menu",
  standalone: true,
  styleUrl: "./user-menu.css",
  templateUrl: "./user-menu.html",
})
export class UserMenu {
  readonly collapsed = input(false);
  readonly isOpen = signal(false);

  protected user = inject(UserService).currentUser;
  protected textsSidebar = APP_TEXTS.sidebar;
  protected userProfileImage = computed(() => {
    const name = this.user()?.fullName ?? "Invitado";
    return `https://ui-avatars.com/api/?name=${name.replaceAll(" ", "+")}`;
  });

  readonly overlayPositions: ConnectedPosition[] = USER_MENU_OVERLAY_POSITIONS;

  toggleOpen(): void {
    this.isOpen.update((open) => !open);
  }

  open(): void {
    this.isOpen.set(true);
  }

  close(): void {
    this.isOpen.set(false);
  }

  @HostListener("window:keydown", ["$event"])
  protected onKeydown(event: KeyboardEvent): void {
    if (event.key === "Escape" && this.isOpen()) {
      this.close();
    }
  }
}
