import type { Role } from "@core/type/role.type";

import { APP_ROUTES } from "../app-routes.constant";

export interface SidebarNavItem {
  hasLiveCount?: boolean;
  hasLiveDot?: boolean;
  icon: string;
  label: string;
  roles?: Role[];
  url: string | ((parkingLotId?: string | null) => string);
}

export interface SidebarNavGroup {
  items: SidebarNavItem[];
  label: string;
}

export const sidebarNavGroups: SidebarNavGroup[] = [
  {
    label: "Operación Diaria",
    items: [
      {
        icon: "lucideLayoutDashboard",
        label: "Dashboard",
        url: APP_ROUTES.app.dashboard,
      },
      {
        icon: "lucideCar",
        label: "Parqueaderos",
        url: APP_ROUTES.app.parkingLots,
      },
      {
        hasLiveCount: true,
        icon: "lucideTicket",
        label: "Tickets Emitidos",
        url: APP_ROUTES.app.tickets,
      },
    ],
  },
  {
    label: "Configuración & Fiscal",
    items: [
      {
        icon: "lucideCoins",
        label: "Tarifas y Reglas",
        url: (id?: string | null) =>
          id ? APP_ROUTES.app.parkingLotRates(id) : APP_ROUTES.app.parkingLots,
      },
      {
        icon: "lucideLayoutGrid",
        label: "Plazas & Bahías",
        url: (id?: string | null) =>
          id ? APP_ROUTES.app.parkingLotSlots(id) : APP_ROUTES.app.parkingLots,
      },
      {
        icon: "lucideUsers",
        label: "Usuarios y Cajeros",
        roles: ["SUPERADMIN", "OWNER", "MANAGER"],
        url: APP_ROUTES.app.users,
      },
    ],
  },
];

export const sidebarNav: SidebarNavItem[] = sidebarNavGroups.flatMap(
  (group) => group.items
);

export const SIDEBAR_TEXTS = {
  groups: sidebarNavGroups,
  logo: "Nivo",
  logout: "Cerrar sesión",
  nav: sidebarNav,
  sedeSwitcher: {
    availableSedes: "Sedes disponibles",
    changeSede: "Cambiar sede",
    emptyState: "No hay sedes registradas",
    manageSedes: "Gestionar sedes",
    noSede: "Sin sede",
    plazasCapacity: (count: number) => `${count} Plazas`,
    selectSede: "Seleccionar sede",
  },
  theme: {
    label: "Tema",
  },
} as const;
