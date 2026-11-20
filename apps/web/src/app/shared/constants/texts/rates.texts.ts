export const RATES_TEXTS = {
  calculator: {
    gracePeriodLabel: "Tiempo de gracia (minutos)",
    gracePeriodPlaceholder: "15",
    minutesStayedLabel: "Duración estimada (minutos)",
    minutesStayedPlaceholder: "90",
    pricePerUnitLabel: "Precio base por unidad ($)",
    pricePerUnitPlaceholder: "Tarifa estándar",
    subtitle: "Ingresá los parámetros de estancia para simular el cobro",
    tabLabel: "Calculadora & simulador",
    timeUnitLabel: "Unidad de tiempo",
    title: "Calculadora interactiva de tarifas",
    vehicleTypeLabel: "Tipo de vehículo",
  },
  preview: {
    appliedRateLabel: "Tarifa aplicada:",
    breakdownTitle: "Desglose de cobro",
    calculatingBadge: "Calculando...",
    durationLabel: "Duración simulada:",
    emptySubtitle:
      "Ajustá los parámetros para calcular el cobro estimado en el servidor.",
    emptyTitle: "Sin simulación activa",
    errorFallback:
      "No fue posible calcular la simulación. Verificá los parámetros e intentá de nuevo.",
    ivaLabel: "IVA",
    liveBadge: "En vivo",
    loadingLabel: "Calculando tarifa en el servidor...",
    minutesSuffix: "min",
    subtitle: "Cálculo oficial con parámetros actuales",
    subtotalLabel: "Subtotal:",
    title: "Simulación en tiempo real",
    totalLabel: "Total estimado:",
  },
} as const;
