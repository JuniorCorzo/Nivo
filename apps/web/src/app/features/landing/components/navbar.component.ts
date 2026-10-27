import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  signal,
} from "@angular/core";
import { RouterLink } from "@angular/router";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucideMenu, lucideX } from "@ng-icons/lucide";
import { ButtonComponent } from "@nivo-sass/design-system";
import { APP_TEXTS } from "@shared/constants/app-texts.constant";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, NgIcon, ButtonComponent],
  providers: [
    provideIcons({
      lucideMenu,
      lucideX,
    }),
  ],
  selector: "app-navbar",
  standalone: true,
  templateUrl: "./navbar.component.html",
})
export class NavbarComponent {
  protected readonly texts = APP_TEXTS.landing.navbar;

  readonly accountCreationEnabled = input<boolean>(false);
  readonly isMobileMenuOpen = signal(false);

  readonly loginClick = output();
  readonly registerClick = output();

  toggleMobileMenu(): void {
    this.isMobileMenuOpen.update((v) => !v);
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen.set(false);
  }
}

export { NavbarComponent as LandingNavbarComponent };
