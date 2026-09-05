import type { Signal } from "@angular/core";
import { signal } from "@angular/core";
import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";
import type { ParkingLotListItemModel } from "@core/models/parking.model";
import { ParkingService } from "@core/services/parking-service";

import { ParkingTable } from "./parking-table";

interface ParkingTableStatic {
  shouldRenderHeader: (
    header: { isPlaceholder: boolean; column: { parent?: unknown } },
    depth: number
  ) => boolean;
  headerCellClass: (
    header: { column: { id: string }; subHeaders: unknown[] },
    depth: number
  ) => string;
  titleForCell: (
    columnId: string,
    parkingLot:
      | ParkingLotListItemModel
      | { address?: unknown; slotDistribution?: unknown }
  ) => string | null;
}

interface ParkingTableInternal {
  contentClass: (id: string) => string;
  rowSpanForHeader: (
    header: { subHeaders: unknown[] },
    depth: number
  ) => number;
  headerRowClass: (depth: number) => string;
}

interface MockParkingService {
  parkingLots: Signal<ParkingLotListItemModel[]>;
}

describe("ParkingTable", () => {
  let fixture: ComponentFixture<ParkingTable>;
  let component: ParkingTable;
  let internals: ParkingTableInternal;
  let staticHelpers: ParkingTableStatic;
  let mockParkingLotsSignal: ReturnType<
    typeof signal<ParkingLotListItemModel[]>
  >;
  let mockParkingService: MockParkingService;

  const mockParkingLot: ParkingLotListItemModel = {
    address: {
      city: "Bogotá",
      country: "Colombia",
      state: "Cundinamarca",
      street: "Calle 100 # 15-20",
      zipCode: "110111",
    },
    coordinates: {
      latitude: 4.6097,
      longitude: -74.0817,
    },
    createdAt: "2026-01-01T00:00:00Z",
    currency: "COP",
    id: "lot-1",
    name: "Parqueadero Central",
    occuppationRate: 50,
    operatingHours: {
      closeTime: "22:00:00-05:00",
      openTime: "06:00:00-05:00",
    },
    ownerName: "Juan Pérez",
    slotDistribution: [
      { count: 20, prefix: "A", type: "CAR", zone: "Norte" },
      { count: 10, prefix: "M", type: "MOTORCYCLE", zone: "Sur" },
    ],
    totalCapacity: 30,
    updatedAt: "2026-01-01T00:00:00Z",
  };

  beforeEach(async () => {
    mockParkingLotsSignal = signal<ParkingLotListItemModel[]>([mockParkingLot]);
    mockParkingService = {
      parkingLots: mockParkingLotsSignal,
    };

    await TestBed.configureTestingModule({
      imports: [ParkingTable],
      providers: [{ provide: ParkingService, useValue: mockParkingService }],
    }).compileComponents();

    fixture = TestBed.createComponent(ParkingTable);
    component = fixture.componentInstance;
    /* SAFETY: Accessing protected methods for unit tests */
    internals = component as never;
    /* SAFETY: Accessing static helper methods */
    staticHelpers = ParkingTable as never;
    fixture.detectChanges();
  });

  it("should create the component instance", () => {
    expect(component).toBeTruthy();
  });

  describe("shouldRenderHeader static helper", () => {
    it("should always return true for root depth (0)", () => {
      const header = {
        column: { parent: undefined },
        isPlaceholder: false,
      };
      expect(staticHelpers.shouldRenderHeader(header, 0)).toBeTrue();
    });

    it("should return true when depth > 0, has parent column, and is not placeholder", () => {
      const header = {
        column: { parent: { id: "group" } },
        isPlaceholder: false,
      };
      expect(staticHelpers.shouldRenderHeader(header, 1)).toBeTrue();
    });

    it("should return false when depth > 0 and header is placeholder", () => {
      const header = {
        column: { parent: { id: "group" } },
        isPlaceholder: true,
      };
      expect(staticHelpers.shouldRenderHeader(header, 1)).toBeFalse();
    });

    it("should return false when depth > 0 and column has no parent", () => {
      const header = {
        column: { parent: undefined },
        isPlaceholder: false,
      };
      expect(staticHelpers.shouldRenderHeader(header, 1)).toBeFalse();
    });
  });

  describe("headerCellClass static helper", () => {
    it("should return default classes when subHeaders length <= 1", () => {
      const header = {
        column: { id: "name" },
        subHeaders: [{}],
      };
      expect(staticHelpers.headerCellClass(header, 0)).toBe(
        "!align-bottom pb-3"
      );
    });

    it("should append centered classes when subHeaders length > 1", () => {
      const header = {
        column: { id: "group" },
        subHeaders: [{}, {}],
      };
      expect(staticHelpers.headerCellClass(header, 0)).toBe(
        "!align-bottom pb-3 flex justify-center align-bottom!"
      );
    });
  });

  describe("titleForCell static helper", () => {
    it("should return name string for 'name' columnId", () => {
      expect(staticHelpers.titleForCell("name", mockParkingLot)).toBe(
        "Parqueadero Central"
      );
    });

    it("should return ownerName string for 'ownerName' columnId", () => {
      expect(staticHelpers.titleForCell("ownerName", mockParkingLot)).toBe(
        "Juan Pérez"
      );
    });

    it("should return currency string for 'currency' columnId", () => {
      expect(staticHelpers.titleForCell("currency", mockParkingLot)).toBe(
        "COP"
      );
    });

    it("should return formatted address for 'address' columnId", () => {
      expect(staticHelpers.titleForCell("address", mockParkingLot)).toBe(
        "Calle 100 # 15-20, Bogotá"
      );
    });

    it("should return null for 'address' columnId when address is missing", () => {
      const lotWithoutAddress = {
        ...mockParkingLot,
        address: undefined,
      };
      expect(
        staticHelpers.titleForCell("address", lotWithoutAddress)
      ).toBeNull();
    });

    it("should return formatted slot distribution for 'slotDistribution' columnId", () => {
      expect(
        staticHelpers.titleForCell("slotDistribution", mockParkingLot)
      ).toBe("CAR: 20 | MOTORCYCLE: 10");
    });

    it("should return null for 'slotDistribution' columnId when distribution is missing", () => {
      const lotWithoutSlots = {
        ...mockParkingLot,
        slotDistribution: undefined,
      };
      expect(
        staticHelpers.titleForCell("slotDistribution", lotWithoutSlots)
      ).toBeNull();
    });

    it("should return formatted occupancy string for 'occupancy' columnId", () => {
      expect(staticHelpers.titleForCell("occupancy", mockParkingLot)).toBe(
        "15 / 30 ocupados (50%)"
      );
    });

    it("should return formatted occupancy string for 'occuppationRate' columnId", () => {
      expect(
        staticHelpers.titleForCell("occuppationRate", mockParkingLot)
      ).toBe("15 / 30 ocupados (50%)");
    });

    it("should return null for unknown columnId", () => {
      expect(staticHelpers.titleForCell("actions", mockParkingLot)).toBeNull();
    });
  });

  describe("contentClass helper", () => {
    it("should return truncate and font-medium classes for 'name' column", () => {
      const classes = internals.contentClass("name");
      expect(classes).toContain("block");
      expect(classes).toContain("max-w-full");
      expect(classes).toContain("truncate");
      expect(classes).toContain("font-medium");
    });

    it("should return truncate classes for 'address' and 'ownerName' columns", () => {
      const addressClasses = internals.contentClass("address");
      expect(addressClasses).toContain("block max-w-full truncate");

      const ownerClasses = internals.contentClass("ownerName");
      expect(ownerClasses).toContain("block max-w-full truncate");
    });

    it("should return font-mono uppercase classes for 'currency' column", () => {
      const classes = internals.contentClass("currency");
      expect(classes).toContain("font-mono");
      expect(classes).toContain("uppercase");
    });

    it("should return empty string for unstyled columns", () => {
      const classes = internals.contentClass("unrecognized");
      expect(classes).toBe("");
    });
  });

  describe("rowSpanForHeader and headerRowClass helpers", () => {
    it("should return 1 when header has multiple subHeaders", () => {
      const result = internals.rowSpanForHeader({ subHeaders: [{}, {}] }, 0);
      expect(result).toBe(1);
    });

    it("should return remaining depth when header has 1 or 0 subHeaders", () => {
      const result = internals.rowSpanForHeader({ subHeaders: [] }, 0);
      expect(result).toBeGreaterThanOrEqual(1);
    });

    it("should return appropriate border class for header rows", () => {
      const lastRowClass = internals.headerRowClass(0);
      expect(lastRowClass).toContain("hover:!bg-transparent");
    });
  });

  describe("searchQuery input", () => {
    it("should accept searchQuery input", () => {
      fixture.componentRef.setInput("searchQuery", "Central");
      fixture.detectChanges();
      expect(component.searchQuery()).toBe("Central");
    });
  });
});
