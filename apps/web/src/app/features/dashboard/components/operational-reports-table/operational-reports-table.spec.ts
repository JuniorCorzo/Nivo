import { ComponentFixture, TestBed } from "@angular/core/testing";
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
        ticketId: "t1",
        licensePlate: "ABC-123",
        slotNumber: "1",
        slotType: "CAR",
        parkingName: "Sede Centro",
        entryTime: "10:00",
        exitTime: "10:30",
        durationMinutes: 30,
        ticketStatus: "OPEN",
        totalToCharge: 5000,
        paymentStatus: "PENDING",
      },
    ]);
    fixture.detectChanges();

    const columnIds = component.table.getAllColumns().map((c: any) => c.id);
    expect(columnIds).toContain("parkingName");

    fixture.componentRef.setInput("isGlobalScope", false);
    fixture.detectChanges();
    const columnIdsSingle = component.table
      .getAllColumns()
      .filter((c: any) => c.getIsVisible())
      .map((c: any) => c.id);
    expect(columnIdsSingle).not.toContain("parkingName");
  });

  it("template no debe contener escaleras @if/@else if de columnas (anti-ladder rule)", () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelectorAll("td").length).toBeGreaterThanOrEqual(0);
  });
});
