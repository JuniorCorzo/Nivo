import { TestBed } from "@angular/core/testing";
import { SlotService } from "@core/services/slot-service";
import { ToastService } from "@nivo-sass/design-system";
import { of, throwError } from "rxjs";

import { SlotMetadataBatchState } from "./slot-metadata-batch.state";

interface MockSlotService {
  updateSlotMetadata: ReturnType<typeof vi.fn>;
}

interface MockToastService {
  showToast: ReturnType<typeof vi.fn>;
}

describe("SlotMetadataBatchState", () => {
  let state: SlotMetadataBatchState;
  let slotServiceMock: MockSlotService;
  let toastServiceMock: MockToastService;

  beforeEach(() => {
    slotServiceMock = {
      updateSlotMetadata: vi.fn().mockReturnValue(of([])),
    };
    toastServiceMock = {
      showToast: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        SlotMetadataBatchState,
        { provide: SlotService, useValue: slotServiceMock },
        { provide: ToastService, useValue: toastServiceMock },
      ],
    });

    state = TestBed.inject(SlotMetadataBatchState);
  });

  it("should have metadataModalOpen as false initially", () => {
    expect(state.metadataModalOpen()).toBe(false);
  });

  it("should not open modal when selectedCount is 0", () => {
    state.openMetadataModal(0);
    expect(state.metadataModalOpen()).toBe(false);
  });

  it("should open modal when selectedCount > 0", () => {
    state.openMetadataModal(3);
    expect(state.metadataModalOpen()).toBe(true);
  });

  it("should close modal", () => {
    state.openMetadataModal(2);
    expect(state.metadataModalOpen()).toBe(true);
    state.closeMetadataModal();
    expect(state.metadataModalOpen()).toBe(false);
  });

  it("should not call service if parkingId is null", () => {
    state.updateSlotsMetadata({ slotIds: ["1"] }, null);
    expect(slotServiceMock.updateSlotMetadata).not.toHaveBeenCalled();
  });

  it("should update metadata successfully, close modal, call onDone, and show success toast", () => {
    const onDone = vi.fn();
    state.openMetadataModal(1);
    state.updateSlotsMetadata(
      { hasCharger: true, slotIds: ["1"] },
      "parking-1",
      onDone
    );

    expect(slotServiceMock.updateSlotMetadata).toHaveBeenCalledWith({
      hasCharger: true,
      slotIds: ["1"],
    });
    expect(state.metadataModalOpen()).toBe(false);
    expect(onDone).toHaveBeenCalled();
    expect(toastServiceMock.showToast).toHaveBeenCalledWith({
      message: "Equipamiento actualizado",
      type: "success",
    });
  });

  it("should show error toast when service fails", () => {
    slotServiceMock.updateSlotMetadata.mockReturnValue(
      throwError(() => ({
        error: { message: "Error al actualizar" },
      }))
    );

    state.updateSlotsMetadata({ slotIds: ["1"] }, "parking-1");

    expect(toastServiceMock.showToast).toHaveBeenCalledWith({
      message: "Error al actualizar",
      type: "error",
    });
  });
});
