import { TestBed } from "@angular/core/testing";
import type { SlotSummary } from "@core/models/slot.model";
import type { TicketSummary } from "@core/models/ticket.model";

import { OperationsModalsStore } from "./operations-modals.store";

const createSlot = (overrides: Partial<SlotSummary> = {}): SlotSummary => ({
  hasCharger: false,
  id: "slot-1",
  isAccessible: false,
  isActive: true,
  parkingName: "Central",
  prefix: "A",
  slotNumber: "101",
  status: "AVAILABLE",
  type: "CAR",
  zone: "Z1",
  ...overrides,
});

const createTicket = (
  overrides: Partial<TicketSummary> = {}
): TicketSummary => ({
  entryTime: "2026-10-16T10:00:00Z",
  id: "ticket-1",
  licensePlate: "ABC-123",
  plateCountry: "CO",
  slotId: "slot-2",
  slotNumber: "102",
  status: "OPEN",
  ...overrides,
});

describe("OperationsModalsStore", () => {
  let store: OperationsModalsStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [OperationsModalsStore],
    });
    store = TestBed.inject(OperationsModalsStore);
  });

  it("should initialize all modals as closed with empty state", () => {
    expect(store.isCheckInModalOpen()).toBe(false);
    expect(store.selectedCheckInSlot()).toBeNull();
    expect(store.checkInModalInitialUnplated()).toBe(false);
    expect(store.checkInModalInitialPlate()).toBe("");
    expect(store.isCheckOutModalOpen()).toBe(false);
    expect(store.selectedCheckoutTicket()).toBeNull();
    expect(store.isQrScannerOpen()).toBe(false);
  });

  it("should open check-in modal with plate and preselected slot and reset on close", () => {
    const slot = createSlot({ id: "slot-7", slotNumber: "107" });

    store.openCheckIn(false, "ABC-123", slot);

    expect(store.isCheckInModalOpen()).toBe(true);
    expect(store.checkInModalInitialUnplated()).toBe(false);
    expect(store.checkInModalInitialPlate()).toBe("ABC-123");
    expect(store.selectedCheckInSlot()).toEqual(slot);

    store.closeCheckIn();

    expect(store.isCheckInModalOpen()).toBe(false);
    expect(store.checkInModalInitialUnplated()).toBe(false);
    expect(store.checkInModalInitialPlate()).toBe("");
    expect(store.selectedCheckInSlot()).toBeNull();
  });

  it("should clear initial plate when opening check-in modal in unplated mode", () => {
    store.openCheckIn(true, "STALE-999", null);

    expect(store.isCheckInModalOpen()).toBe(true);
    expect(store.checkInModalInitialUnplated()).toBe(true);
    expect(store.checkInModalInitialPlate()).toBe("");
    expect(store.selectedCheckInSlot()).toBeNull();
  });

  it("should open direct checkout modal with null ticket and reset on close", () => {
    const existingTicket = createTicket({ id: "ticket-old" });
    store.openCheckOutWithTicket(existingTicket);

    store.openDirectCheckOut();

    expect(store.isCheckOutModalOpen()).toBe(true);
    expect(store.selectedCheckoutTicket()).toBeNull();

    store.closeCheckOut();

    expect(store.isCheckOutModalOpen()).toBe(false);
    expect(store.selectedCheckoutTicket()).toBeNull();
  });

  it("should open checkout modal with specific ticket and clear it on close", () => {
    const ticket = createTicket({ id: "ticket-99", licensePlate: "XYZ-789" });

    store.openCheckOutWithTicket(ticket);

    expect(store.isCheckOutModalOpen()).toBe(true);
    expect(store.selectedCheckoutTicket()).toEqual(ticket);

    store.closeCheckOut();

    expect(store.isCheckOutModalOpen()).toBe(false);
    expect(store.selectedCheckoutTicket()).toBeNull();
  });

  it("should open and close QR scanner modal", () => {
    store.openQrScanner();
    expect(store.isQrScannerOpen()).toBe(true);

    store.closeQrScanner();
    expect(store.isQrScannerOpen()).toBe(false);
  });
});
