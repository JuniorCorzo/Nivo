import { signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { ActivatedRoute, convertToParamMap, provideRouter, Router } from "@angular/router";
import type { ParkingLotListItemModel } from "@core/models/parking.model";
import type { SlotSummary } from "@core/models/slot.model";
import { ParkingService } from "@core/services/parking-service";
import { SlotService } from "@core/services/slot-service";
import { ToastService } from "@nivo-sass/design-system";
import { of } from "rxjs";

import { ParkingSlotFormFacade } from "./parking-slot-form.facade";

const mockParking: ParkingLotListItemModel = {
  address: { city: "", country: "", state: "", street: "", zipCode: "" },
  coordinates: { latitude: 0, longitude: 0 },
  createdAt: "",
  currency: "COP",
  id: "parking-1",
  name: "Parqueadero Central",
  occuppationRate: 0,
  ownerName: "Admin",
  slotDistribution: [],
  totalCapacity: 10,
  updatedAt: "",
};

const mockSlot: SlotSummary = {
  hasCharger: true,
  id: "slot-1",
  isAccessible: true,
  isActive: false,
  parkingName: "Parqueadero Central",
  prefix: "A",
  slotNumber: "A-001",
  status: "AVAILABLE",
  type: "CAR",
  zone: "NORTE",
};

interface MockSlotService {
  createBatch: ReturnType<typeof vi.fn>;
  getAllSlotSummariesByParkingId: ReturnType<typeof vi.fn>;
  summaries: ReturnType<typeof signal<{ [k: string]: SlotSummary[] }>>;
  update: ReturnType<typeof vi.fn>;
  updateSlotMetadata: ReturnType<typeof vi.fn>;
}

interface MockToastService {
  showToast: ReturnType<typeof vi.fn>;
}

describe("ParkingSlotFormFacade", () => {
  let facade: ParkingSlotFormFacade;
  let slotServiceMock: MockSlotService;
  let toastMock: MockToastService;
  let router: Router;

  const setup = (params: Record<string, string>, slots: SlotSummary[] = []) => {
    slotServiceMock = {
      createBatch: vi.fn().mockReturnValue(of([])),
      getAllSlotSummariesByParkingId: vi.fn().mockReturnValue(of(slots)),
      summaries: signal<{ [k: string]: SlotSummary[] }>({
        "parking-1": slots,
      }),
      update: vi.fn().mockReturnValue(of(mockSlot)),
      updateSlotMetadata: vi.fn().mockReturnValue(of([])),
    };

    toastMock = {
      showToast: vi.fn(),
    };

    const parkingServiceMock = {
      parkingLots: signal([mockParking]),
    };

    TestBed.configureTestingModule({
      providers: [
        ParkingSlotFormFacade,
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of(convertToParamMap(params)),
            snapshot: { paramMap: convertToParamMap(params) },
          },
        },
        { provide: SlotService, useValue: slotServiceMock },
        { provide: ParkingService, useValue: parkingServiceMock },
        { provide: ToastService, useValue: toastMock },
      ],
    });

    facade = TestBed.inject(ParkingSlotFormFacade);
    router = TestBed.inject(Router);
    vi.spyOn(router, "navigate").mockResolvedValue(true);
  };

  describe("create mode", () => {
    beforeEach(() => {
      setup({ parkingId: "parking-1" });
    });

    it("should initialize default metadata flags", () => {
      expect(facade.form.hasCharger()).toBe(false);
      expect(facade.form.isAccessible()).toBe(false);
      expect(facade.form.isActive()).toBe(true);
    });
  });

  describe("edit mode", () => {
    beforeEach(() => {
      setup({ parkingId: "parking-1", slotId: "slot-1" }, [mockSlot]);
      TestBed.flushEffects();
    });

    it("should populate metadata flags from currentSlot", () => {
      expect(facade.form.hasCharger()).toBe(true);
      expect(facade.form.isAccessible()).toBe(true);
      expect(facade.form.isActive()).toBe(false);
    });

    it("should update slot and persist metadata on submit in edit mode", () => {
      facade.form.hasCharger.set(false);
      facade.form.isAccessible.set(true);
      facade.form.isActive.set(true);

      facade.submit();

      expect(slotServiceMock.update).toHaveBeenCalled();
      expect(slotServiceMock.updateSlotMetadata).toHaveBeenCalledWith({
        hasCharger: false,
        isAccessible: true,
        isActive: true,
        slotIds: ["slot-1"],
      });
      expect(toastMock.showToast).toHaveBeenCalledWith({
        message: "Cambios guardados",
        type: "success",
      });
      expect(router.navigate).toHaveBeenCalledWith(["/app/parking-lots/parking-1/slots"]);
    });
  });
});
