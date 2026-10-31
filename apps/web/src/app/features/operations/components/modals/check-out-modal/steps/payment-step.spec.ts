import { signal } from "@angular/core";
import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";
import type {
  PriceDetailedModel,
  TicketSendVia,
  TicketSummary,
} from "@core/models/ticket.model";

import type { CheckoutPaymentMethod } from "../../../../facades/check-out.facade";
import { CheckOutFacade } from "../../../../facades/check-out.facade";
import { PaymentStepComponent } from "./payment-step";

describe("PaymentStepComponent", () => {
  let component: PaymentStepComponent;
  let fixture: ComponentFixture<PaymentStepComponent>;

  let mockSelectedTicket: ReturnType<typeof signal<TicketSummary | null>>;
  let mockPriceCalculation: ReturnType<
    typeof signal<PriceDetailedModel | null>
  >;
  let mockIsZeroPayment: ReturnType<typeof signal<boolean>>;
  let mockCanCheckOut: ReturnType<typeof signal<boolean>>;
  let mockIsSubmitting: ReturnType<typeof signal<boolean>>;
  let mockPaymentMethod: ReturnType<typeof signal<CheckoutPaymentMethod>>;
  let mockSendVia: ReturnType<typeof signal<TicketSendVia>>;
  let mockReceiptEmail: ReturnType<typeof signal<string>>;

  let setPaymentMethodSpy: ReturnType<typeof vi.fn>;
  let setSendViaSpy: ReturnType<typeof vi.fn>;
  let setReceiptEmailSpy: ReturnType<typeof vi.fn>;
  let backToSettlementSpy: ReturnType<typeof vi.fn>;
  let confirmCheckOutSpy: ReturnType<typeof vi.fn>;

  const sampleTicket: TicketSummary = {
    entryTime: "2026-10-26T10:00:00Z",
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
    mockIsZeroPayment = signal<boolean>(false);
    mockCanCheckOut = signal<boolean>(true);
    mockIsSubmitting = signal<boolean>(false);
    mockPaymentMethod = signal<CheckoutPaymentMethod>("EFFECTIVE");
    mockSendVia = signal<TicketSendVia>("URL");
    mockReceiptEmail = signal<string>("");

    setPaymentMethodSpy = vi
      .fn()
      .mockImplementation((method: CheckoutPaymentMethod) => {
        mockPaymentMethod.set(method);
      });
    setSendViaSpy = vi.fn().mockImplementation((sendVia: TicketSendVia) => {
      mockSendVia.set(sendVia);
    });
    setReceiptEmailSpy = vi.fn().mockImplementation((email: string) => {
      mockReceiptEmail.set(email);
    });
    backToSettlementSpy = vi.fn();
    confirmCheckOutSpy = vi.fn();

    const mockFacade = {
      backToSettlement: backToSettlementSpy,
      canCheckOut: mockCanCheckOut,
      confirmCheckOut: confirmCheckOutSpy,
      isSubmitting: mockIsSubmitting,
      isZeroPayment: mockIsZeroPayment,
      paymentMethod: mockPaymentMethod,
      priceCalculation: mockPriceCalculation,
      receiptEmail: mockReceiptEmail,
      selectedTicket: mockSelectedTicket,
      sendVia: mockSendVia,
      setPaymentMethod: setPaymentMethodSpy,
      setReceiptEmail: setReceiptEmailSpy,
      setSendVia: setSendViaSpy,
    };

    await TestBed.configureTestingModule({
      imports: [PaymentStepComponent],
      providers: [{ provide: CheckOutFacade, useValue: mockFacade }],
    }).compileComponents();

    fixture = TestBed.createComponent(PaymentStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create PaymentStepComponent", () => {
    expect(component).toBeTruthy();
  });

  it("should render vehicle license plate, slot info, and formatted total in summary card", () => {
    const text = fixture.nativeElement.textContent;
    expect(text).toContain("ABC-123");
    expect(text).toContain("A-01");
    expect(text).toContain("Total a Pagar");
    expect(text).toContain("5,950");
    expect(text).toContain("COP");
  });

  it("should render payment method grid with Efectivo, Tarjeta / Datáfono, and Transferencia / QR when total > 0", () => {
    const text = fixture.nativeElement.textContent;
    expect(text).toContain("Método de Pago");
    expect(text).toContain("Efectivo");
    expect(text).toContain("Tarjeta / Datáfono");
    expect(text).toContain("Transferencia / QR");
  });

  it("should select different payment methods (EFFECTIVE, PAY_LINK, TRANSFER)", () => {
    /* SAFETY: The payment methods are buttons in the grid */
    const buttons = Array.from(
      fixture.nativeElement.querySelectorAll("button")
    ) as HTMLButtonElement[];

    const cardBtn = buttons.find((btn) =>
      btn.textContent?.includes("Tarjeta / Datáfono")
    );
    expect(cardBtn).toBeTruthy();
    cardBtn?.click();
    expect(setPaymentMethodSpy).toHaveBeenCalledWith("PAY_LINK");
    expect(mockPaymentMethod()).toBe("PAY_LINK");

    fixture.detectChanges();
    expect(cardBtn?.className).toContain("border-primary");

    const transferBtn = buttons.find((btn) =>
      btn.textContent?.includes("Transferencia / QR")
    );
    expect(transferBtn).toBeTruthy();
    transferBtn?.click();
    expect(setPaymentMethodSpy).toHaveBeenCalledWith("TRANSFER");
    expect(mockPaymentMethod()).toBe("TRANSFER");

    const cashBtn = buttons.find((btn) =>
      btn.textContent?.includes("Efectivo")
    );
    expect(cashBtn).toBeTruthy();
    cashBtn?.click();
    expect(setPaymentMethodSpy).toHaveBeenCalledWith("EFFECTIVE");
    expect(mockPaymentMethod()).toBe("EFFECTIVE");
  });

  it("should hide payment method grid when isZeroPayment is true and display free exit text", () => {
    mockIsZeroPayment.set(true);
    mockPriceCalculation.set({
      breakdown: [],
      ivaAmount: 0,
      ivaRate: 0,
      name: "Tarifa Gracia",
      subtotal: 0,
      total: 0,
    });
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).not.toContain("Método de Pago");
    expect(text).toContain("Autorizar Salida Gratuita");
  });

  it("should switch delivery channels between URL and EMAIL and delegate to facade", () => {
    /* SAFETY: Delivery buttons are inside role=group */
    const deliveryGroup = fixture.nativeElement.querySelector(
      '[role="group"][aria-label="Método de entrega de comprobante"]'
    );
    expect(deliveryGroup).toBeTruthy();

    const buttons = Array.from(
      deliveryGroup.querySelectorAll("button")
    ) as HTMLButtonElement[];
    const emailBtn = buttons.find((btn) =>
      btn.textContent?.includes("Correo Electrónico")
    );
    const screenBtn = buttons.find((btn) =>
      btn.textContent?.includes("En Pantalla / Impreso")
    );

    expect(emailBtn).toBeTruthy();
    expect(screenBtn).toBeTruthy();

    emailBtn?.click();
    expect(setSendViaSpy).toHaveBeenCalledWith("EMAIL");
    expect(mockSendVia()).toBe("EMAIL");

    screenBtn?.click();
    expect(setSendViaSpy).toHaveBeenCalledWith("URL");
    expect(mockSendVia()).toBe("URL");
  });

  it("should display email input when EMAIL is chosen and handle text input", () => {
    expect(
      fixture.nativeElement.querySelector("#receipt-email-input")
    ).toBeNull();

    mockSendVia.set("EMAIL");
    fixture.detectChanges();

    const emailInput = fixture.nativeElement.querySelector(
      "#receipt-email-input"
    ) as HTMLInputElement;
    expect(emailInput).toBeTruthy();

    emailInput.value = "customer@example.com";
    emailInput.dispatchEvent(new Event("input"));
    expect(setReceiptEmailSpy).toHaveBeenCalledWith("customer@example.com");
  });

  it("should display validation error message when email is touched and invalid", () => {
    mockSendVia.set("EMAIL");
    mockReceiptEmail.set("invalid-email");
    fixture.detectChanges();

    expect(component.isEmailValid()).toBe(false);
    expect(fixture.nativeElement.textContent).not.toContain("Formato inválido");

    component.onEmailBlur();
    fixture.detectChanges();

    expect(component.emailTouched()).toBe(true);
    expect(fixture.nativeElement.textContent).toContain("Formato inválido");

    mockReceiptEmail.set("valid@example.com");
    fixture.detectChanges();
    expect(component.isEmailValid()).toBe(true);
    expect(fixture.nativeElement.textContent).not.toContain("Formato inválido");
  });

  it("should emit back event and call facade.backToSettlement when clicking 'Volver a Liquidación'", () => {
    const backSpy = vi.spyOn(component.back, "emit");

    /* SAFETY: Action buttons are inside the footer container */
    const backBtn = Array.from(
      fixture.nativeElement.querySelectorAll("button")
    ).find((btn) =>
      (btn as HTMLButtonElement).textContent?.includes("Volver a Liquidación")
    ) as HTMLButtonElement;
    expect(backBtn).toBeTruthy();

    backBtn.click();
    expect(backSpy).toHaveBeenCalled();
    expect(backToSettlementSpy).toHaveBeenCalled();
  });

  it("should emit confirm event and call facade.confirmCheckOut when clicking confirm button", () => {
    const confirmSpy = vi.spyOn(component.confirm, "emit");

    /* SAFETY: Confirm button contains Cobrar y Registrar Salida */
    const confirmBtn = Array.from(
      fixture.nativeElement.querySelectorAll("button")
    ).find((btn) =>
      (btn as HTMLButtonElement).textContent?.includes(
        "Cobrar y Registrar Salida"
      )
    ) as HTMLButtonElement;
    expect(confirmBtn).toBeTruthy();

    confirmBtn.click();
    expect(confirmSpy).toHaveBeenCalled();
    expect(confirmCheckOutSpy).toHaveBeenCalled();
  });

  it("should disable confirm button when facade.canCheckOut is false", () => {
    mockCanCheckOut.set(false);
    fixture.detectChanges();

    const confirmBtn = Array.from(
      fixture.nativeElement.querySelectorAll("button")
    ).find((btn) =>
      (btn as HTMLButtonElement).textContent?.includes(
        "Cobrar y Registrar Salida"
      )
    ) as HTMLButtonElement;

    expect(confirmBtn?.disabled).toBe(true);
  });

  it("should disable confirm button and display spinner when submission is in progress", () => {
    mockIsSubmitting.set(true);
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain("Procesando Salida...");

    const submitBtn = Array.from(
      fixture.nativeElement.querySelectorAll("button")
    ).find((btn) =>
      (btn as HTMLButtonElement).textContent?.includes("Procesando Salida...")
    ) as HTMLButtonElement;

    expect(submitBtn?.disabled).toBe(true);
  });
});
