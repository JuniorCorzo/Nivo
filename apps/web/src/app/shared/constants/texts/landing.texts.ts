export const LANDING_TEXTS = {
  benefits: {
    badge: "Ventajas Clave",
    description:
      "Diseñado especialmente para pequeños y medianos parqueaderos que quieren control total sin complicaciones técnicas.",
    items: [
      {
        description:
          "Usa el celular o tablet que ya tienes. Sin pagar miles de dólares en servidores locales, antenas ni torniquetes.",
        icon: "lucideSmartphone",
        title: "Cero inversión en hardware",
      },
      {
        description:
          "Cobros automáticos por hora, fracción o día. Configura minutos de gracia e IVA sin que el operario haga cuentas mentales.",
        icon: "lucideCalculator",
        title: "Liquidación exacta",
      },
      {
        description:
          "Control estricto de entradas, salidas y caja en tiempo real. Cierra turnos en un clic y detecta cualquier descuadre.",
        icon: "lucideShieldCheck",
        title: "Arqueo sin fugas",
      },
      {
        description:
          "Envía comprobantes de entrada y salida directo al WhatsApp del conductor o muéstrale el QR para consulta en vivo.",
        icon: "lucideQrCode",
        title: "Tickets WhatsApp/QR",
      },
    ],
    title: "Todo lo que necesitas para operar como los grandes",
  },
  comparison: {
    badge: "Comparativa",
    description:
      "El talonario tradicional parece barato al principio, pero cuesta miles en dinero perdido, disputas y horas de arqueo.",
    digital: {
      points: [
        "Liquidación exacta al segundo según tu tarifa, IVA y minutos de gracia.",
        "Tickets digitales por WhatsApp o consulta por código QR que nunca se pierden.",
        "Arqueo de caja instantáneo en un solo clic, con historial blindado en la nube.",
        "Monitoreo en vivo de ocupación y recaudos en tiempo real desde donde estés.",
        "Cero gasto en impresoras costosas, tinta, reparaciones o papel.",
      ],
      subtitle: "Agilidad y control desde tu celular",
      title: "Control Digital con Nivo",
    },
    paper: {
      points: [
        "Pérdida continua de dinero por cálculos mentales erróneos del operario.",
        "Tickets de papel extraviados, mojados o alterados que terminan en discusiones con clientes.",
        "Arqueo de caja manual al final de cada turno contando papelitos durante horas.",
        "Cero trazabilidad cuando no estás físicamente presente en el parqueadero.",
        "Gasto mensual recurrente comprando talonarios impresos o rollos térmicos.",
      ],
      subtitle: "El método manual tradicional",
      title: "Talonario de Papel",
    },
    title: "¿Por qué dejar atrás el papel definitivamente?",
  },
  ctaBanner: {
    cta: "Crear Cuenta Gratis",
    description:
      "Crea tu cuenta en menos de dos minutos y empieza a emitir tickets digitales hoy mismo.",
    title: "¿Listo para transformar la gestión de tu parqueadero?",
  },
  footer: {
    benefits: "Beneficios",
    copyright: "© 2026 Nivo. Todos los derechos reservados.",
    login: "Iniciar Sesión",
    pricing: "Precios",
    register: "Crear Cuenta",
    simulator: "Simulador",
  },
  hero: {
    badge: "La plataforma moderna para parqueaderos independientes",
    createAccountFree: "Crear Cuenta Gratis",
    description:
      "Digitaliza tu parqueadero sin comprar computadores, torniquetes ni impresoras térmicas. Cobra desde cualquier celular, envía tickets por WhatsApp y cuadra tu caja sin descuadres.",
    stats: {
      accuracy: {
        label: "Arqueo exacto y libre de fugas de dinero",
        value: "100%",
      },
      hardware: {
        label: "Opera desde cualquier smartphone o tablet",
        value: "0 Hardware",
      },
      time: {
        label: "Tiempo de registro y puesta en marcha",
        value: "2 min",
      },
    },
    title: "De talonario de papel a control total en 2 minutos",
    trySimulator: "Probar Simulador en Vivo",
  },
  navbar: {
    benefits: "Beneficios",
    brandAriaLabel: "Inicio de Nivo",
    login: "Iniciar Sesión",
    navAriaLabel: "Navegación principal",
    pricing: "Precios",
    register: "Crear Cuenta",
    simulator: "Simulador",
    toggleMenu: "Alternar menú de navegación",
  },
  pageTitle: "Nivo - Software para Parqueaderos",
  pricing: {
    badge: "Precios Claros",
    basic: {
      cta: "Empezar Gratis",
      description: "Ideal para parqueaderos pequeños que inician",
      features: [
        "Hasta 20 plazas de parqueo",
        "Tickets digitales QR y WhatsApp",
        "Registro de entradas y salidas",
        "1 operario activo",
      ],
      name: "Básico",
      period: "/ para siempre",
      price: "$0",
    },
    description:
      "Comienza gratis y escala a medida que tu negocio crezca. Sin contratos a largo plazo ni cláusulas de permanencia.",
    multiSite: {
      cta: "Contactar a Ventas",
      description: "Para dueños con 2 o más sedes de parqueo",
      features: [
        "Todas las funciones Pro",
        "Gestión multi-parqueadero unificada",
        "Consolidación financiera global",
        "Asesoría personalizada de configuración",
      ],
      name: "Multi-sede",
      period: "COP / mes",
      price: "$99.000",
    },
    popularBadge: "Más Popular",
    pro: {
      cta: "Probar 14 Días Gratis",
      description: "Control integral para parqueaderos activos",
      features: [
        "Plazas ilimitadas",
        "Múltiples operarios con turnos",
        "Arqueo de caja ciego y reportes",
        "Métricas y dashboard en vivo",
        "Soporte prioritario por WhatsApp",
      ],
      name: "Pro",
      period: "COP / mes",
      price: "$49.000",
    },
    title: "Planes simples y transparentes",
  },
  simulator: {
    badge: "Simulador Interactivo",
    baseRateLabel: "Tarifa base configurada:",
    calculating: "Calculando tarifa...",
    configDescription: "Personaliza los parámetros del vehículo y duración",
    configTitle: "Configuración de la simulación",
    cop: "COP",
    copPerHour: "COP / hora",
    ctaButton: "Comenzar a Cobrar con Nivo",
    demoFacilityName: "Parqueadero Demo Nivo",
    demoNit: "NIT: 901.849.201-4 • Régimen Simple",
    description:
      "Ajusta el tipo de vehículo y el tiempo de estadía para ver cómo Nivo liquida la tarifa de manera transparente al instante.",
    durationPresets: [
      { label: "30 min", value: 30 },
      { label: "1 hora", value: 60 },
      { label: "1.5 horas", value: 90 },
      { label: "2 horas", value: 120 },
      { label: "3 horas", value: 180 },
      { label: "5 horas", value: 300 },
    ],
    gracePeriodLabel: "Período de gracia:",
    ivaLabel: (rate: string) => `IVA (${rate}%):`,
    ivaRateLabel: "Tarifa IVA:",
    min: "min",
    minutesStayedText: (minutes: number, hours: string) =>
      `${minutes} minutos (${hours} hrs)`,
    minutesUnit: "minutos",
    rangeAriaLabel: "Tiempo de permanencia en minutos",
    securityNotice: "Sin redondeos abusivos ni pérdidas de dinero",
    stayDurationLabel: "Tiempo de permanencia",
    subtotalLabel: "Subtotal:",
    ticketBadge: "Simulado",
    ticketDeliveryLabel: "Entrega comprobante:",
    ticketDeliveryValue: "WhatsApp / QR",
    ticketStayLabel: "Estadía:",
    ticketTitle: "Ticket Digital",
    ticketVehicleLabel: "Vehículo:",
    title: "Simula el cobro digital de un ticket en vivo",
    totalToPay: "Total a Pagar:",
    vehicleTypeLabel: "Tipo de vehículo",
    vehicles: {
      bike: "Bicicleta",
      car: "Carro",
      motorcycle: "Moto",
    },
  },
} as const;
