import { ChangeDetectionStrategy, Component, output } from "@angular/core";
import { RouterLink } from "@angular/router";
import { NgIcon } from "@ng-icons/core";
import { ButtonComponent } from "@nivo-sass/design-system";
import { APP_TEXTS } from "@shared/constants/app-texts.constant";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, NgIcon, ButtonComponent],
  selector: "landing-navbar",
  standalone: true,
  templateUrl: "./landing-navbar.component.html",
})
export class LandingNavbarComponent {
  protected readonly texts = APP_TEXTS.landing.navbar;

  readonly loginClick = output();
  readonly registerClick = output();
}
