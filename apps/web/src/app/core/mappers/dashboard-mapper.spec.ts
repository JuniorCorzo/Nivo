import type {
  DashboardSummaryDto,
  HourlyOccupancyDto,
  OperationalReportDto,
  PageOperationalReportDto,
  ParkingComparisonDto,
} from "@core/api/generated/models";

import {
  isDashboardSummaryDto,
  mapToDashboardSummaryModel,
  mapToHourlyOccupancyPoint,
  mapToOperationalReportItem,
  mapToPaginatedOperationalReport,
  mapToParkingComparisonItem,
} from "./dashboard.mapper";

describe("DashboardMapper", () => {
  describe("isDashboardSummaryDto", () => {
    it("should return true for valid DashboardSummaryDto objects", () => {
      const validDto: DashboardSummaryDto = {
        availableSlots: 50,
        currency: "COP",
        occupancyRate: 50,
        occupiedSlots: 50,
        scope: "GLOBAL",
        todayRevenue: 100_000,
        totalCapacity: 100,
      };
      expect(isDashboardSummaryDto(validDto)).toBe(true);
    });

    it("should return false for null, undefined, primitive, or malformed objects", () => {
      expect(isDashboardSummaryDto(null)).toBe(false);
      expect(isDashboardSummaryDto()).toBe(false);
      expect(isDashboardSummaryDto("a string")).toBe(false);
      expect(isDashboardSummaryDto(123)).toBe(false);
      expect(isDashboardSummaryDto({})).toBe(false);
      expect(isDashboardSummaryDto({ scope: 123 })).toBe(false);
    });
  });

  describe("mapToDashboardSummaryModel", () => {
    it("should map complete DashboardSummaryDto to DashboardSummaryModel", () => {
      const dto: DashboardSummaryDto = {
        activeTickets: 25,
        availableSlots: 75,
        avgStayMinutes: 45.5,
        completedTickets: 30,
        currency: "COP",
        occupancyRate: 25,
        occupiedSlots: 25,
        parkingId: "pkg-1",
        scope: "SINGLE",
        todayRevenue: 250_000,
        totalCapacity: 100,
        totalTickets: 55,
      };

      const model = mapToDashboardSummaryModel(dto);

      expect(model).toEqual({
        activeTickets: 25,
        availableSlots: 75,
        avgStayMinutes: 45.5,
        completedTickets: 30,
        currency: "COP",
        occupancyRate: 25,
        occupiedSlots: 25,
        parkingId: "pkg-1",
        scope: "SINGLE",
        todayRevenue: 250_000,
        totalCapacity: 100,
        totalTickets: 55,
      });
    });

    it("should map incomplete DTO with safe fallbacks", () => {
      const dto: DashboardSummaryDto = {};
      const model = mapToDashboardSummaryModel(dto);

      expect(model.scope).toBe("GLOBAL");
      expect(model.totalCapacity).toBe(0);
      expect(model.occupiedSlots).toBe(0);
      expect(model.availableSlots).toBe(0);
      expect(model.occupancyRate).toBe(0);
      expect(model.todayRevenue).toBe(0);
      expect(model.parkingId).toBeUndefined();
    });
  });

  describe("mapToHourlyOccupancyPoint", () => {
    it("should map HourlyOccupancyDto to HourlyOccupancyPointModel", () => {
      const dto: HourlyOccupancyDto = {
        checkins: 12,
        checkouts: 8,
        hourBucket: "2026-09-26T10:00:00Z",
        occupancyRate: 64.5,
        totalCapacity: 150,
      };

      const point = mapToHourlyOccupancyPoint(dto);

      expect(point).toEqual({
        checkins: 12,
        checkouts: 8,
        estimatedOccupancyRate: 64.5,
        hourBucket: "2026-09-26T10:00:00Z",
        totalCapacity: 150,
      });
    });

    it("should handle empty or missing properties with default fallbacks", () => {
      const dto: HourlyOccupancyDto = {};
      const point = mapToHourlyOccupancyPoint(dto);

      expect(point.hourBucket).toBe("");
      expect(point.checkins).toBe(0);
      expect(point.checkouts).toBe(0);
      expect(point.totalCapacity).toBe(0);
      expect(point.estimatedOccupancyRate).toBe(0);
    });
  });

  describe("mapToParkingComparisonItem", () => {
    it("should map ParkingComparisonDto to ParkingComparisonItemModel", () => {
      const dto: ParkingComparisonDto = {
        activeTickets: 40,
        avgStayMinutes: 62,
        currency: "COP",
        occupancyRate: 80,
        occupiedSlots: 80,
        parkingId: "pkg-1",
        parkingName: "Sede Centro",
        todayRevenue: 500_000,
        totalSlots: 100,
      };

      const item = mapToParkingComparisonItem(dto);

      expect(item).toEqual({
        activeTickets: 40,
        avgStayMinutes: 62,
        occupancyRate: 80,
        occupiedSlots: 80,
        parkingId: "pkg-1",
        parkingName: "Sede Centro",
        todayRevenue: 500_000,
        totalSlots: 100,
      });
    });

    it("should handle missing properties with default fallbacks", () => {
      const dto: ParkingComparisonDto = {};
      const item = mapToParkingComparisonItem(dto);

      expect(item.parkingId).toBe("");
      expect(item.parkingName).toBe("Sin nombre");
      expect(item.totalSlots).toBe(0);
      expect(item.occupiedSlots).toBe(0);
      expect(item.occupancyRate).toBe(0);
      expect(item.todayRevenue).toBe(0);
      expect(item.activeTickets).toBe(0);
      expect(item.avgStayMinutes).toBe(0);
    });
  });

  describe("mapToOperationalReportItem", () => {
    it("should map OperationalReportDto to OperationalReportItemModel", () => {
      const dto: OperationalReportDto = {
        durationMinutes: 120,
        entryTime: "2026-09-26T08:00:00Z",
        exitTime: "2026-09-26T10:00:00Z",
        licensePlate: "ABC-123",
        paidAmount: 15_000,
        parkingName: "Sede Norte",
        paymentMethod: "CARD",
        paymentStatus: "PAID",
        slotNumber: "A-01",
        slotType: "CAR",
        ticketId: "t-100",
        ticketStatus: "CLOSED",
        totalToCharge: 15_000,
      };

      const item = mapToOperationalReportItem(dto);

      expect(item).toEqual({
        durationMinutes: 120,
        entryTime: "2026-09-26T08:00:00Z",
        exitTime: "2026-09-26T10:00:00Z",
        licensePlate: "ABC-123",
        paidAmount: 15_000,
        parkingName: "Sede Norte",
        paymentMethod: "CARD",
        paymentStatus: "PAID",
        slotNumber: "A-01",
        slotType: "CAR",
        ticketId: "t-100",
        ticketStatus: "CLOSED",
        totalToCharge: 15_000,
      });
    });

    it("should handle missing properties with default fallbacks", () => {
      const dto: OperationalReportDto = {};
      const item = mapToOperationalReportItem(dto);

      expect(item.ticketId).toBe("");
      expect(item.licensePlate).toBe("---");
      expect(item.slotNumber).toBe("---");
      expect(item.slotType).toBe("CAR");
      expect(item.entryTime).toBe("");
      expect(item.ticketStatus).toBe("UNKNOWN");
    });
  });

  describe("mapToPaginatedOperationalReport", () => {
    it("should map PageOperationalReportDto to PaginatedOperationalReportModel", () => {
      const pageDto: PageOperationalReportDto = {
        content: [
          {
            licensePlate: "DEF-456",
            ticketId: "t-200",
          },
        ],
        number: 2,
        totalElements: 25,
        totalPages: 3,
      };

      const paginated = mapToPaginatedOperationalReport(pageDto);

      expect(paginated.page).toBe(2);
      expect(paginated.totalPages).toBe(3);
      expect(paginated.totalElements).toBe(25);
      expect(paginated.items.length).toBe(1);
      expect(paginated.items[0]?.ticketId).toBe("t-200");
      expect(paginated.items[0]?.licensePlate).toBe("DEF-456");
    });

    it("should handle empty page DTO", () => {
      const paginated = mapToPaginatedOperationalReport({});

      expect(paginated.page).toBe(0);
      expect(paginated.totalPages).toBe(1);
      expect(paginated.totalElements).toBe(0);
      expect(paginated.items).toEqual([]);
    });
  });
});
