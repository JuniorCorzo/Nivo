import type {
  DashboardSummaryDto,
  HourlyOccupancyDto,
  OperationalReportDto,
  PageOperationalReportDto,
  ParkingComparisonDto,
} from "@core/api/generated/models";
import type {
  DashboardSummaryModel,
  HourlyOccupancyPointModel,
  OperationalReportItemModel,
  PaginatedOperationalReportModel,
  ParkingComparisonItemModel,
} from "@core/models/dashboard.model";

export const isDashboardSummaryDto = (
  val?: unknown
): val is DashboardSummaryDto => {
  if (!val || typeof val !== "object" || Array.isArray(val)) {
    return false;
  }
  /* SAFETY: val is verified to be a non-null, non-array object matching partial DTO */
  const candidate = val as Partial<DashboardSummaryDto>;
  return (
    typeof candidate.scope === "string" &&
    typeof candidate.totalCapacity === "number" &&
    typeof candidate.occupiedSlots === "number" &&
    typeof candidate.occupancyRate === "number" &&
    typeof candidate.todayRevenue === "number"
  );
};

export const mapToDashboardSummaryModel = (
  dto: DashboardSummaryDto
): DashboardSummaryModel => ({
  activeTickets: dto.activeTickets ?? undefined,
  availableSlots: dto.availableSlots ?? 0,
  avgStayMinutes: dto.avgStayMinutes ?? undefined,
  completedTickets: dto.completedTickets ?? undefined,
  currency: dto.currency ?? undefined,
  occupancyRate: dto.occupancyRate ?? 0,
  occupiedSlots: dto.occupiedSlots ?? 0,
  parkingId: dto.parkingId ?? undefined,
  scope: dto.scope ?? "GLOBAL",
  todayRevenue: dto.todayRevenue ?? 0,
  totalCapacity: dto.totalCapacity ?? 0,
  totalTickets: dto.totalTickets ?? undefined,
});

export const mapToHourlyOccupancyPoint = (
  dto: HourlyOccupancyDto
): HourlyOccupancyPointModel => ({
  checkins: dto.checkins ?? 0,
  checkouts: dto.checkouts ?? 0,
  estimatedOccupancyRate: dto.occupancyRate ?? 0,
  hourBucket: dto.hourBucket ?? "",
  totalCapacity: dto.totalCapacity ?? 0,
});

export const mapToParkingComparisonItem = (
  dto: ParkingComparisonDto
): ParkingComparisonItemModel => ({
  activeTickets: dto.activeTickets ?? 0,
  avgStayMinutes: dto.avgStayMinutes ?? 0,
  occupancyRate: dto.occupancyRate ?? 0,
  occupiedSlots: dto.occupiedSlots ?? 0,
  parkingId: dto.parkingId ?? "",
  parkingName: dto.parkingName ?? "Sin nombre",
  todayRevenue: dto.todayRevenue ?? 0,
  totalSlots: dto.totalSlots ?? 0,
});

export const mapToOperationalReportItem = (
  dto: OperationalReportDto
): OperationalReportItemModel => ({
  durationMinutes: dto.durationMinutes ?? undefined,
  entryTime: dto.entryTime ?? "",
  exitTime: dto.exitTime ?? undefined,
  licensePlate: dto.licensePlate ?? "---",
  paidAmount: dto.paidAmount ?? undefined,
  parkingName: dto.parkingName ?? undefined,
  paymentMethod: dto.paymentMethod ?? undefined,
  paymentStatus: dto.paymentStatus ?? undefined,
  slotNumber: dto.slotNumber ?? "---",
  slotType: dto.slotType ?? "CAR",
  ticketId: dto.ticketId ?? "",
  ticketStatus: dto.ticketStatus ?? "UNKNOWN",
  totalToCharge: dto.totalToCharge ?? undefined,
});

export const mapToPaginatedOperationalReport = (
  dto: PageOperationalReportDto
): PaginatedOperationalReportModel => ({
  items: (dto.content ?? []).map(mapToOperationalReportItem),
  page: dto.number ?? 0,
  totalElements: dto.totalElements ?? 0,
  totalPages: dto.totalPages ?? 1,
});
