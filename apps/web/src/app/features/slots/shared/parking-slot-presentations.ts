import { ParkingSlotStatus } from '@core/type/parking-slot.type';
import { SlotType } from '@core/type/slot-distribution.type';

export type Option = { value: string; label: string };

export type SlotStatusVariant = 'success' | 'warning' | 'destructive' | 'secondary';

export const SLOT_TYPE_LABELS: Record<SlotType, string> = {
  CAR: 'Carro',
  MOTORCYCLE: 'Moto',
  BIKE: 'Bicicleta',
  ELECTRIC_VEHICLE: 'Eléctrico',
  DISABLED: 'Discapacitado',
};

export const SLOT_STATUS_LABELS: Record<ParkingSlotStatus, string> = {
  AVAILABLE: 'Disponible',
  OCCUPIED: 'Ocupada',
  MAINTENANCE: 'Mantenimiento',
  RESERVED: 'Reservada',
};

export const SLOT_STATUS_VARIANTS: Record<ParkingSlotStatus, SlotStatusVariant> = {
  AVAILABLE: 'success',
  OCCUPIED: 'destructive',
  MAINTENANCE: 'warning',
  RESERVED: 'secondary',
};

export const SLOT_TYPE_OPTIONS: Option[] = [
  { value: 'CAR', label: 'Carro' },
  { value: 'MOTORCYCLE', label: 'Moto' },
  { value: 'BIKE', label: 'Bicicleta' },
  { value: 'ELECTRIC_VEHICLE', label: 'Eléctrico' },
  { value: 'DISABLED', label: 'Discapacitado' },
];

export const SLOT_STATUS_OPTIONS: Option[] = [
  { value: 'AVAILABLE', label: 'Disponible' },
  { value: 'OCCUPIED', label: 'Ocupada' },
  { value: 'MAINTENANCE', label: 'Mantenimiento' },
  { value: 'RESERVED', label: 'Reservada' },
];

export const SLOT_STATUS_FILTER_OPTIONS: Option[] = [
  { value: '', label: 'Estado: Todos' },
  ...SLOT_STATUS_OPTIONS,
];

export const SLOT_ZONE_FILTER_OPTIONS: Option[] = [
  { value: '', label: 'Zona: Todas' },
  { value: 'NORTE', label: 'NORTE' },
  { value: 'Z_MOTO', label: 'Z_MOTO' },
  { value: 'PISO_2', label: 'PISO_2' },
];

export const displayOptionFn = (item: unknown): string => (item as Option).label;
export const valueOptionFn = (item: unknown): string => (item as Option).value;
