import { TestBed } from "@angular/core/testing";
import { Router } from "@angular/router";
import type { SlotSummary } from "@core/models/slot.model";

import { SlotDrawerState, getHistoryCopy } from "./slot-drawer.state";

const createSlot = (overrides: Partial<SlotSummary> = {}): SlotSummary => ({
  hasCharger: false,
  id: "slot-1",
  isAccessible: false,
  isActive: true,
  parkingName: "P",
  prefix: "A",
  slotNumber: "001",
  status: "AVAILABLE",
  type: "CAR",
  zone: "Z",
  ...overrides,
});

interface MockRouter {
  navigate: ReturnType<typeof vi.fn>;
}

describe("SlotDrawerState", () => {
  let state: SlotDrawerState;
  let routerMock: MockRouter;

  beforeEach(() => {
    routerMock = {
      navigate: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [SlotDrawerState, { provide: Router, useValue: routerMock }],
    });

    state = TestBed.inject(SlotDrawerState);
  });

  it("should initialize with drawerSlotId as null and drawerTab as general", () => {
    expect(state.drawerSlotId()).toBeNull();
    expect(state.drawerTab()).toBe("general");
  });

  it("should openDrawer, set tab to general, set drawerSlotId, and navigate", () => {
    state.setDrawerTab("history");
    state.openDrawer("parking-1", "slot-1");

    expect(state.drawerTab()).toBe("general");
    expect(state.drawerSlotId()).toBe("slot-1");
    expect(routerMock.navigate).toHaveBeenCalledWith(["/app/parking-lots/parking-1/slots/slot-1"]);
  });

  it("should closeDrawer, reset drawerSlotId, and navigate to slots list", () => {
    state.openDrawer("parking-1", "slot-1");
    state.closeDrawer("parking-1");

    expect(state.drawerSlotId()).toBeNull();
    expect(routerMock.navigate).toHaveBeenCalledWith(["/app/parking-lots/parking-1/slots"]);
  });

  it("should find drawerSlot in list", () => {
    const slots = [createSlot({ id: "slot-1" }), createSlot({ id: "slot-2" })];
    expect(state.drawerSlot(slots)).toBeNull();

    state.drawerSlotId.set("slot-2");
    expect(state.drawerSlot(slots)).toEqual(slots[1]);
  });

  it("should set drawerTab", () => {
    state.setDrawerTab("history");
    expect(state.drawerTab()).toBe("history");
  });

  describe("getHistoryCopy", () => {
    it("should return empty when slot is null", () => {
      expect(getHistoryCopy(null).empty).toBe(true);
    });

    it("should return empty with message when no history", () => {
      const res = getHistoryCopy(createSlot({ hasHistory: false }));
      expect(res.empty).toBe(true);
      expect(res.message).toBe("Sin historial de tickets");
    });

    it("should return copy when has history", () => {
      const res = getHistoryCopy(createSlot({ hasHistory: true }));
      expect(res.empty).toBe(false);
      expect(res.title).toBe("Esta plaza tiene tickets previos.");
    });
  });
});
