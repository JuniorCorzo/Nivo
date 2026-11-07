import { signal } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import type { ParkingLotListItemModel } from "@core/models/parking.model";
import type { SpecialPolicyModel } from "@core/models/rate.model";
import { RateService } from "@core/services/rate-service";
import { ToastService } from "@nivo-sass/design-system";
import { of } from "rxjs";

import { SpecialPoliciesConfigComponent } from "./special-policies-config";

describe("SpecialPoliciesConfigComponent", () => {
  let component: SpecialPoliciesConfigComponent;
  let fixture: ComponentFixture<SpecialPoliciesConfigComponent>;
  let mockRateService: {
    specialPolicies: ReturnType<typeof signal<SpecialPolicyModel[]>>;
    loadSpecialPolicies: ReturnType<typeof vi.fn>;
    createSpecialPolicy: ReturnType<typeof vi.fn>;
  };
  let mockToastService: { showToast: ReturnType<typeof vi.fn> };

  const mockPolicies: SpecialPolicyModel[] = [
    {
      active: true,
      id: "sp-1",
      modifies: "SURCHARGE",
      name: "Tarifa de Lavado Ecológico",
      operation: "SET",
      valueToModify: 18000,
    },
    {
      active: true,
      id: "sp-2",
      modifies: "DISCOUNT",
      name: "Convenio Gimnasio",
      operation: "PERCENTAGE",
      valueToModify: 15,
    },
  ];

  const mockParking: ParkingLotListItemModel = {
    address: {
      city: "Bogotá",
      country: "Colombia",
      state: "Cundinamarca",
      street: "Calle 100 # 15-20",
      zipCode: "110111",
    },
    coordinates: { latitude: 4.68, longitude: -74.05 },
    createdAt: "2024-01-01T00:00:00Z",
    currency: "COP",
    gracePeriodMinutes: 15,
    gracePeriodPrice: 0,
    id: "parking-1",
    ivaRate: 0.19,
    name: "Parqueadero Centro",
    occuppationRate: 45,
    operatingHours: { closeTime: "22:00", openTime: "06:00" },
    ownerName: "Owner Test",
    slotDistribution: [],
    totalCapacity: 50,
    updatedAt: "2024-01-01T00:00:00Z",
  };

  beforeEach(async () => {
    mockRateService = {
      createSpecialPolicy: vi.fn(),
      loadSpecialPolicies: vi.fn().mockReturnValue(of(mockPolicies)),
      specialPolicies: signal<SpecialPolicyModel[]>(mockPolicies),
    };
    mockToastService = {
      showToast: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [SpecialPoliciesConfigComponent],
      providers: [
        { provide: RateService, useValue: mockRateService },
        { provide: ToastService, useValue: mockToastService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SpecialPoliciesConfigComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput("parking", mockParking);
    fixture.detectChanges();
  });

  it("should create component and load special policies on init", () => {
    expect(component).toBeTruthy();
    expect(mockRateService.loadSpecialPolicies).toHaveBeenCalled();
  });

  it("should render ParkingLotPolicy sede metrics ribbon", () => {
    /* SAFETY: fixture.nativeElement is guaranteed to be an HTMLElement in test environment */
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain(
      "Parámetros de Liquidación de Sede (ParkingLotPolicy)"
    );
    expect(el.textContent).toContain("08h 00m");
    expect(el.textContent).toContain("$5.000 COP");
    expect(el.textContent).toContain("15 min");
    expect(el.textContent).toContain("19%");
  });

  it("should toggle overstay editing and update threshold and surcharge signals", () => {
    expect(component.isEditingOverstay()).toBe(false);

    component.toggleEditOverstay();
    expect(component.isEditingOverstay()).toBe(true);

    const select = document.createElement("select");
    const option = document.createElement("option");
    option.value = "600";
    select.appendChild(option);
    select.value = "600";
    const selectEvent = new Event("change");
    Object.defineProperty(selectEvent, "target", { value: select });
    component.onThresholdChange(selectEvent);
    expect(component.overstayThresholdMinutes()).toBe(600);
    expect(component.formattedOverstayThreshold()).toBe("10h 00m");

    const input = document.createElement("input");
    input.value = "8000";
    const inputEvent = new Event("input");
    Object.defineProperty(inputEvent, "target", { value: input });
    component.onSurchargeChange(inputEvent);
    expect(component.overstaySurcharge()).toBe(8_000);
    expect(component.formattedOverstaySurcharge()).toBe("$8.000 COP");
  });

  it("should render special policies list with clear formatting", () => {
    /* SAFETY: fixture.nativeElement is guaranteed to be an HTMLElement in test environment */
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain("Tarifa de Lavado Ecológico");
    expect(el.textContent).toContain("Recargo adicional");
    expect(el.textContent).toContain("+$18.000 COP");
    expect(el.textContent).toContain("Convenio Gimnasio");
    expect(el.textContent).toContain("Descuento comercial");
    expect(el.textContent).toContain("-15% Descuento");
  });

  it("should open and close special policy modal", () => {
    expect(component.isModalOpen()).toBe(false);

    component.openModal();
    expect(component.isModalOpen()).toBe(true);

    component.closeModal();
    expect(component.isModalOpen()).toBe(false);
  });

  it("should reload policies when onPolicyCreated is called", () => {
    mockRateService.loadSpecialPolicies.mockClear();
    component.onPolicyCreated();
    expect(mockRateService.loadSpecialPolicies).toHaveBeenCalled();
  });

  it("should show empty state when no special policies exist", () => {
    mockRateService.specialPolicies.set([]);
    fixture.detectChanges();

    /* SAFETY: fixture.nativeElement is guaranteed to be an HTMLElement in test environment */
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain(
      "No hay políticas especiales configuradas"
    );
  });
});
