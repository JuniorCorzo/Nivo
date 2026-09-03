import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from "@angular/core";
import type { ParkingLotListItemModel } from "@core/models/parking.model";
import {
  BadgeComponent,
  CardComponent,
  TypographyH2,
  TypographyMono,
  TypographyMuted,
} from "@nivo-sass/design-system";
import { APP_TEXTS } from "@shared/constants/app-texts.constant";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    BadgeComponent,
    CardComponent,
    TypographyH2,
    TypographyMuted,
    TypographyMono,
  ],
  selector: "app-parking-general-info",
  standalone: true,
  templateUrl: "./parking-general-info.html",
})
export class ParkingGeneralInfo {
  protected readonly LABELS_DETAIL = APP_TEXTS.parking.detail;

  public readonly parking = input.required<ParkingLotListItemModel>();

  public readonly addressLine = computed<string>(() => {
    const p = this.parking();
    if (!p || !p.address) {
      return "";
    }
    const { street, city, state } = p.address;
    return [street, city, state].filter(Boolean).join(", ");
  });

  public readonly addressSubline = computed<string>(() => {
    const p = this.parking();
    if (!p || !p.address) {
      return "";
    }
    const { country, zipCode } = p.address;
    return [country, zipCode].filter(Boolean).join(" · ");
  });

  public readonly formattedCoords = computed<string>(() => {
    const p = this.parking();
    if (!p || !p.coordinates) {
      return "";
    }
    return `${p.coordinates.latitude}, ${p.coordinates.longitude}`;
  });

  public static formattedDate(dateStr: string): string {
    if (!dateStr) {
      return "";
    }
    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) {
      return dateStr;
    }
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${day}/${month}/${year} · ${hours}:${minutes}`;
  }

  public readonly formattedDate = ParkingGeneralInfo.formattedDate;
}
