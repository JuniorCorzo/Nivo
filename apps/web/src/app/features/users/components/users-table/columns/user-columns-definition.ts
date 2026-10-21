import type { UserModel } from "@core/models/user.model";
import { APP_TEXTS } from "@shared/constants/app-texts.constant";
import type { ColumnDef } from "@tanstack/angular-table";
import {
  createColumnHelper,
  flexRenderComponent,
} from "@tanstack/angular-table";

import {
  UserInfoCellComponent,
  UserRoleBadgeComponent,
  UserRowActionsComponent,
  UserStatusBadgeComponent,
} from "../cells";

export const formatUserDate = (date?: Date | string | null): string => {
  if (!date) {
    return "---";
  }
  const d = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(d.getTime())) {
    return String(date);
  }
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

export interface UserColumnsOptions {
  currentUserId?: string;
  onChangeRole?: (user: UserModel) => void;
  onDeactivate?: (user: UserModel) => void;
}

const columnHelper = createColumnHelper<UserModel>();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type UserTableColumn = ColumnDef<UserModel, any>;

export const createUserColumns = (
  options: UserColumnsOptions = {}
): UserTableColumn[] => [
  columnHelper.accessor("fullName", {
    cell: (info) =>
      flexRenderComponent(UserInfoCellComponent, {
        inputs: { user: info.row.original },
      }),
    enableSorting: true,
    filterFn: (row, _columnId, filterValue: string) => {
      if (!filterValue) {
        return true;
      }
      const search = filterValue.trim().toLowerCase();
      const name = (row.original.fullName ?? "").toLowerCase();
      const email = (row.original.email ?? "").toLowerCase();
      return name.includes(search) || email.includes(search);
    },
    header: APP_TEXTS.users.table.headers.user,
    id: "user",
  }),
  columnHelper.accessor("contactInfo", {
    cell: (info) => info.getValue() || "N/A",
    enableSorting: true,
    header: APP_TEXTS.users.table.headers.contact,
    id: "contact",
  }),
  columnHelper.accessor("role", {
    cell: (info) =>
      flexRenderComponent(UserRoleBadgeComponent, {
        inputs: { role: info.getValue() },
      }),
    enableSorting: true,
    filterFn: (row, columnId, filterValue: string) =>
      !filterValue ||
      filterValue === "ALL" ||
      row.getValue(columnId) === filterValue,
    header: APP_TEXTS.users.table.headers.role,
    id: "role",
  }),
  columnHelper.accessor((row) => (row.deletedAt ? "INACTIVE" : "ACTIVE"), {
    cell: (info) =>
      flexRenderComponent(UserStatusBadgeComponent, {
        inputs: { isActive: info.getValue() === "ACTIVE" },
      }),
    enableSorting: true,
    filterFn: (row, columnId, filterValue: string) =>
      !filterValue ||
      filterValue === "ALL" ||
      row.getValue(columnId) === filterValue,
    header: APP_TEXTS.users.table.headers.status,
    id: "status",
  }),
  columnHelper.accessor("createdAt", {
    cell: (info) => formatUserDate(info.getValue()),
    enableSorting: true,
    header: APP_TEXTS.users.table.headers.createdAt,
    id: "createdAt",
  }),
  columnHelper.display({
    cell: (info) =>
      flexRenderComponent(UserRowActionsComponent, {
        inputs: {
          isSelf: Boolean(
            options.currentUserId &&
            info.row.original.id === options.currentUserId
          ),
          user: info.row.original,
        },
        outputs: {
          changeRole: (user: UserModel) => options.onChangeRole?.(user),
          deactivate: (user: UserModel) => options.onDeactivate?.(user),
        },
      }),
    enableSorting: false,
    header: APP_TEXTS.users.table.headers.actions,
    id: "actions",
  }),
];
