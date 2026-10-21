export interface SimulateRateRequest {
  vehicleType: "CAR" | "MOTORCYCLE" | "BIKE";
  minutesStayed: number;
  pricePerUnit?: number;
  timeUnit?: "HOURS" | "MINUTES";
  gracePeriodMinutes?: number;
  ivaRate?: number;
}

export interface SimulateRateBreakpoint {
  concept: string;
  amount: number;
}

export interface SimulateRateResponse {
  name: string;
  subtotal: number;
  ivaRate: number;
  ivaAmount: number;
  total: number;
  breakpoints: SimulateRateBreakpoint[];
}
