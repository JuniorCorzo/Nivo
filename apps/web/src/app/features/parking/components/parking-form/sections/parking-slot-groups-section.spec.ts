import { Component, signal } from "@angular/core";
import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";
import type {
  SlotDistribution,
  SlotType,
} from "@core/type/slot-distribution.type";

import { ParkingSlotGroupsSectionComponent } from "./parking-slot-groups-section";

interface SlotTypeOption {
  value: SlotType;
  label: string;
}

@Component({
  imports: [ParkingSlotGroupsSectionComponent],
  standalone: true,
  template: `
    <app-parking-slot-groups-section
      [slots]="slots()"
      [slotTypeOptions]="slotTypeOptions()"
      (addSlot)="onAddSlot()"
      (removeSlot)="onRemoveSlot($event)"
      (slotChange)="onSlotChange($event)"
    />
  `,
})
class TestHostComponent {
  public slots = signal<SlotDistribution[]>([
    { count: 10, prefix: "A", type: "CAR", zone: "Norte" },
    { count: 5, prefix: "M", type: "MOTORCYCLE", zone: "Sur" },
  ]);

  public slotTypeOptions = signal<SlotTypeOption[]>([
    { label: "Carro", value: "CAR" },
    { label: "Moto", value: "MOTORCYCLE" },
    { label: "Bicicleta", value: "BIKE" },
  ]);

  public addSlotCalled = false;
  public removedSlotIndex: number | null = null;
  public lastSlotChange: {
    index: number;
    field: keyof SlotDistribution;
    value: SlotDistribution[keyof SlotDistribution];
  } | null = null;

  public onAddSlot(): void {
    this.addSlotCalled = true;
  }

  public onRemoveSlot(index: number): void {
    this.removedSlotIndex = index;
  }

  public onSlotChange(change: {
    index: number;
    field: keyof SlotDistribution;
    value: SlotDistribution[keyof SlotDistribution];
  }): void {
    this.lastSlotChange = change;
  }
}

describe("ParkingSlotGroupsSectionComponent", () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let hostComponent: TestHostComponent;
  let component: ParkingSlotGroupsSectionComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent, ParkingSlotGroupsSectionComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    hostComponent = fixture.componentInstance;
    fixture.detectChanges();
    /* SAFETY: Querying child ParkingSlotGroupsSectionComponent instance */
    component = fixture.debugElement.children[0]
      .componentInstance as ParkingSlotGroupsSectionComponent;
  });

  it("should create the component instance", () => {
    expect(component).toBeTruthy();
  });

  describe("static methods", () => {
    it("should return label from displaySlotTypeFn", () => {
      const option: SlotTypeOption = { label: "Vehículo", value: "CAR" };
      expect(ParkingSlotGroupsSectionComponent.displaySlotTypeFn(option)).toBe(
        "Vehículo"
      );
      expect(component.displaySlotTypeFn(option)).toBe("Vehículo");
    });

    it("should return value from valueSlotTypeFn", () => {
      const option: SlotTypeOption = {
        label: "Moto",
        value: "MOTORCYCLE",
      };
      expect(ParkingSlotGroupsSectionComponent.valueSlotTypeFn(option)).toBe(
        "MOTORCYCLE"
      );
      expect(component.valueSlotTypeFn(option)).toBe("MOTORCYCLE");
    });
  });

  describe("addSlot and removeSlot outputs", () => {
    it("should emit addSlot output when add button is clicked", () => {
      /* SAFETY: Querying add button element */
      const addButton = fixture.nativeElement.querySelector(
        "button"
      ) as HTMLButtonElement;
      addButton.click();

      expect(hostComponent.addSlotCalled).toBe(true);
    });

    it("should emit removeSlot output with index when remove button is clicked", () => {
      const removeButtons = fixture.nativeElement.querySelectorAll(
        "button.text-destructive"
      );
      expect(removeButtons.length).toBe(2);

      /* SAFETY: Querying remove button element */
      (removeButtons[1] as HTMLButtonElement).click();
      expect(hostComponent.removedSlotIndex).toBe(1);
    });
  });

  describe("slotChange output and methods", () => {
    it("should emit slotChange via emitSlotChange for text fields", () => {
      component.emitSlotChange(0, "prefix", "B");
      expect(hostComponent.lastSlotChange).toEqual({
        field: "prefix",
        index: 0,
        value: "B",
      });

      component.emitSlotChange(1, "zone", "Occidente");
      expect(hostComponent.lastSlotChange).toEqual({
        field: "zone",
        index: 1,
        value: "Occidente",
      });

      component.emitSlotChange(0, "type", "BIKE");
      expect(hostComponent.lastSlotChange).toEqual({
        field: "type",
        index: 0,
        value: "BIKE",
      });
    });

    it("should emit slotChange via emitSlotCountChange with parsed number", () => {
      const inputEl = document.createElement("input");
      inputEl.value = "25";
      const event = new Event("input");
      Object.defineProperty(event, "target", { value: inputEl });

      component.emitSlotCountChange(0, event);

      expect(hostComponent.lastSlotChange).toEqual({
        field: "count",
        index: 0,
        value: 25,
      });
    });

    it("should fallback to 0 in emitSlotCountChange when value is NaN", () => {
      const inputEl = document.createElement("input");
      inputEl.value = "invalid";
      const event = new Event("input");
      Object.defineProperty(event, "target", { value: inputEl });

      component.emitSlotCountChange(1, event);

      expect(hostComponent.lastSlotChange).toEqual({
        field: "count",
        index: 1,
        value: 0,
      });
    });
  });

  describe("template rendering", () => {
    it("should render slot group item labels", () => {
      const textContent = fixture.nativeElement.textContent || "";
      expect(textContent).toContain("Grupos de cupos");
      expect(textContent).toContain("Grupo 1");
      expect(textContent).toContain("Grupo 2");
    });

    it("should render no slot groups when slots array is empty", () => {
      hostComponent.slots.set([]);
      fixture.detectChanges();

      const slotCards = fixture.nativeElement.querySelectorAll(
        ".border-border.bg-muted\\/40"
      );
      expect(slotCards.length).toBe(0);
    });
  });
});
