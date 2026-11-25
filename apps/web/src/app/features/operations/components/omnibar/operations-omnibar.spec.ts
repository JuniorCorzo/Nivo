import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";
import type {
  OperationsOmnibarAction,
  OperationsOmnibarState,
} from "@core/models/operations-cockpit.model";

import { OperationsOmnibarComponent } from "./operations-omnibar";

const createState = (
  overrides: Partial<OperationsOmnibarState> = {}
): OperationsOmnibarState => ({
  availableCarSlotsCount: 5,
  availableMotoSlotsCount: 3,
  expressPlate: "",
  expressVehicleType: "CAR",
  hasMultipleVehicleTypes: true,
  isSubmittingExpressCheckIn: false,
  searchTicketQuery: "",
  ...overrides,
});

describe("OperationsOmnibarComponent", () => {
  let fixture: ComponentFixture<OperationsOmnibarComponent>;
  let component: OperationsOmnibarComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OperationsOmnibarComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(OperationsOmnibarComponent);
    component = fixture.componentInstance;
  });

  it("should show vehicle type toggle only when hasMultipleVehicleTypes is true and emit selectVehicleType", () => {
    const emitted: OperationsOmnibarAction[] = [];
    component.action.subscribe((e) => emitted.push(e));

    fixture.componentRef.setInput(
      "state",
      createState({ hasMultipleVehicleTypes: false })
    );
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).textContent).not.toContain(
      "Carro"
    );

    fixture.componentRef.setInput(
      "state",
      createState({ hasMultipleVehicleTypes: true })
    );
    fixture.detectChanges();

    const motoBtn = [
      ...(fixture.nativeElement as HTMLElement).querySelectorAll("button"),
    ].find((b) => b.textContent?.includes("Moto"));
    expect(motoBtn).toBeTruthy();
    motoBtn?.click();

    expect(emitted).toEqual([
      { type: "selectVehicleType", vehicleType: "MOTORCYCLE" },
    ]);
  });

  it("should enforce >= 1 char guard on onSearchEnter and emit submitCheckOut for single-char bay or plate", () => {
    const emitted: OperationsOmnibarAction[] = [];
    component.action.subscribe((e) => emitted.push(e));

    fixture.componentRef.setInput(
      "state",
      createState({ searchTicketQuery: "   " })
    );
    fixture.detectChanges();
    component.onSearchEnter();
    expect(emitted).toEqual([]);

    fixture.componentRef.setInput(
      "state",
      createState({ searchTicketQuery: "1" })
    );
    fixture.detectChanges();
    const searchInput = (
      fixture.nativeElement as HTMLElement
    ).querySelector<HTMLInputElement>("#search-ticket-checkout");
    searchInput?.dispatchEvent(
      new KeyboardEvent("keydown", { bubbles: true, key: "Enter" })
    );
    expect(emitted).toEqual([{ type: "submitCheckOut" }]);
  });

  it("should guard onSubmitCheckIn against empty, invalid, or submitting state and emit on valid plate", () => {
    const emitted: OperationsOmnibarAction[] = [];
    component.action.subscribe((e) => emitted.push(e));

    fixture.componentRef.setInput("state", createState({ expressPlate: "" }));
    fixture.detectChanges();
    component.onSubmitCheckIn();
    expect(emitted).toEqual([]);

    fixture.componentRef.setInput("state", createState({ expressPlate: "AB" }));
    fixture.detectChanges();
    component.onSubmitCheckIn();
    expect(emitted).toEqual([]);

    fixture.componentRef.setInput(
      "state",
      createState({ expressPlate: "ABC123", isSubmittingExpressCheckIn: true })
    );
    fixture.detectChanges();
    component.onSubmitCheckIn();
    expect(emitted).toEqual([]);

    fixture.componentRef.setInput(
      "state",
      createState({
        expressPlate: "ABC-123",
        isSubmittingExpressCheckIn: false,
      })
    );
    fixture.detectChanges();
    component.onSubmitCheckIn();
    expect(emitted).toEqual([{ type: "submitCheckIn" }]);
  });

  it("should emit openUnplatedCheckIn and openQrScanner when action buttons are clicked and use Design System nv-button", () => {
    const emitted: OperationsOmnibarAction[] = [];
    component.action.subscribe((e) => emitted.push(e));

    fixture.componentRef.setInput("state", createState());
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    // All buttons must be rendered via nv-button
    const rawButtonsOutsideDs = [...el.querySelectorAll("button")].filter(
      (b) => !b.hasAttribute("nv-button")
    );
    expect(rawButtonsOutsideDs).toEqual([]);

    const unplatedBtn = [...el.querySelectorAll("button")].find((b) =>
      b.textContent?.includes("Sin Placa")
    );
    const qrBtn = [...el.querySelectorAll("button")].find((b) =>
      b.textContent?.includes("Escanear QR")
    );

    unplatedBtn?.click();
    qrBtn?.click();

    expect(emitted).toEqual([
      { type: "openUnplatedCheckIn" },
      { type: "openQrScanner" },
    ]);
  });
});
