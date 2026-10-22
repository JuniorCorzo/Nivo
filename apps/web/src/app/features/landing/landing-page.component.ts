import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from "@angular/core";
import type { OnInit } from "@angular/core";
import { Router } from "@angular/router";
import type {
  SimulateRateRequest,
  SimulateRateResponse,
} from "@core/models/simulator.model";
import { SimulatorService } from "@core/services/simulator.service";

import { LandingBenefitsComponent } from "./components/landing-benefits.component";
import { LandingComparisonComponent } from "./components/landing-comparison.component";
import { LandingFooterComponent } from "./components/landing-footer.component";
import { LandingHeroComponent } from "./components/landing-hero.component";
import { LandingNavbarComponent } from "./components/landing-navbar.component";
import { LandingPricingComponent } from "./components/landing-pricing.component";
import { LandingSimulatorComponent } from "./components/landing-simulator.component";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    LandingNavbarComponent,
    LandingHeroComponent,
    LandingBenefitsComponent,
    LandingSimulatorComponent,
    LandingComparisonComponent,
    LandingPricingComponent,
    LandingFooterComponent,
  ],
  selector: "landing-page",
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
