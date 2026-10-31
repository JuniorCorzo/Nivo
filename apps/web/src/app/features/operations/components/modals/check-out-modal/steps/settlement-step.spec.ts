import { signal } from "@angular/core";
import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";
import type {
  PriceDetailedModel,
  TicketSummary,
} from "@core/models/ticket.model";

import { CheckOutFacade } from "../../../../facades/check-out.facade";
import { SettlementStepComponent } from "./settlement-step";

describe("SettlementStepComponent", () => {
  let component: SettlementStepComponent;
  let fixture: ComponentFixture<SettlementStepComponent>;

  let mockSelectedTicket: ReturnType<typeof signal<TicketSummary | null>>;
  let mockPriceCalculation: ReturnType<
    typeof signal<PriceDetailedModel | null>
  >;
  let mockIsLoadingCalculation: ReturnType<typeof signal<boolean>>;
  let mockIsZeroPayment: ReturnType<typeof signal<boolean>>;
  let mockCanCheckOut: ReturnType<typeof signal<boolean>>;

  let clearSelectedTicketSpy: ReturnType<typeof vi.fn>;
  let proceedToPaymentSpy: ReturnType<typeof vi.fn>;

  const sampleTicket: TicketSummary = {
    entryTime: new Date(Date.now() - 75 * 60 * 1000).toISOString(), // 1h 15m ago
    id: "ticket-101",
    licensePlate: "ABC-123",
    slotId: "slot-1",
    slotNumber: "A-01",
    slotType: "CAR",
    status: "OPEN",
  };

  const sampleCalculation: PriceDetailedModel = {
    breakdown: [
      { amount: 3500, concept: "Primera Hora" },
      { amount: 1500, concept: "Fracción Adicional" },
    ],
    ivaAmount: 950,
    ivaRate: 19,
    name: "Tarifa Estándar Diurna",
    subtotal: 5000,
    total: 5950,
  };

  beforeEach(async () => {
    mockSelectedTicket = signal<TicketSummary | null>(sampleTicket);
    mockPriceCalculation = signal<PriceDetailedModel | null>(sampleCalculation);
    mockIsLoadingCalculation = signal<boolean>(false);
    mockIsZeroPayment = signal<boolean>(false);
    mockCanCheckOut = signal<boolean>(true);

    clearSelectedTicketSpy = vi.fn();
    proceedToPaymentSpy = vi.fn();

    const mockFacade = {
      canCheckOut: mockCanCheckOut,
      clearSelectedTicket: clearSelectedTicketSpy,
      isLoadingCalculation: mockIsLoadingCalculation,
      isZeroPayment: mockIsZeroPayment,
      priceCalculation: mockPriceCalculation,
      proceedToPayment: proceedToPaymentSpy,
      selectedTicket: mockSelectedTicket,
    };

    await TestBed.configureTestingModule({
      imports: [SettlementStepComponent],
      providers: [{ provide: CheckOutFacade, useValue: mockFacade }],
    }).compileComponents();

    fixture = TestBed.createComponent(SettlementStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create SettlementStepComponent", () => {
    expect(component).toBeTruthy();
  });

  it("should render vehicle license plate and slot number in header", () => {
    const text = fixture.nativeElement.textContent;
    expect(text).toContain("ABC-123");
    expect(text).toContain("A-01");
    expect(text).toContain("CAR");
  });

  it("should display real-time stay duration timeline with formatted duration", () => {
    const text = fixture.nativeElement.textContent;
    expect(text).toContain("Tiempo de Estadía");
    expect(text).toContain("1h 15m");
    expect(text).toContain("Entrada");
    expect(text).toContain("Salida / Cálculo");
  });

  it("should display price breakdown lines, subtotal, IVA, and total", () => {
    const text = fixture.nativeElement.textContent;
    expect(text).toContain("Primera Hora");
    expect(text).toContain("3,500");
    expect(text).toContain("Fracción Adicional");
    expect(text).toContain("1,500");
    expect(text).toContain("Subtotal");
    expect(text).toContain("5,000");
    expect(text).toContain("IVA (19%)");
    expect(text).toContain("950");
    expect(text).toContain("5,950");
    expect(text).toContain("Total a Cobrar");
  });

  it("should display loading state with spinner when calculation is loading", () => {
    mockIsLoadingCalculation.set(true);
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain("Calculando tarifa...");
    expect(text).toContain("Consultando tarifas en tiempo real...");
  });

  it("should display grace period banner and free exit action when total is zero", () => {
    mockIsZeroPayment.set(true);
    mockPriceCalculation.set({
      breakdown: [],
      ivaAmount: 0,
      ivaRate: 0,
      name: "Tarifa Gratuita",
      subtotal: 0,
      total: 0,
    });
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain("Período de gracia / Salida sin cobro");
    expect(text).toContain("Autorizar Salida Gratuita");
  });

  it("should call facade.clearSelectedTicket and emit changeVehicle when 'Cambiar vehículo' is clicked", () => {
    const changeVehicleSpy = vi.spyOn(component.changeVehicle, "emit");

    /* SAFETY: The change vehicle button is rendered in the header card */
    const changeBtn = Array.from(
      fixture.nativeElement.querySelectorAll("button")
    ).find((btn) =>
      (btn as HTMLButtonElement).textContent?.includes("Cambiar vehículo")
    ) as HTMLButtonElement;
    expect(changeBtn).toBeTruthy();

    changeBtn.click();
    expect(clearSelectedTicketSpy).toHaveBeenCalled();
    expect(changeVehicleSpy).toHaveBeenCalled();
  });

  it("should emit continue and nextStep events and advance to payment when continue button is clicked", () => {
    const continueSpy = vi.spyOn(component.continue, "emit");
    const nextStepSpy = vi.spyOn(component.nextStep, "emit");

    /* SAFETY: The continue button is the action button with text 'Continuar a Pago' */
    const continueBtn = Array.from(
      fixture.nativeElement.querySelectorAll("button")
    ).find((btn) =>
      (btn as HTMLButtonElement).textContent?.includes("Continuar a Pago")
    ) as HTMLButtonElement;
    expect(continueBtn).toBeTruthy();

    continueBtn.click();
    expect(continueSpy).toHaveBeenCalled();
    expect(nextStepSpy).toHaveBeenCalled();
    expect(proceedToPaymentSpy).toHaveBeenCalled();
  });
});
