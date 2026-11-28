import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";
import { RateService } from "@core/services/rate-service";
import { ToastService } from "@nivo-sass/design-system";
import { EMPTY, of, throwError } from "rxjs";

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

  it("should enforce max 100 validation when operation is PERCENTAGE", () => {
    component.onOperationChange("PERCENTAGE");
    component.form.controls.valueToModify.setValue(120);

    expect(component.form.controls.valueToModify.invalid).toBe(true);
    expect(component.form.controls.valueToModify.errors?.["max"]).toBeDefined();
    expect(component.valueLabel()).toBe("Porcentaje a Aplicar (%)");

    component.form.controls.valueToModify.setValue(25);
    expect(component.form.controls.valueToModify.valid).toBe(true);

    component.onOperationChange("SET");
    component.form.controls.valueToModify.setValue(50_000);
    expect(component.form.controls.valueToModify.valid).toBe(true);
    expect(component.valueLabel()).toBe("Monto a Aplicar ($ COP)");
  });

  it("should restrict operation options per target and auto-switch incompatible operation", () => {
    // Default is SURCHARGE -> SET & PERCENTAGE only (no SUBTRACT)
    expect(component.operationOptions().map((o) => o.value)).toEqual([
      "SET",
      "PERCENTAGE",
    ]);

    // Switching to DISCOUNT from SURCHARGE+SET auto-switches to SUBTRACT
    component.onModifiesChange("DISCOUNT");
    expect(component.operationOptions().map((o) => o.value)).toEqual([
      "PERCENTAGE",
      "SUBTRACT",
    ]);
    expect(component.form.controls.operation.value).toBe("SUBTRACT");

    // Switching to PRICE from DISCOUNT+SUBTRACT keeps SUBTRACT and exposes SET, PERCENTAGE, SUBTRACT
    component.onModifiesChange("PRICE");
    expect(component.operationOptions().map((o) => o.value)).toEqual([
      "SET",
      "PERCENTAGE",
      "SUBTRACT",
    ]);
    expect(component.form.controls.operation.value).toBe("SUBTRACT");
  });

  it("should support selecting, previewing, and submitting every backend-supported (target, operation) pair", () => {
    const cases = [
      {
        expectedDiscount: false,
        expectedPreview: "+$18.000 COP",
        modifies: "SURCHARGE" as const,
        operation: "SET" as const,
        value: 18_000,
      },
      {
        expectedDiscount: false,
        expectedPreview: "+15% Recargo",
        modifies: "SURCHARGE" as const,
        operation: "PERCENTAGE" as const,
        value: 15,
      },
      {
        expectedDiscount: true,
        expectedPreview: "-$2.000 COP",
        modifies: "DISCOUNT" as const,
        operation: "SUBTRACT" as const,
        value: 2000,
      },
      {
        expectedDiscount: true,
        expectedPreview: "-20% Descuento",
        modifies: "DISCOUNT" as const,
        operation: "PERCENTAGE" as const,
        value: 20,
      },
      {
        expectedDiscount: false,
        expectedPreview: "$15.000 COP",
        modifies: "PRICE" as const,
        operation: "SET" as const,
        value: 15_000,
      },
      {
        expectedDiscount: true,
        expectedPreview: "-$3.000 COP",
        modifies: "PRICE" as const,
        operation: "SUBTRACT" as const,
        value: 3000,
      },
      {
        expectedDiscount: true,
        expectedPreview: "-25% Descuento",
        modifies: "PRICE" as const,
        operation: "PERCENTAGE" as const,
        value: 25,
      },
      {
        expectedDiscount: false,
        expectedPreview: "2 unidad(es)",
        modifies: "TIME" as const,
        operation: "SET" as const,
        value: 2,
      },
      {
        expectedDiscount: true,
        expectedPreview: "-1 unidad(es)",
        modifies: "TIME" as const,
        operation: "SUBTRACT" as const,
        value: 1,
      },
      {
        expectedDiscount: true,
        expectedPreview: "-50% tiempo",
        modifies: "TIME" as const,
        operation: "PERCENTAGE" as const,
        value: 50,
      },
    ];

    for (const testCase of cases) {
      mockRateService.createSpecialPolicy.mockClear();
      mockRateService.createSpecialPolicy.mockReturnValue(
        of({
          active: true,
          id: "sp-test",
          modifies: testCase.modifies,
          name: "Política Test",
          operation: testCase.operation,
          valueToModify: testCase.value,
        })
      );

      component.onModifiesChange(testCase.modifies);
      component.onOperationChange(testCase.operation);
      component.form.controls.name.setValue("Política Test");
      component.form.controls.valueToModify.setValue(testCase.value);

      expect(component.form.controls.modifies.value).toBe(testCase.modifies);
      expect(component.form.controls.operation.value).toBe(testCase.operation);
      expect(component.previewText()).toBe(testCase.expectedPreview);
      expect(component.previewIsDiscount()).toBe(testCase.expectedDiscount);

      component.onSubmit();
      expect(mockRateService.createSpecialPolicy).toHaveBeenCalledWith({
        modifies: testCase.modifies,
        name: "Política Test",
        operation: testCase.operation,
        valueToModify: testCase.value,
      });
    }
  });

  it("should reject whitespace-only name and prevent submission", () => {
    component.form.controls.name.setValue("   ");
    expect(component.form.controls.name.invalid).toBe(true);
    expect(component.form.invalid).toBe(true);

    component.onSubmit();
    expect(mockRateService.createSpecialPolicy).not.toHaveBeenCalled();
  });

  it("should reset form and selectedPresetId on cancel and reset isSubmitting if observable completes without emitting", () => {
    component.onModifiesChange("TIME");
    expect(component.selectedPresetId()).toBe("custom");
    expect(component.valueLabel()).toBe("Unidades de tiempo (según tarifa)");
    expect(component.operationOptions().map((o) => o.label)).toEqual([
      "Tiempo fijo (unidades de tarifa)",
      "Porcentaje de tiempo (%)",
      "Deducción de tiempo (-unidades)",
    ]);

    component.onCancel();
    expect(component.selectedPresetId()).toBe("lavado-service");
    expect(component.form.controls.modifies.value).toBe("SURCHARGE");

    mockRateService.createSpecialPolicy.mockReturnValueOnce(EMPTY);
    component.onSubmit();
    expect(component.isSubmitting()).toBe(false);
  });

  it("should match backend billing semantics in previewText for flat PRICE, DISCOUNT, and SURCHARGE", () => {
    component.onModifiesChange("PRICE");
    component.form.controls.valueToModify.setValue(15_000);
    expect(component.previewText()).toBe("$15.000 COP");

    component.onModifiesChange("DISCOUNT");
    component.onOperationChange("SUBTRACT");
    component.form.controls.valueToModify.setValue(2000);
    expect(component.previewText()).toBe("-$2.000 COP");

    component.onModifiesChange("SURCHARGE");
    component.onOperationChange("PERCENTAGE");
    component.form.controls.valueToModify.setValue(15);
    expect(component.previewText()).toBe("+15% Recargo");
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
