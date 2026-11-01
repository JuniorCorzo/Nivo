export interface OccupiedSlotDetail {
  slotNumber: string;
  zone?: string;
  prefix?: string;
  type: string;
  licensePlate?: string;
}

export interface ParkingTelemetryModel {
  parkingId: string;
  totalCapacity: number;
  occupiedSlots: number;
  availableSlots: number;
  occupancyRate: number;
  carTotal: number;
  carOccupied: number;
  carRate: number;
  motoTotal: number;
  motoOccupied: number;
  motoRate: number;
  shiftRevenue?: number;
  averageTicketRevenue?: number;
  totalTicketsToday?: number;
  activeTickets?: number;
  completedTicketsToday?: number;
  avgStayMinutes?: number;
  rotationIndex?: number;
  moraCount?: number;
  shiftTargetPercentage?: number;
  occupiedSlotsDetail?: OccupiedSlotDetail[];
}
