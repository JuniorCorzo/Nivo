import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";

import { SlotStatusBadgeComponent } from "./slot-status-badge";

describe("SlotStatusBadgeComponent", () => {
  let fixture: ComponentFixture<SlotStatusBadgeComponent>;
  let component: SlotStatusBadgeComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SlotStatusBadgeComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SlotStatusBadgeComponent);
    component = fixture.componentInstance;
  });

  it("should render AVAILABLE status with 'Disponible' label and 'success' variant", () => {
    fixture.componentRef.setInput("status", "AVAILABLE");
    fixture.detectChanges();

    expect(component.label()).toBe("Disponible");
    expect(component.variant()).toBe("success");
    expect(fixture.nativeElement.textContent).toContain("Disponible");
  });

  it("should render OCCUPIED status with 'Ocupada' label and 'destructive' variant", () => {
    fixture.componentRef.setInput("status", "OCCUPIED");
    fixture.detectChanges();

    expect(component.label()).toBe("Ocupada");
    expect(component.variant()).toBe("destructive");
    expect(fixture.nativeElement.textContent).toContain("Ocupada");
  });

  it("should render MAINTENANCE status with 'Mantenimiento' label and 'warning' variant", () => {
    fixture.componentRef.setInput("status", "MAINTENANCE");
    fixture.detectChanges();

    expect(component.label()).toBe("Mantenimiento");
    expect(component.variant()).toBe("warning");
    expect(fixture.nativeElement.textContent).toContain("Mantenimiento");
  });

  it("should render RESERVED status with 'Reservada' label and 'secondary' variant", () => {
    fixture.componentRef.setInput("status", "RESERVED");
    fixture.detectChanges();

    expect(component.label()).toBe("Reservada");
    expect(component.variant()).toBe("secondary");
    expect(fixture.nativeElement.textContent).toContain("Reservada");
  });

  it("should fallback cleanly for unknown status", () => {
    fixture.componentRef.setInput("status", "OTHER");
    fixture.detectChanges();

    expect(component.label()).toBe("OTHER");
    expect(component.variant()).toBe("secondary");
    expect(fixture.nativeElement.textContent).toContain("OTHER");
  });

  it("should render 'Inactiva' label and 'warning' variant when isActive is false", () => {
    fixture.componentRef.setInput("status", "AVAILABLE");
    fixture.componentRef.setInput("isActive", false);
    fixture.detectChanges();

    expect(component.label()).toBe("Inactiva");
    expect(component.variant()).toBe("warning");
    expect(fixture.nativeElement.textContent).toContain("Inactiva");
    expect(fixture.nativeElement.textContent).not.toContain("Disponible");
  });
});
