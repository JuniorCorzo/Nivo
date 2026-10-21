import type { SlotSummary } from "@core/models/slot.model";
import { FlexRenderComponent } from "@tanstack/angular-table";

import { parkingSlotColumnDefinition } from "./parking-slot-column-definition";

interface ColumnWithAccessorKey {
  accessorKey?: string;
}

const isFn = (val: unknown): val is (...args: readonly never[]) => void =>
  Boolean(val && typeof val === "function");

describe("parkingSlotColumnDefinition", () => {
  const dummySlot: SlotSummary = {
    hasCharger: true,
    id: "slot-123",
    isAccessible: true,
    isActive: false,
    parkingName: "Test Parking",
    prefix: "A",
    slotNumber: "A-01",
    status: "AVAILABLE",
    type: "CAR",
    zone: "Norte",
  };

  it("should generate 8 column definitions with default options", () => {
    const cols = parkingSlotColumnDefinition();
    expect(cols.length).toBe(8);
    /* SAFETY: TanStack column definition display columns have id or accessorKey */
    const ids = cols.map((c) => c.id ?? (c as ColumnWithAccessorKey).accessorKey);
    expect(ids).toEqual([
      "select",
      "slotNumber",
      "zone",
      "type",
      "hasCharger",
      "isAccessible",
      "status",
      "actions",
    ]);
  });

  it("should configure select column header and cell with callbacks", () => {
    const allSelectedSpy = vi.fn().mockReturnValue(true);
    const onToggleAllSpy = vi.fn();
    const isSelectedSpy = vi.fn().mockReturnValue(true);
    const onToggleSelectedSpy = vi.fn();

    const cols = parkingSlotColumnDefinition({
      allSelected: allSelectedSpy,
      isSelected: isSelectedSpy,
      onToggleAll: onToggleAllSpy,
      onToggleSelected: onToggleSelectedSpy,
    });

    const [selectCol] = cols;
    expect(selectCol.id).toBe("select");
    expect(selectCol.header).toBeTypeOf("function");
    expect(selectCol.cell).toBeTypeOf("function");

    if (isFn(selectCol.header)) {
      /* SAFETY: Header context mock for testing column definition */
      const headerResult = selectCol.header({} as never);
      expect(headerResult).toBeInstanceOf(FlexRenderComponent);
      if (headerResult instanceof FlexRenderComponent) {
        expect(headerResult.inputs?.["checked"]).toBe(true);
        headerResult.outputs?.["toggle"]?.(false);
        expect(onToggleAllSpy).toHaveBeenCalledWith(false);
      }
    }

    if (isFn(selectCol.cell)) {
      /* SAFETY: Row context mock for testing column definition */
      const cellResult = selectCol.cell({
        row: { original: dummySlot },
      } as never);
      expect(cellResult).toBeInstanceOf(FlexRenderComponent);
      if (cellResult instanceof FlexRenderComponent) {
        expect(cellResult.inputs?.["checked"]).toBe(true);
        expect(isSelectedSpy).toHaveBeenCalledWith("slot-123");
        cellResult.outputs?.["toggle"]?.(true);
        expect(onToggleSelectedSpy).toHaveBeenCalledWith("slot-123", true);
      }
    }
  });

  it("should pass row actions callbacks", () => {
    const onChangeStatus = vi.fn();
    const onDelete = vi.fn();
    const onEdit = vi.fn();
    const onViewDetail = vi.fn();

    const cols = parkingSlotColumnDefinition({
      onChangeStatus,
      onDelete,
      onEdit,
      onViewDetail,
    });

    const actionsCol = cols.find((c) => c.id === "actions");
    expect(actionsCol).toBeDefined();

    if (actionsCol && isFn(actionsCol.cell)) {
      /* SAFETY: Row context mock for testing column definition */
      const component = actionsCol.cell({
        row: { original: dummySlot },
      } as never);
      expect(component).toBeInstanceOf(FlexRenderComponent);
      if (component instanceof FlexRenderComponent) {
        expect(component.inputs?.["slot"]).toEqual(dummySlot);

        component.outputs?.["changeStatus"]?.(dummySlot);
        expect(onChangeStatus).toHaveBeenCalledWith(dummySlot);

        component.outputs?.["delete"]?.(dummySlot);
        expect(onDelete).toHaveBeenCalledWith(dummySlot);

        component.outputs?.["edit"]?.(dummySlot);
        expect(onEdit).toHaveBeenCalledWith(dummySlot);

        component.outputs?.["viewDetail"]?.(dummySlot);
        expect(onViewDetail).toHaveBeenCalledWith(dummySlot);
      }
    }
  });
});
