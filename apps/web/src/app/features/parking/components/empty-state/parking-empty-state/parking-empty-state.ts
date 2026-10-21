import { ChangeDetectionStrategy, Component, output } from "@angular/core";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucideParkingSquare, lucidePlus } from "@ng-icons/lucide";
import {
  ButtonComponent,
  TypographyH2,
  TypographyP,
} from "@nivo-sass/design-system";
import { APP_TEXTS } from "@shared/constants/app-texts.constant";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgIcon, ButtonComponent, TypographyH2, TypographyP],
  providers: [
    provideIcons({
      lucideParkingSquare,
      lucidePlus,
    }),
  ],
  selector: "app-parking-empty-state",
  standalone: true,
  templateUrl: "./parking-empty-state.html",
})
export class ParkingEmptyState {
  protected readonly LABELS = APP_TEXTS.parking;

  public readonly create = output();

  public onCreate(): void {
    this.create.emit();
  }
}
