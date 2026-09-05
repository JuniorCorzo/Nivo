import type { ParkingSlotStatus } from "@core/type/parking-slot.type";
import type { SlotType } from "@core/type/slot-distribution.type";

export interface Option {
  value: string;
  label: string;
}

export type SlotStatusVariant =
  | "success"
  | "warning"
  | "destructive"
  | "secondary";

export const SLOT_TYPE_LABELS = {
  BIKE: "Bicicleta",
  CAR: "Carro",
  DISABLED: "Discapacitado",
  ELECTRIC_VEHICLE: "Eléctrico",
  MOTORCYCLE: "Moto",
} satisfies Record<SlotType, string>;

export const SLOT_STATUS_LABELS = {
  AVAILABLE: "Disponible",
  MAINTENANCE: "Mantenimiento",
  OCCUPIED: "Ocupada",
  RESERVED: "Reservada",
} satisfies Record<ParkingSlotStatus, string>;

export const SLOT_STATUS_VARIANTS = {
  AVAILABLE: "success",
  MAINTENANCE: "warning",
  OCCUPIED: "destructive",
  RESERVED: "secondary",
} satisfies Record<ParkingSlotStatus, SlotStatusVariant>;

export const SLOT_TYPE_OPTIONS: Option[] = [
  { label: "Carro", value: "CAR" },
  { label: "Moto", value: "MOTORCYCLE" },
  { label: "Bicicleta", value: "BIKE" },
  { label: "Eléctrico", value: "ELECTRIC_VEHICLE" },
  { label: "Discapacitado", value: "DISABLED" },
];

export const SLOT_STATUS_OPTIONS: Option[] = [
  { label: "Disponible", value: "AVAILABLE" },
  { label: "Ocupada", value: "OCCUPIED" },
  { label: "Mantenimiento", value: "MAINTENANCE" },
  { label: "Reservada", value: "RESERVED" },
];

export const SLOT_STATUS_FILTER_OPTIONS: Option[] = [
  { label: "Estado: Todos", value: "" },
  ...SLOT_STATUS_OPTIONS,
];

export const SLOT_ZONE_FILTER_OPTIONS: Option[] = [
  { label: "Zona: Todas", value: "" },
  { label: "NORTE", value: "NORTE" },
  { label: "Z_MOTO", value: "Z_MOTO" },
  { label: "PISO_2", value: "PISO_2" },
];

export const displayOptionFn = (item: Option | null | undefined): string =>
  item?.label ?? "";
export const valueOptionFn = (item: Option | null | undefined): string =>
  item?.value ?? "";
