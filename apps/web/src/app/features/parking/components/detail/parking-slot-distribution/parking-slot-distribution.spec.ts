import { Component, signal } from "@angular/core";
import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";
import type { OccupiedSlotDetail } from "@core/models/parking-telemetry.model";
import type { SlotDistribution } from "@core/type/slot-distribution.type";

import { ParkingSlotDistribution } from "./parking-slot-distribution";

@Component({
  imports: [ParkingSlotDistribution],
  standalone: true,
  template: `
    <app-parking-slot-distribution
      [slotDistribution]="slotDistribution()"
      [occupiedSlots]="occupiedSlots()"
      [availableSlots]="availableSlots()"
      [totalSlots]="totalSlots()"
      [occupiedSlotsDetail]="occupiedSlotsDetail()"
    />
  `,
})
class TestHostComponent {
  public slotDistribution = signal<SlotDistribution[]>([
    { count: 30, prefix: "A", type: "CAR", zone: "Norte" },
    { count: 20, prefix: "M", type: "MOTORCYCLE", zone: "Sur" },
  ]);
  public occupiedSlots = signal(20);
  public availableSlots = signal(30);
  public totalSlots = signal(50);
  public occupiedSlotsDetail = signal<OccupiedSlotDetail[]>([]);
}

describe("ParkingSlotDistribution", () => {
  let hostComponent: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;
  let compiled: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent, ParkingSlotDistribution],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    hostComponent = fixture.componentInstance;
    fixture.detectChanges();
    compiled = fixture.nativeElement;
  });

  it("should render the slot distribution section and cards", () => {
    const textContent = compiled.textContent || "";
    expect(textContent).toContain("Distribución de cupos");
    expect(textContent).toContain("2 grupos de cupos");
    expect(textContent).toContain("NORTE · CAR");
    expect(textContent).toContain("SUR · MOTORCYCLE");
    expect(textContent).toContain("30");
    expect(textContent).toContain("20");
    expect(textContent).toContain("Ocupadas: 20");
    expect(textContent).toContain("Disponibles: 30");
    expect(textContent).toContain("50 en total");
  });

  it("should format slot label properly using slotLabel method", () => {
    const compFixture = TestBed.createComponent(ParkingSlotDistribution);
    const comp = compFixture.componentInstance;
    const label = comp.slotLabel({
      count: 10,
      prefix: "VIP",
      type: "CAR",
      zone: "Sótano 1",
    });
    expect(label).toBe("SÓTANO 1 · CAR");
  });

  it("should render visual matrix of bahías & plazas with header, legend and slot cells", () => {
    const textContent = compiled.textContent || "";
    expect(textContent).toContain("Distribución de Bahías en Tiempo Real");
    expect(textContent).toContain(
      "Haz click en cualquier bahía para auditar o asignar ingreso."
    );
    expect(textContent).toContain("Ocupada (20)");
    expect(textContent).toContain("Disponible (30)");

    const slotButtons = compiled.querySelectorAll(
      ".grid-cols-3 button, .sm\\:grid-cols-4 button, .md\\:grid-cols-6 button"
    );
    expect(slotButtons.length).toBeGreaterThan(0);

    // Should contain LIBRE tags for available slots
    expect(textContent).toContain("LIBRE");

    // Should contain slot names (A-01, M-01, etc.)
    expect(textContent).toContain("A-01");
  });

  it("should trigger toast notification when clicking slot cells", () => {
    const compFixture = TestBed.createComponent(ParkingSlotDistribution);
    compFixture.componentRef.setInput("slotDistribution", [
      { count: 10, prefix: "A", type: "CAR", zone: "Norte" },
    ]);
    compFixture.componentRef.setInput("occupiedSlots", 5);
    compFixture.componentRef.setInput("availableSlots", 5);
    compFixture.componentRef.setInput("totalSlots", 10);
    compFixture.detectChanges();

    const comp = compFixture.componentInstance;
    const slots = comp.visualSlots();
    expect(slots.length).toBe(12);

    expect(() => {
      comp.onSlotClick(slots[0]); // Occupied
      comp.onSlotClick(slots[slots.length - 1]); // Available
    }).not.toThrow();
  });

  it("should render nothing when slotDistribution is empty", () => {
    hostComponent.slotDistribution.set([]);
    fixture.detectChanges();
    expect(compiled.querySelector("nv-card")).toBeNull();
  });

  it("should render real occupiedSlotsDetail with license plates and available slots without plates", () => {
    hostComponent.occupiedSlotsDetail.set([
      {
        licensePlate: "NVO 123",
        prefix: "A",
        slotNumber: "A-01",
        type: "CAR",
        zone: "Norte",
      },
      {
        licensePlate: "MOT 456",
        prefix: "M",
        slotNumber: "M-02",
        type: "MOTORCYCLE",
        zone: "Sur",
      },
    ]);
    fixture.detectChanges();

    const textContent = compiled.textContent || "";
    expect(textContent).toContain("NVO 123");
    expect(textContent).toContain("MOT 456");
    expect(textContent).not.toContain("KLM 482");
    expect(textContent).not.toContain("BDX 910");

    const compFixture = TestBed.createComponent(ParkingSlotDistribution);
    compFixture.componentRef.setInput("slotDistribution", [
      { count: 10, prefix: "A", type: "CAR", zone: "Norte" },
    ]);
    compFixture.componentRef.setInput("occupiedSlots", 2);
    compFixture.componentRef.setInput("availableSlots", 8);
    compFixture.componentRef.setInput("totalSlots", 10);
    compFixture.componentRef.setInput("occupiedSlotsDetail", [
      {
        licensePlate: "REAL 999",
        prefix: "A",
        slotNumber: "01",
        type: "CAR",
        zone: "Norte",
      },
    ]);
    compFixture.detectChanges();

    const comp = compFixture.componentInstance;
    const slots = comp.visualSlots();
    expect(slots[0]).toEqual({
      isOccupied: true,
      name: "A-01",
      plate: "REAL 999",
      type: "CAR",
    });
    expect(slots[1].isOccupied).toBe(false);
    expect(slots[1].plate).toBeUndefined();
  });

  it("should render OCUPADA label when occupiedSlotsDetail is empty and slots are occupied", () => {
    hostComponent.occupiedSlotsDetail.set([]);
    fixture.detectChanges();

    const textContent = compiled.textContent || "";
    expect(textContent).toContain("OCUPADA");
    expect(textContent).not.toContain("KLM 482");
    expect(textContent).not.toContain("BDX 910");
    expect(textContent).not.toContain("TKR 502");
  });
});
