import { signal } from "@angular/core";
import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { provideRouter } from "@angular/router";
import type { ParkingLotListItemModel } from "@core/models/parking.model";
import { ActiveParkingService } from "@core/services/active-parking.service";
import { PageHeaderComponent } from "@shared/components/page-header/page-header";
import { APP_ROUTES } from "@shared/constants/app-routes.constant";

import { RateFormFacade } from "../../../facades/rate-form.facade";
import { RateFormComponent } from "./rate-form";

const mockParking: ParkingLotListItemModel = {
  address: { city: "", country: "", state: "", street: "", zipCode: "" },
  coordinates: { latitude: 0, longitude: 0 },
  createdAt: "",
  currency: "COP",
  id: "parking-123",
  name: "Parqueadero Central",
  occuppationRate: 0,
  ownerName: "Admin",
  slotDistribution: [],
  totalCapacity: 10,
  updatedAt: "",
};

describe("RateFormComponent", () => {
  let fixture: ComponentFixture<RateFormComponent>;
  let component: RateFormComponent;

  const mockFacade = {
    form: {
      description: signal("Descripción de prueba"),
      minChargeTimeMinutes: signal(15),
      name: signal("Tarifa Estándar"),
      pricePerUnit: signal(3000),
      specialPolicyId: signal<string | null>(null),
      timeUnit: signal("HOUR"),
      vehicleType: signal("CAR"),
    },
    isBlocked: signal(false),
    isSubmitting: signal(false),
    isValid: signal(true),
    mode: signal<"create" | "edit">("create"),
    parking: signal<ParkingLotListItemModel | null>(mockParking),
    previewDurationMinutes: signal(60),
    simulation: signal({
      appliedRuleType: "STANDARD",
      appliedSpecialPolicyName: null,
      baseFee: 3000,
      breakdown: [],
      chargedUnits: 1,
      currency: "COP",
      discountAmount: 0,
      durationMinutes: 60,
      hourlyRateApplied: 3000,
      isSpecialPolicyApplied: false,
      minimumChargeApplied: false,
      overstaySurcharge: 0,
      rateName: "Tarifa Estándar",
      rateSummary: "3000 / HOUR",
      roundingNotice: null,
      surchargeAmount: 0,
      timeUnit: "HOUR",
      totalAmount: 3000,
      vehicleType: "CAR",
    }),
    specialPolicies: signal([]),
    submit: vi.fn(),
  };

  beforeEach(async () => {
    mockFacade.mode.set("create");

    await TestBed.configureTestingModule({
      imports: [RateFormComponent],
      providers: [
        provideRouter([]),
        {
          provide: ActiveParkingService,
          useValue: { activeParkingName: signal("") },
        },
      ],
    })
      .overrideComponent(RateFormComponent, {
        set: {
          providers: [{ provide: RateFormFacade, useValue: mockFacade }],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(RateFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create RateFormComponent", () => {
    expect(component).toBeTruthy();
  });

  it("should render app-page-header with title, subtitle, icon, and breadcrumbs", () => {
    const headerDebugEl = fixture.debugElement.query(
      By.directive(PageHeaderComponent)
    );
    expect(headerDebugEl).toBeTruthy();

    // SAFETY: Querying component instance of PageHeaderComponent
    const headerInstance =
      headerDebugEl.componentInstance as PageHeaderComponent;
    expect(headerInstance.title()).toBe("Configurar nueva tarifa");
    expect(headerInstance.subtitle()).toBe(
      "Parqueadero Central — Definí el valor base y las condiciones de cobro"
    );
    expect(headerInstance.icon()).toBe("lucideCoins");
    expect(headerInstance.breadcrumbs()).toEqual([
      {
        icon: "lucideParkingSquare",
        label: "Parqueaderos",
        url: APP_ROUTES.app.parkingLots,
      },
      {
        icon: "lucideBuilding2",
        isParking: true,
        label: "Parqueadero Central",
        url: APP_ROUTES.app.parkingLots,
      },
      {
        icon: "lucideCoins",
        label: "Tarifas",
        url: APP_ROUTES.app.parkingLotRates("parking-123"),
      },
      { icon: "lucidePlus", label: "Nueva tarifa" },
    ]);
  });

  it("should project back to rates button in [actions] slot of page-header", () => {
    const headerDebugEl = fixture.debugElement.query(
      By.directive(PageHeaderComponent)
    );
    const actionsSlot = headerDebugEl.nativeElement.querySelector(
      '[data-testid="page-header-actions"]'
    );
    expect(actionsSlot).toBeTruthy();
    expect(actionsSlot.textContent).toContain("Volver a tarifas");
  });

  it("should compute breadcrumbs for edit mode", () => {
    mockFacade.mode.set("edit");
    fixture.detectChanges();

    expect(component.breadcrumbs()).toEqual([
      {
        icon: "lucideParkingSquare",
        label: "Parqueaderos",
        url: APP_ROUTES.app.parkingLots,
      },
      {
        icon: "lucideBuilding2",
        isParking: true,
        label: "Parqueadero Central",
        url: APP_ROUTES.app.parkingLots,
      },
      {
        icon: "lucideCoins",
        label: "Tarifas",
        url: APP_ROUTES.app.parkingLotRates("parking-123"),
      },
      { icon: "lucideEdit", label: "Editar tarifa" },
    ]);
  });
});
