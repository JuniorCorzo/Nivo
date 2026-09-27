export interface ParkingItem {
  id: string;
  name: string;
}

export interface ScopeState {
  mode: "GLOBAL" | "SINGLE";
  parkingId?: string;
}

export interface DashboardSummaryModel {
  scope: string;
  parkingId?: string;
  totalCapacity: number;
  occupiedSlots: number;
  availableSlots: number;
  occupancyRate: number;
  todayRevenue: number;
  currency?: string;
  avgStayMinutes?: number;
  totalTickets?: number;
  activeTickets?: number;
  completedTickets?: number;
}

export interface HourlyOccupancyPointModel {
  hourBucket: string;
  checkins: number;
  checkouts: number;
  totalCapacity: number;
  estimatedOccupancyRate: number;
}

export interface ParkingComparisonItemModel {
  parkingId: string;
  parkingName: string;
  totalSlots: number;
  occupiedSlots: number;
  occupancyRate: number;
  todayRevenue: number;
  activeTickets: number;
  avgStayMinutes: number;
}

export interface OperationalReportItemModel {
  ticketId: string;
  licensePlate: string;
  slotNumber: string;
  slotType: string;
  parkingName?: string;
  entryTime: string;
  exitTime?: string;
  durationMinutes?: number;
  ticketStatus: string;
  totalToCharge?: number;
  paymentStatus?: string;
  paymentMethod?: string;
  paidAmount?: number;
}

export interface PaginatedOperationalReportModel {
  items: OperationalReportItemModel[];
  page: number;
  totalPages: number;
  totalElements: number;
}

/* Domain type aliases for backward-compatibility */
export type DashboardSummary = DashboardSummaryModel;
export type HourlyOccupancyPoint = HourlyOccupancyPointModel;
export type ParkingComparisonItem = ParkingComparisonItemModel;
export type OperationalReportItem = OperationalReportItemModel;
