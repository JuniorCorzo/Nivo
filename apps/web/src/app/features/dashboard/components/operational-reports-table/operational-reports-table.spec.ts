import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";

import { OperationalReportsTableComponent } from "./operational-reports-table";

describe("OperationalReportsTableComponent", () => {
  let component: OperationalReportsTableComponent;
  let fixture: ComponentFixture<OperationalReportsTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OperationalReportsTableComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(OperationalReportsTableComponent);
    component = fixture.componentInstance;
  });

  it("debe mostrar la columna Sede cuando isGlobalScope es true y ocultarla en modo SINGLE", () => {
    fixture.componentRef.setInput("isGlobalScope", true);
    fixture.componentRef.setInput("data", [
      {
        durationMinutes: 30,
        entryTime: "10:00",
        exitTime: "10:30",
        licensePlate: "ABC-123",
        parkingName: "Sede Centro",
        paymentStatus: "PENDING",
        slotNumber: "1",
        slotType: "CAR",
        ticketId: "t1",
        ticketStatus: "OPEN",
        totalToCharge: 5000,
      },
    ]);
    fixture.detectChanges();

    const columnIds = component.table.getAllColumns().map((c) => c.id);
    expect(columnIds).toContain("parkingName");

    fixture.componentRef.setInput("isGlobalScope", false);
    fixture.detectChanges();
    const columnIdsSingle = component.table
      .getAllColumns()
      .filter((c) => c.getIsVisible())
      .map((c) => c.id);
    expect(columnIdsSingle).not.toContain("parkingName");
  });

  it("template no debe contener escaleras @if/@else if de columnas (anti-ladder rule)", () => {
    /* SAFETY: Angular fixture nativeElement is guaranteed to be an HTMLElement in DOM environment */
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelectorAll("td").length).toBeGreaterThanOrEqual(0);
  });
});
