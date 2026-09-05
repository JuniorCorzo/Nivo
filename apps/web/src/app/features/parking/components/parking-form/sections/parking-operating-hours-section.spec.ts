import { Component, signal } from "@angular/core";
import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";
import type { FieldTree, ValidationError } from "@angular/forms/signals";
import { form, pattern, required } from "@angular/forms/signals";
import type { OperatingHours } from "@core/type/operating-hours.type";

import { ParkingOperatingHoursSectionComponent } from "./parking-operating-hours-section";

interface MockFieldTreeSignal {
  errors: () => ValidationError.WithFieldTree[] | null;
  invalid: () => boolean;
  touched: () => boolean;
}

interface ParkingOperatingHoursStatic {
  getError: (
    field: (() => MockFieldTreeSignal) | FieldTree<string, string>
  ) => ValidationError.WithFieldTree[] | undefined;
}

@Component({
  imports: [ParkingOperatingHoursSectionComponent],
  standalone: true,
  template: `
    <app-parking-operating-hours-section
      [operatingHours]="operatingHoursForm"
    />
  `,
})
class TestHostComponent {
  public hoursModel = signal<OperatingHours>({
    closeTime: "20:00",
    openTime: "08:00",
  });

  public operatingHoursForm = form(this.hoursModel, (path) => {
    required(path.openTime, { message: "openTime required" });
    pattern(
      path.openTime,
      /^(?<hours>[0-1]?[0-9]|2[0-3]):(?<minutes>[0-5][0-9])$/u,
      {
        message: "invalid openTime format",
      }
    );
    required(path.closeTime, { message: "closeTime required" });
    pattern(
      path.closeTime,
      /^(?<hours>[0-1]?[0-9]|2[0-3]):(?<minutes>[0-5][0-9])$/u,
      {
        message: "invalid closeTime format",
      }
    );
  });
}

const createMockField =
  (
    touched: boolean,
    invalid: boolean,
    errors: ValidationError.WithFieldTree[] | null
  ): (() => MockFieldTreeSignal) =>
  () => ({
    errors: () => errors,
    invalid: () => invalid,
    touched: () => touched,
  });

describe("ParkingOperatingHoursSectionComponent", () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let hostComponent: TestHostComponent;
  let component: ParkingOperatingHoursSectionComponent;
  let staticHelpers: ParkingOperatingHoursStatic;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent, ParkingOperatingHoursSectionComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    hostComponent = fixture.componentInstance;
    fixture.detectChanges();
    /* SAFETY: Querying child ParkingOperatingHoursSectionComponent instance */
    component = fixture.debugElement.children[0]
      .componentInstance as ParkingOperatingHoursSectionComponent;
    /* SAFETY: Accessing static helper getError */
    staticHelpers = ParkingOperatingHoursSectionComponent as never;
  });

  it("should create the component instance", () => {
    expect(component).toBeTruthy();
  });

  it("should render section title and description", () => {
    const textContent = fixture.nativeElement.textContent || "";
    expect(textContent).toContain("Horario de operación");
    expect(textContent).toContain("Horarios de apertura y cierre");
  });

  describe("openTimeError and closeTimeError computeds", () => {
    it("should return empty array for valid touched fields", () => {
      expect(component.openTimeError()).toEqual([]);
      expect(component.closeTimeError()).toEqual([]);
    });

    it("should return undefined for invalid but untouched fields", () => {
      hostComponent.hoursModel.set({
        closeTime: "",
        openTime: "",
      });
      fixture.detectChanges();

      expect(component.openTimeError()).toBeUndefined();
      expect(component.closeTimeError()).toBeUndefined();
    });

    it("should return validation errors when field is invalid and touched", () => {
      hostComponent.hoursModel.set({
        closeTime: "",
        openTime: "invalid-time",
      });
      fixture.detectChanges();

      hostComponent.operatingHoursForm.openTime().markAsTouched();
      hostComponent.operatingHoursForm.closeTime().markAsTouched();
      fixture.detectChanges();

      expect(component.openTimeError()?.length).toBeGreaterThan(0);
      expect(component.closeTimeError()?.length).toBeGreaterThan(0);
    });
  });

  describe("getError static helper", () => {
    it("should return undefined if field is invalid but untouched", () => {
      /* SAFETY: Mocking ValidationError for unit test */
      const errorItem = { message: "error" } as ValidationError.WithFieldTree;
      const mockField = createMockField(false, true, [errorItem]);

      const error = staticHelpers.getError(mockField);
      expect(error).toBeUndefined();
    });

    it("should return errors if field is invalid and touched", () => {
      /* SAFETY: Mocking ValidationError for unit test */
      const requiredItem = {
        message: "Required",
      } as ValidationError.WithFieldTree;
      const expectedErrors = [requiredItem];
      const mockField = createMockField(true, true, expectedErrors);

      const error = staticHelpers.getError(mockField);
      expect(error).toEqual(expectedErrors);
    });

    it("should return empty array if field is valid and errors is null/empty", () => {
      const mockField = createMockField(true, false, null);

      const error = staticHelpers.getError(mockField);
      expect(error).toEqual([]);
    });
  });
});
