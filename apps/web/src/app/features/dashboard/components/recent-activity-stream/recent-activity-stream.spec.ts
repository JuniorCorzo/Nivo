import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";
import type { OperationalReportItemModel } from "@core/models/dashboard.model";

import { RecentActivityStreamComponent } from "./recent-activity-stream";

describe("RecentActivityStreamComponent", () => {
  let component: RecentActivityStreamComponent;
  let fixture: ComponentFixture<RecentActivityStreamComponent>;

  const mockReports: OperationalReportItemModel[] = [
    {
      entryTime: "2026-10-01T15:10:48Z",
      licensePlate: "KML-482",
      parkingName: "Poblado Plaza",
      slotNumber: "A-12",
      slotType: "Automóvil",
      ticketId: "TKT-8941",
      ticketStatus: "ACTIVE",
    },
    {
      durationMinutes: 220,
      entryTime: "2026-10-01T11:30:00Z",
      exitTime: "2026-10-01T15:10:20Z",
      licensePlate: "BHT-339",
      parkingName: "Chapinero Norte",
      paymentMethod: "Nequi",
      paymentStatus: "PAID",
      slotNumber: "B-04",
      slotType: "Automóvil",
      ticketId: "TKT-8938",
      ticketStatus: "COMPLETED",
      totalToCharge: 16_000,
    },
    {
      entryTime: "2026-10-01T15:07:44Z",
      licensePlate: "FRG-601",
      parkingName: "Poblado Plaza",
      paymentStatus: "PENDING",
      slotNumber: "C-01",
      slotType: "Carga Eléctrica",
      ticketId: "TKT-8939",
      ticketStatus: "ACTIVE",
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecentActivityStreamComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RecentActivityStreamComponent);
    component = fixture.componentInstance;
  });

  it("debe crearse correctamente", () => {
    expect(component).toBeTruthy();
  });

  it("debe renderizar el estado vacío cuando no hay reportes", () => {
    fixture.componentRef.setInput("reports", []);
    fixture.detectChanges();

    /* SAFETY: Test fixture nativeElement is an HTMLElement */
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain("No hay flujo operativo reciente");
  });

  it("debe renderizar stream de tickets con placas en monospace, tipo de vehículo y sede", () => {
    fixture.componentRef.setInput("reports", mockReports);
    fixture.detectChanges();

    /* SAFETY: Test fixture nativeElement is an HTMLElement */
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain("KML-482");
    expect(compiled.textContent).toContain("BHT-339");
    expect(compiled.textContent).toContain("FRG-601");
    expect(compiled.textContent).toContain("Poblado Plaza");
    expect(compiled.textContent).toContain("Chapinero Norte");
    expect(compiled.textContent).toContain("Ingreso OK");
    expect(compiled.textContent).toContain("En Cobro");
  });

  it("debe identificar correctamente ingreso, salida y cobro pendiente", () => {
    const [ingressItem, egressItem, pendingItem] = mockReports;

    expect(ingressItem).toBeDefined();
    expect(egressItem).toBeDefined();
    expect(pendingItem).toBeDefined();

    if (ingressItem && egressItem && pendingItem) {
      expect(component.isPending(pendingItem)).toBe(true);
      expect(component.isEgress(egressItem)).toBe(true);
      expect(component.isEgress(ingressItem)).toBe(false);
    }
  });

  it("debe redondear minutos decimales en formatDuration previniendo artefactos de coma flotante", () => {
    expect(component.formatDuration(75.400000000000006)).toBe("1h 15m");
    expect(component.formatDuration(15.400000000000006)).toBe("15m");
    expect(component.formatDuration(0)).toBe("OK");
    expect(component.formatDuration()).toBe("OK");
    expect(component.formatDuration(120)).toBe("2h 0m");
  });
});
