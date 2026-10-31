export type PageHeaderBadgeVariant =
  | "info"
  | "success"
  | "warning"
  | "destructive"
  | "secondary";

export interface PageHeaderBreadcrumbItem {
  label: string;
  url?: string;
  icon?: string;
  isParking?: boolean;
}

export const resolveBreadcrumbIcon = (
  item: PageHeaderBreadcrumbItem
): string => {
  if (item.icon) {
    return item.icon;
  }
  if (item.url === "/app" || item.label.toLowerCase() === "home") {
    return "lucideHome";
  }
  if (item.isParking) {
    return "lucideBuilding2";
  }
  const lower = item.label.toLowerCase();
  if (lower.includes("parqueadero") || lower.includes("sede")) {
    return "lucideParkingSquare";
  }
  if (lower.includes("plaza")) {
    return "lucideLayoutGrid";
  }
  if (lower.includes("tarifa")) {
    return "lucideCoins";
  }
  if (lower.includes("operaci")) {
    return "lucideCar";
  }
  if (lower.includes("ticket")) {
    return "lucideTicket";
  }
  return "lucideLayoutDashboard";
};
