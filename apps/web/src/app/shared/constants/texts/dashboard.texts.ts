export const DASHBOARD_TEXTS = {
  actions: {
    exportCsv: "Descargar CSV",
    sync: "Sincronizar",
  },
  chart: {
    emptyStateSubtitle:
      "No se registraron movimientos de vehículos en el período seleccionado.",
    emptyStateTitle: "Sin datos de telemetría",
    entries: "Entradas",
    exits: "Salidas",
    legendOccupancy: "Ocupación",
    noData: "Sin datos",
    peakDayIngress: "Día Pico Ingreso",
    peakHourIngress: "Hora Pico Ingreso",
    peakMaxOccupancy: "Pico Máximo Ocupación",
    subtitles: {
      sevenDays: "Curva de flujo diario: Entradas vs Salidas (últimos 7 días)",
      thirtyDays:
        "Curva de flujo diario: Entradas vs Salidas (últimos 30 días)",
      today: "Curva de flujo horario: Entradas vs Salidas (06:00 - 22:00)",
    },
    titleDaily: "Tendencia de Ocupación: Flujo Diario",
    titleHourly: "Tendencia de Ocupación: Flujo Horario",
    totalFlowEntries: "Total Flujo Entradas",
    unitVeh: "veh",
    unitVehPerHour: "v/h",
  },
  distribution: {
    subtitle: "Distribución de slots y ocupación actual",
    title: "Distribución de Plazas por Categoría",
    total: "Total:",
  },
  granularity: {
    sevenDays: "7 Días",
    thirtyDays: "30 Días",
    today: "Hoy",
  },
  kpis: {
    liveStatus: "En línea",
    occupancy: {
      alert: "Alerta 70-89%",
      comparison: "vs. ayer a esta hora",
      critical: "Crítico ≥90%",
      normal: "Normal <70%",
      title: "Tasa de Ocupación",
    },
    revenue: {
      comparison: "vs. semana pasada",
      digitalRatio: "cobrado digitalmente",
      title: "Ingresos del Día",
    },
    singleTitle: "Métricas de la Sede",
    stay: {
      comparison: "mayor fluidez hoy",
      gracePeriod: "Gracia permitida:",
      title: "Tiempo Promedio",
    },
    tickets: {
      netFlow: "flujo neto actual",
      rotation: "Rotación acum. hoy:",
      title: "Tickets Activos",
      vehiclesInside: "vehículos dentro",
    },
    title: "Métricas Críticas Consolidadas",
  },
  operations: {
    comparison: {
      facilitiesSuffix: "instalaciones",
      thresholdAlert: "70-89% Alerta",
      thresholdCritical: "≥90% Crítico",
      thresholdNormal: "<70% Normal",
      thresholdsLabel: "Umbrales:",
      title: "Comparativa de Sedes en Tiempo Real",
    },
    recentActivity: {
      liveBadge: "SSE En Línea",
      subtitle:
        "Transacciones de ingreso y salida en vivo por barrera automatizada",
      title: "Flujo Operativo Reciente",
    },
  },
  reports: {
    description: "Transacciones de ingreso, permanencia y recaudo por vehículo",
    pagination: {
      next: "Siguiente",
      previous: "Anterior",
    },
    title: "Reporte Operativo de Tickets",
  },
  scope: {
    allParkings: "Todas las Sedes (Consolidado Global)",
    label: "Sedes:",
  },
  subtitle: "Telemetría y rendimiento comercial en red de parqueaderos Nivo",
  title: "Panel de Control Operativo",
} as const;
