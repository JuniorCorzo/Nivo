import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";
import { RateService } from "@core/services/rate-service";
import { ToastService } from "@nivo-sass/design-system";
import { of, throwError } from "rxjs";

import { SpecialPolicyModalComponent } from "./special-policy-modal";

interface MockRateService {
  createSpecialPolicy: ReturnType<typeof vi.fn>;
}

interface MockToastService {
  showToast: ReturnType<typeof vi.fn>;
}

describe("SpecialPolicyModalComponent", () => {
  let component: SpecialPolicyModalComponent;
  let fixture: ComponentFixture<SpecialPolicyModalComponent>;
  let mockRateService: MockRateService;
  let mockToastService: MockToastService;

  beforeEach(async () => {
    mockRateService = {
      createSpecialPolicy: vi.fn(),
    };
    mockToastService = {
      showToast: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [SpecialPolicyModalComponent],
      providers: [
        { provide: RateService, useValue: mockRateService },
        { provide: ToastService, useValue: mockToastService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SpecialPolicyModalComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput("isOpen", true);
    fixture.detectChanges();
  });

  it("should create component and initialize with default Lavado preset", () => {
    expect(component).toBeTruthy();
    expect(component.form.controls.name.value).toBe(
      "Tarifa de Lavado Ecológico"
    );
    expect(component.form.controls.modifies.value).toBe("SURCHARGE");
    expect(component.form.controls.operation.value).toBe("SET");
    expect(component.form.controls.valueToModify.value).toBe(18_000);
  });

  it("should switch values when selecting a different preset", () => {
    const convenioPreset = component.presets.find(
      (p) => p.id === "convenio-discount"
    );
    expect(convenioPreset).toBeDefined();

    if (convenioPreset) {
      component.applyPreset(convenioPreset);
      expect(component.selectedPresetId()).toBe("convenio-discount");
      expect(component.form.controls.modifies.value).toBe("DISCOUNT");
      expect(component.form.controls.operation.value).toBe("PERCENTAGE");
      expect(component.form.controls.valueToModify.value).toBe(15);
      expect(component.previewText()).toBe("-15% Descuento");
    }
  });

  it("should emit closed when onCancel is called", () => {
    const closedSpy = vi.fn();
    component.closed.subscribe(closedSpy);

    component.onCancel();
    expect(closedSpy).toHaveBeenCalled();
  });

  it("should submit valid form and emit policyCreated on success", () => {
    const policySpy = vi.fn();
    const closedSpy = vi.fn();
    component.policyCreated.subscribe(policySpy);
    component.closed.subscribe(closedSpy);

    mockRateService.createSpecialPolicy.mockReturnValue(
      of({
        active: true,
        id: "new-sp-1",
        modifies: "SURCHARGE",
        name: "Tarifa de Lavado Ecológico",
        operation: "SET",
        valueToModify: 18_000,
      })
    );

    component.onSubmit();

    expect(mockRateService.createSpecialPolicy).toHaveBeenCalledWith({
      modifies: "SURCHARGE",
      name: "Tarifa de Lavado Ecológico",
      operation: "SET",
      valueToModify: 18_000,
    });
    expect(mockToastService.showToast).toHaveBeenCalledWith({
      message: "Política especial creada con éxito",
      type: "success",
    });
    expect(policySpy).toHaveBeenCalled();
    expect(closedSpy).toHaveBeenCalled();
  });

  it("should show error toast on creation failure", () => {
    mockRateService.createSpecialPolicy.mockReturnValue(
      throwError(() => new Error("Network error"))
    );

    component.onSubmit();

    expect(mockToastService.showToast).toHaveBeenCalledWith({
      message: "Error al crear la política especial",
      type: "error",
    });
    expect(component.isSubmitting()).toBe(false);
  });
});
