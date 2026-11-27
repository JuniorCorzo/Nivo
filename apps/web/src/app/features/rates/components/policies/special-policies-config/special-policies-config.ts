import { CommonModule } from "@angular/common";
import type { OnInit } from "@angular/core";
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  signal,
} from "@angular/core";
import type { ParkingLotListItemModel } from "@core/models/parking.model";
import type {
  RatePolicyTarget,
  SpecialPolicyModel,
} from "@core/models/rate.model";
import { RateService } from "@core/services/rate-service";
import { NgIcon, provideIcons } from "@ng-icons/core";
import {
  lucideAlertTriangle,
  lucideClock,
  lucideCoins,
  lucidePercent,
  lucidePlus,
  lucideReceipt,
  lucideShieldCheck,
  lucideSparkles,
  lucideTimer,
} from "@ng-icons/lucide";
import {
  ButtonComponent,
  CardComponent,
  TypographyH3,
  TypographyMono,
  TypographyMuted,
} from "@nivo-sass/design-system";

import { SpecialPolicyModalComponent } from "../special-policy-modal/special-policy-modal";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ButtonComponent,
    CardComponent,
    CommonModule,
    NgIcon,
    SpecialPolicyModalComponent,
    TypographyH3,
    TypographyMono,
    TypographyMuted,
  ],
  providers: [
    provideIcons({
      lucideAlertTriangle,
      lucideClock,
      lucideCoins,
      lucidePercent,
      lucidePlus,
      lucideReceipt,
      lucideShieldCheck,
      lucideSparkles,
      lucideTimer,
    }),
  ],
  selector: "app-special-policies-config",
  standalone: true,
  templateUrl: "./special-policies-config.html",
})
export class SpecialPoliciesConfigComponent implements OnInit {
  private readonly rateService = inject(RateService);

  readonly parkingId = input<string | null>(null);
  readonly parking = input<ParkingLotListItemModel | null>(null);

  readonly policies = this.rateService.specialPolicies;
  readonly isModalOpen = signal<boolean>(false);

  readonly overstayThresholdMinutes = 480;
  readonly overstaySurcharge = 5000;

  readonly gracePeriodMinutes = computed(
    () => this.parking()?.gracePeriodMinutes ?? 15
  );
  readonly gracePeriodPrice = computed(
    () => this.parking()?.gracePeriodPrice ?? 0
  );
  readonly ivaRate = computed(() => this.parking()?.ivaRate ?? 0.19);

  readonly isGraceFree = computed(() => this.gracePeriodPrice() === 0);

  readonly formattedOverstayThreshold = computed(() => {
    const mins = this.overstayThresholdMinutes;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    const hStr = h < 10 ? `0${h}` : `${h}`;
    const mStr = m < 10 ? `0${m}` : `${m}`;
    return `${hStr}h ${mStr}m`;
  });

  readonly overstayThresholdHours = computed(() =>
    Math.floor(this.overstayThresholdMinutes / 60).toString()
  );

  readonly formattedOverstaySurcharge = computed(
    () => `$${this.overstaySurcharge.toLocaleString("es-CO")} COP`
  );

  readonly formattedGracePrice = computed(() =>
    this.gracePeriodPrice() > 0
      ? `$${this.gracePeriodPrice().toLocaleString("es-CO")} COP`
      : "Gratis ($0)"
  );

  readonly formattedIva = computed(() => {
    const rate = this.ivaRate();
    return `${(rate * 100).toFixed(0)}%`;
  });

  ngOnInit(): void {
    this.rateService.loadSpecialPolicies().subscribe();
  }

  openModal(): void {
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
  }

  onPolicyCreated(): void {
    this.rateService.loadSpecialPolicies(true).subscribe();
  }

  formatPolicyType(modifies: RatePolicyTarget): string {
    switch (modifies) {
      case "SURCHARGE": {
        return "Recargo adicional";
      }
      case "DISCOUNT": {
        return "Descuento comercial";
      }
      case "PRICE": {
        return "Tarifa fija";
      }
      case "TIME": {
        return "Ajuste de tiempo";
      }
      default: {
        return modifies;
      }
    }
  }

  formatPolicyEffect(policy: SpecialPolicyModel): string {
    if (policy.operation === "PERCENTAGE") {
      return policy.modifies === "SURCHARGE"
        ? `+${policy.valueToModify}% Recargo`
        : `-${policy.valueToModify}% Descuento`;
    }
    if (policy.operation === "SUBTRACT") {
      return policy.modifies === "SURCHARGE"
        ? `+$${policy.valueToModify.toLocaleString("es-CO")} COP`
        : `-$${policy.valueToModify.toLocaleString("es-CO")} COP`;
    }
    if (policy.modifies === "PRICE" || policy.modifies === "DISCOUNT") {
      return `$${policy.valueToModify.toLocaleString("es-CO")} COP`;
    }
    return `+$${policy.valueToModify.toLocaleString("es-CO")} COP`;
  }
}
