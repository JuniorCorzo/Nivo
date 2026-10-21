import { CommonModule, DecimalPipe } from "@angular/common";
import type { OnInit } from "@angular/core";
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from "@angular/core";
import { Router, RouterLink } from "@angular/router";
import type {
  SimulateRateRequest,
  SimulateRateResponse,
} from "@core/models/simulator.model";
import { SimulatorService } from "@core/services/simulator.service";
import { NgIcon, provideIcons } from "@ng-icons/core";
import {
  lucideAlertCircle,
  lucideArrowRight,
  lucideBadgeCheck,
  lucideBike,
  lucideCalculator,
  lucideCar,
  lucideCheck,
  lucideCheckCircle2,
  lucideClock,
  lucideMotorbike,
  lucideQrCode,
  lucideReceipt,
  lucideShieldCheck,
  lucideSmartphone,
  lucideSparkles,
  lucideXCircle,
  lucideZap,
} from "@ng-icons/lucide";
import {
  BadgeComponent,
  ButtonComponent,
  CardComponent,
  CardContentComponent,
  CardDescriptionComponent,
  CardHeaderComponent,
  CardTitleComponent,
  TypographyH1,
  TypographyH2,
  TypographyH3,
  TypographyH4,
  TypographyMuted,
  TypographyP,
} from "@nivo-sass/design-system";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    DecimalPipe,
    RouterLink,
    NgIcon,
    ButtonComponent,
    CardComponent,
    CardHeaderComponent,
    CardTitleComponent,
    CardDescriptionComponent,
    CardContentComponent,
    BadgeComponent,
    TypographyH1,
    TypographyH2,
    TypographyH3,
    TypographyH4,
    TypographyP,
    TypographyMuted,
  ],
  providers: [
    provideIcons({
      lucideAlertCircle,
      lucideArrowRight,
      lucideBadgeCheck,
      lucideBike,
      lucideCalculator,
      lucideCar,
      lucideCheck,
      lucideCheckCircle2,
      lucideClock,
      lucideMotorbike,
      lucideQrCode,
      lucideReceipt,
      lucideShieldCheck,
      lucideSmartphone,
      lucideSparkles,
      lucideXCircle,
      lucideZap,
    }),
  ],
  selector: "app-landing-page",
  standalone: true,
  templateUrl: "./landing-page.component.html",
})
export class LandingPageComponent implements OnInit {
  private readonly simulatorService = inject(SimulatorService);
  private readonly router = inject(Router);

  readonly vehicleType = signal<"CAR" | "MOTORCYCLE" | "BIKE">("CAR");
  readonly minutesStayed = signal<number>(90);
  readonly pricePerUnit = signal<number>(4000);
  readonly gracePeriodMinutes = signal<number>(15);
  readonly ivaRate = signal<number>(0.19);

  readonly simulationResult = signal<SimulateRateResponse | null>(null);
  readonly isCalculating = signal<boolean>(false);

  readonly durationPresets = [
    { label: "30 min", value: 30 },
    { label: "1 hora", value: 60 },
    { label: "1.5 horas", value: 90 },
    { label: "2 horas", value: 120 },
    { label: "3 horas", value: 180 },
    { label: "5 horas", value: 300 },
  ];

  ngOnInit(): void {
    this.calculateRate();
  }

  selectVehicle(type: "CAR" | "MOTORCYCLE" | "BIKE"): void {
    this.vehicleType.set(type);
    if (type === "CAR") {
      this.pricePerUnit.set(4000);
    } else if (type === "MOTORCYCLE") {
      this.pricePerUnit.set(2000);
    } else {
      this.pricePerUnit.set(1000);
    }
    this.calculateRate();
  }

  setDuration(minutes: number): void {
    this.minutesStayed.set(Math.max(1, minutes));
    this.calculateRate();
  }

  onMinutesInputChange(event: Event): void {
    /* SAFETY: event.target is bound to HTMLInputElement on input change */
    const input = event.target as HTMLInputElement;
    const value = Math.trunc(Number(input.value));
    if (!Number.isNaN(value) && value > 0) {
      this.minutesStayed.set(value);
      this.calculateRate();
    }
  }

  calculateRate(): void {
    this.isCalculating.set(true);

    const request: SimulateRateRequest = {
      gracePeriodMinutes: this.gracePeriodMinutes(),
      ivaRate: this.ivaRate(),
      minutesStayed: this.minutesStayed(),
      pricePerUnit: this.pricePerUnit(),
      timeUnit: "HOURS",
      vehicleType: this.vehicleType(),
    };

    this.simulatorService.calculate(request).subscribe({
      error: () => {
        this.fallbackCalculation(request);
        this.isCalculating.set(false);
      },
      next: (res) => {
        this.simulationResult.set(res);
        this.isCalculating.set(false);
      },
    });
  }

  private fallbackCalculation(request: SimulateRateRequest): void {
    const price = request.pricePerUnit ?? 4000;
    const grace = request.gracePeriodMinutes ?? 15;
    const minutes = request.minutesStayed;

    let subtotal = 0;
    if (minutes > grace) {
      const hours = Math.ceil(minutes / 60);
      subtotal = hours * price;
    }
    const ivaRate = request.ivaRate ?? 0.19;
    const ivaAmount = Math.round(subtotal * ivaRate);
    const total = subtotal + ivaAmount;

    this.simulationResult.set({
      breakpoints: [
        {
          amount: subtotal,
          concept: `Tarifa ${request.vehicleType} (${Math.ceil(minutes / 60)} Horas * ${price} COP/Horas)`,
        },
      ],
      ivaAmount,
      ivaRate,
      name: "Simulador Nivo",
      subtotal,
      total,
    });
  }

  scrollToSimulator(): void {
    this.router.navigate([], { fragment: "simulador" });
    const element = document.querySelector("#simulador");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  }

  goToLogin(): void {
    this.router.navigate(["/auth/login"]);
  }

  goToRegister(): void {
    this.router.navigate(["/auth/register"]);
  }
}
