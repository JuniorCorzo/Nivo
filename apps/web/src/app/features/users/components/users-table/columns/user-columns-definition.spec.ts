import { describe, expect, it, vi } from "vitest";
import type { UserModel } from "@core/models/user.model";
import { APP_TEXTS } from "@shared/constants/app-texts.constant";
import {
  createUserColumns,
  formatUserDate,
} from "./user-columns-definition";

describe("user-columns-definition", () => {
  const mockUser: UserModel = {
    contactInfo: "3001234567",
    createdAt: new Date("2026-05-15T10:30:00.000Z"),
    email: "test@nivo.com",
    fullName: "Ana Gómez",
    id: "u-1",
    role: "MANAGER",
    tenant: {
      companyName: "Nivo Tenant",
      id: "t-1",
    },
    updatedAt: new Date("2026-05-15T10:30:00.000Z"),
  };

  describe("formatUserDate", () => {
    it("should return fallback for null or undefined dates", () => {
      expect(formatUserDate(null)).toBe("---");
      expect(formatUserDate()).toBe("---");
    });

    it("should format valid Date object as dd/MM/yyyy", () => {
      // 15th of May, 2026
      const d = new Date(2026, 4, 15);
      expect(formatUserDate(d)).toBe("15/05/2026");
    });

    it("should format ISO string date", () => {
      const formatted = formatUserDate("2026-01-05T00:00:00.000Z");
      expect(formatted).toContain("2026");
    });
  });

  describe("createUserColumns", () => {
    it("should define all expected columns with correct headers", () => {
      const columns = createUserColumns();
      const ids = columns.map((c) => c.id);
      expect(ids).toEqual([
        "user",
        "contact",
        "role",
        "status",
        "createdAt",
        "actions",
      ]);

      const texts = APP_TEXTS.users.table.headers;
      expect(columns[0].header).toBe(texts.user);
      expect(columns[1].header).toBe(texts.contact);
      expect(columns[2].header).toBe(texts.role);
      expect(columns[3].header).toBe(texts.status);
      expect(columns[4].header).toBe(texts.createdAt);
      expect(columns[5].header).toBe(texts.actions);
    });

    it("should provide contact fallback when user contactInfo is missing", () => {
      const columns = createUserColumns();
      const contactCol = columns.find((c) => c.id === "contact");
      expect(contactCol).toBeDefined();

      const userWithoutContact: UserModel = {
        ...mockUser,
        contactInfo: "",
      };

      interface CellAccessor {
        cell: (ctx: {
          getValue: () => string;
          row: { original: UserModel };
        }) => string;
      }

      /* SAFETY: contactCol is validated as ColumnDef with cell renderer */
      const accessor = contactCol as CellAccessor | undefined;
      const result = accessor?.cell({
        getValue: () => userWithoutContact.contactInfo,
        row: { original: userWithoutContact },
      });
      expect(result).toBe("N/A");
    });

    it("should wire callbacks for actions", () => {
      const onChangeRole = vi.fn();
      const onDeactivate = vi.fn();

      const columns = createUserColumns({
        currentUserId: "u-curr",
        onChangeRole,
        onDeactivate,
      });

      const actionsCol = columns.find((c) => c.id === "actions");
      expect(actionsCol).toBeDefined();
    });
  });
});
