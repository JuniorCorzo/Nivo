import { TestBed } from "@angular/core/testing";
import type { SlotSummary } from "@core/models/slot.model";
import { SlotService } from "@core/services/slot-service";
import { ToastService } from "@nivo-sass/design-system";
import { of, throwError } from "rxjs";

import { SlotGroupState } from "./slot-group.state";

const createSlot = (overrides: Partial<SlotSummary> = {}): SlotSummary => ({
  hasCharger: false,
  id: "1",
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

interface MockSlotService {
  updateSlotGroup: ReturnType<typeof vi.fn>;
}

interface MockToastService {
  showToast: ReturnType<typeof vi.fn>;
}

describe("SlotGroupState", () => {
  let state: SlotGroupState;
  let slotServiceMock: MockSlotService;
  let toastServiceMock: MockToastService;

  beforeEach(() => {
    slotServiceMock = {
      updateSlotGroup: vi.fn().mockReturnValue(of([])),
    };
    toastServiceMock = {
      showToast: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        SlotGroupState,
        { provide: SlotService, useValue: slotServiceMock },
        { provide: ToastService, useValue: toastServiceMock },
      ],
    });

    state = TestBed.inject(SlotGroupState);
  });

  it("should initialize with groupModalOpen as false and groupTarget as null", () => {
    expect(state.groupModalOpen()).toBe(false);
    expect(state.groupTarget()).toBeNull();
  });

  it("should calculate availableGroups correctly and sorted", () => {
    const slots = [
      createSlot({ prefix: "B", status: "AVAILABLE", zone: "SUR" }),
      createSlot({ prefix: "A", status: "OCCUPIED", zone: "NORTE" }),
      createSlot({ prefix: "A", status: "AVAILABLE", zone: "NORTE" }),
    ];
    const groups = state.availableGroups(slots);
    expect(groups).toEqual([
      { count: 2, occupiedCount: 1, prefix: "A", zone: "NORTE" },
      { count: 1, occupiedCount: 0, prefix: "B", zone: "SUR" },
    ]);
  });

  it("should openGroupModal with explicit zone and prefix", () => {
    state.openGroupModal([], "NORTE", "A");
    expect(state.groupModalOpen()).toBe(true);
    expect(state.groupTarget()).toEqual({ prefix: "A", zone: "NORTE" });
  });

  it("should openGroupModal with selectedSlots when no args provided", () => {
    const selected = [createSlot({ prefix: "C", zone: "ESTE" })];
    state.openGroupModal(selected);
    expect(state.groupModalOpen()).toBe(true);
    expect(state.groupTarget()).toEqual({ prefix: "C", zone: "ESTE" });
  });

  it("should openGroupModal with null target when no slots selected and no args", () => {
    state.openGroupModal([]);
    expect(state.groupModalOpen()).toBe(true);
    expect(state.groupTarget()).toBeNull();
  });

  it("should closeGroupModal and reset target", () => {
    state.openGroupModal([], "NORTE", "A");
    expect(state.groupModalOpen()).toBe(true);
    state.closeGroupModal();
    expect(state.groupModalOpen()).toBe(false);
    expect(state.groupTarget()).toBeNull();
  });

  it("should block updateSlotGroup if group has occupied slots", () => {
    const slots = [
      createSlot({ prefix: "A", status: "OCCUPIED", zone: "NORTE" }),
    ];
    state.updateSlotGroup(
      {
        currentPrefix: "A",
        currentZone: "NORTE",
        newPrefix: "B",
        newZone: "NORTE",
        parkingId: "p-1",
      },
      slots
    );

    expect(slotServiceMock.updateSlotGroup).not.toHaveBeenCalled();
    expect(toastServiceMock.showToast).toHaveBeenCalledWith({
      message:
        "No se puede modificar el grupo porque contiene plazas ocupadas o no disponibles.",
      type: "error",
    });
  });

  it("should successfully update group, close modal, and show toast", () => {
    const onDone = vi.fn();
    const slots = [
      createSlot({ prefix: "A", status: "AVAILABLE", zone: "NORTE" }),
    ];
    state.openGroupModal([], "NORTE", "A");
    state.updateSlotGroup(
      {
        currentPrefix: "A",
        currentZone: "NORTE",
        newPrefix: "B",
        newZone: "NORTE",
        parkingId: "p-1",
      },
      slots,
      onDone
    );

    expect(slotServiceMock.updateSlotGroup).toHaveBeenCalledWith({
      currentPrefix: "A",
      currentZone: "NORTE",
      newPrefix: "B",
      newZone: "NORTE",
      parkingId: "p-1",
    });
    expect(state.groupModalOpen()).toBe(false);
    expect(onDone).toHaveBeenCalled();
    expect(toastServiceMock.showToast).toHaveBeenCalledWith({
      message: "Grupo actualizado",
      type: "success",
    });
  });

  it("should handle service error in updateSlotGroup", () => {
    slotServiceMock.updateSlotGroup.mockReturnValue(
      throwError(() => ({ error: { message: "Error al cambiar grupo" } }))
    );
    const slots = [
      createSlot({ prefix: "A", status: "AVAILABLE", zone: "NORTE" }),
    ];
    state.updateSlotGroup(
      {
        currentPrefix: "A",
        currentZone: "NORTE",
        parkingId: "p-1",
      },
      slots
    );

    expect(toastServiceMock.showToast).toHaveBeenCalledWith({
      message: "Error al cambiar grupo",
      type: "error",
    });
  });
});
