import type { SlotSummaryResponse } from "@core/api/generated/models";

import { mapToSlotSummary } from "./slot-service";

describe("mapToSlotSummary", () => {
  it("should map hasTicket and hasHistory when true", () => {
    const api: SlotSummaryResponse = {
      hasHistory: true,
      hasTicket: true,
      id: "abc",
      numberSlot: "001",
      parkingName: "Test",
      prefix: "P",
      status: "OCCUPIED",
      type: "CAR",
      zone: "A",
    };

    const result = mapToSlotSummary(api);

    expect(result.hasTicket).toBe(true);
    expect(result.hasHistory).toBe(true);
    expect(result.status).toBe("OCCUPIED");
  });

  it("should map hasTicket and hasHistory when false", () => {
    const api: SlotSummaryResponse = {
      hasHistory: false,
      hasTicket: false,
      id: "abc",
      numberSlot: "002",
      parkingName: "Test",
      prefix: "Q",
      status: "AVAILABLE",
      type: "MOTORCYCLE",
      zone: "B",
    };

    const result = mapToSlotSummary(api);

    expect(result.hasTicket).toBe(false);
    expect(result.hasHistory).toBe(false);
    expect(result.status).toBe("AVAILABLE");
  });

  it("should default hasTicket/hasHistory to false when undefined", () => {
    const api: SlotSummaryResponse = {
      id: "abc",
      numberSlot: "003",
      parkingName: "Test",
      prefix: "R",
      status: "MAINTENANCE",
      type: "BIKE",
      zone: "C",
    };

    const result = mapToSlotSummary(api);

    expect(result.hasTicket).toBe(false);
    expect(result.hasHistory).toBe(false);
    expect(result.status).toBe("MAINTENANCE");
  });
});
