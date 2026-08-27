export type Option = { value: string; label: string };

export const VEHICLE_TYPE_OPTIONS: Option[] = [
  { value: 'CAR', label: 'Carro' },
  { value: 'MOTORCYCLE', label: 'Moto' },
  { value: 'BIKE', label: 'Bicicleta' },
];

export const VEHICLE_FILTER_OPTIONS: Option[] = [
  { value: 'ALL', label: 'Todos los vehículos' },
  ...VEHICLE_TYPE_OPTIONS,
];

export const TIME_UNIT_OPTIONS: Option[] = [
  { value: 'MINUTES', label: 'Por Minuto' },
  { value: 'HOURS', label: 'Por Hora' },
  { value: 'DAYS', label: 'Por Día' },
];

export const displayOptionFn = (item: unknown): string => (item as Option)?.label ?? '';
export const valueOptionFn = (item: unknown): string => (item as Option)?.value ?? '';
