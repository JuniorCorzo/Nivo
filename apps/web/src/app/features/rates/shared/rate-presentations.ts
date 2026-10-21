export interface Option {
  value: string;
  label: string;
}

export const VEHICLE_TYPE_OPTIONS: Option[] = [
  { label: "Carro", value: "CAR" },
  { label: "Moto", value: "MOTORCYCLE" },
  { label: "Bicicleta", value: "BIKE" },
];

export const VEHICLE_FILTER_OPTIONS: Option[] = [
  { label: "Todos los vehículos", value: "ALL" },
  ...VEHICLE_TYPE_OPTIONS,
];

export const TIME_UNIT_OPTIONS: Option[] = [
  { label: "Por Minuto", value: "MINUTES" },
  { label: "Por Hora", value: "HOURS" },
  { label: "Por Día", value: "DAYS" },
];

export const displayOptionFn = (item: Option | null | undefined): string =>
  item?.label ?? "";
export const valueOptionFn = (item: Option | null | undefined): string =>
  item?.value ?? "";
