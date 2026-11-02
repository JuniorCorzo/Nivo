import { AUTH_TEXTS } from "./auth.texts";
import { DATA_TABLE_TEXTS, SERVER_TEXTS } from "./common.texts";
import { DASHBOARD_TEXTS } from "./dashboard.texts";
import { LANDING_TEXTS } from "./landing.texts";
import {
  SIDEBAR_TEXTS,
  type SidebarNavGroup,
  type SidebarNavItem,
  sidebarNav,
  sidebarNavGroups,
} from "./navigation.texts";
import {
  CHECK_IN_TEXTS,
  OPERATIONS_TEXTS,
  PHOTO_CAPTURE_TEXTS,
} from "./operations.texts";
import { PARKING_TEXTS } from "./parking.texts";
import { SLOTS_TEXTS } from "./slots.texts";
import {
  PUBLIC_TICKET_TEXTS,
  TICKETS_TEXTS,
  TICKET_RECEIPT_TEXTS,
} from "./tickets.texts";
import { USERS_TEXTS } from "./users.texts";

export * from "./auth.texts";
export * from "./common.texts";
export * from "./dashboard.texts";
export * from "./landing.texts";
export * from "./navigation.texts";
export * from "./operations.texts";
export * from "./parking.texts";
export * from "./slots.texts";
export * from "./tickets.texts";
export * from "./users.texts";

export const APP_TEXTS = {
  auth: AUTH_TEXTS,
  checkIn: CHECK_IN_TEXTS,
  dashboard: DASHBOARD_TEXTS,
  dataTable: DATA_TABLE_TEXTS,
  landing: LANDING_TEXTS,
  operations: OPERATIONS_TEXTS,
  parking: PARKING_TEXTS,
  photoCapture: PHOTO_CAPTURE_TEXTS,
  publicTicket: PUBLIC_TICKET_TEXTS,
  server: SERVER_TEXTS,
  sidebar: SIDEBAR_TEXTS,
  slots: SLOTS_TEXTS,
  ticketReceipt: TICKET_RECEIPT_TEXTS,
  tickets: TICKETS_TEXTS,
  users: USERS_TEXTS,
} as const;
