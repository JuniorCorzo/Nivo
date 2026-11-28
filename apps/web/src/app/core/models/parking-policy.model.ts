import type { RatePolicyOperation, RatePolicyTarget } from "./rate.model";

export interface ParkingLotPolicyModel {
  /**
   * Free or billed grace window in minutes
   */
  gracePeriodMinutes: number;

  /**
   * Fixed price charged during or after grace period
   */
  gracePeriodPrice: number;

  /**
   * Applicable tax rate (e.g. 0.19 for 19% IVA)
   */
  ivaRate: number;

  /**
   * Overstay/mora threshold in minutes (default 480 min = 8 hours)
   */
  overstayThresholdMinutes: number;

  /**
   * Surcharge applied when parking duration exceeds overstay threshold
   */
  overstaySurcharge: number;

  /**
   * Overstay calculation mode (FIXED surcharge vs HOURLY multiplier)
   */
  overstayMode?: "FIXED" | "HOURLY_PENALTY";
}

export interface CreateSpecialPolicyModel {
  name: string;
  modifies: RatePolicyTarget;
  operation: RatePolicyOperation;
  valueToModify: number;
}

export interface SpecialPolicyPreset {
  id: string;
  title: string;
  description: string;
  modifies: RatePolicyTarget;
  operation: RatePolicyOperation;
  defaultValue: number;
  badge: string;
}

export const SPECIAL_POLICY_PRESETS: SpecialPolicyPreset[] = [
  {
    badge: "Lavado / Servicio",
    defaultValue: 18_000,
    description: "Servicio opcional de lavado y embellecimiento en sede",
    id: "lavado-service",
    modifies: "SURCHARGE",
    operation: "SET",
    title: "Tarifa de Lavado Ecológico",
  },
  {
    badge: "Convenio",
    defaultValue: 15,
    description: "Descuento porcentual para convenios comerciales",
    id: "convenio-discount",
    modifies: "DISCOUNT",
    operation: "PERCENTAGE",
    title: "Convenio Comercial",
  },
  {
    badge: "Fidelidad",
    defaultValue: 2000,
    description: "Deducción fija en valor para clientes frecuentes",
    id: "frequent-discount",
    modifies: "DISCOUNT",
    operation: "SUBTRACT",
    title: "Cliente Frecuente",
  },
  {
    badge: "Tarifa Plana",
    defaultValue: 15_000,
    description: "Fijar tarifa total para jornada nocturna o evento",
    id: "flat-rate",
    modifies: "PRICE",
    operation: "SET",
    title: "Tarifa Plana Especial",
  },
];
