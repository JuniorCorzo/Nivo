import type { Role } from "@core/type/role.type";

import { APP_ROUTES } from "./app-routes.constant";

export interface SidebarNavItem {
  icon: string;
  label: string;
  roles?: Role[];
  url: string;
}

const sidebarNav: SidebarNavItem[] = [
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
    icon: "lucideTicket",
    label: "Tickets",
    url: APP_ROUTES.app.tickets,
  },
  {
    icon: "lucideUsers",
    label: "Usuarios",
    roles: ["SUPERADMIN", "OWNER", "MANAGER"],
    url: APP_ROUTES.app.users,
  },
];

export const APP_TEXTS = {
  auth: {
    login: {
      actions: {
        forgotPassword: "¿Olvidaste la contraseña?",
        noAccount: "¿No tienes una cuenta?",
        register: "Regístrate.",
        submit: "Iniciar sesión",
      },
      description: "Ingresa a tu panel de control",
      errors: {
        invalidCredentials: "Correo o contraseña incorrectos",
      },
      form: {
        email: {
          errors: {
            invalid: "Ingresa un correo válido (ej: angel@nivo.com)",
            required: "El correo es requerido",
          },
          label: "Correo",
          placeholder: "tu@correo.com",
        },
        password: {
          errors: {
            invalid: "Contraseña incorrecta",
            minLength: "La contraseña debe tener al menos 8 caracteres",
            required: "La contraseña es requerida",
          },
          label: "Contraseña",
          placeholder: "Ingresa tu contraseña",
        },
      },
      title: "Bienvenido de nuevo",
    },
    register: {
      actions: {
        hasAccount: "¿Ya tienes una cuenta?",
        login: "Inicia sesión",
        submit: "Crear cuenta",
      },
      description: "Registra tu información para comenzar",
      form: {
        companyName: {
          errors: {
            maxLength: "El nombre no puede exceder 100 caracteres",
            minLength: "El nombre debe tener al menos 3 caracteres",
            required: "El nombre de la compañía es requerido",
          },
          label: "Nombre de compañía",
          placeholder: "Ej. Nivo Solutions SAS",
        },
        confirmPassword: {
          errors: {
            mismatch: "Las contraseñas no coinciden",
            required: "Confirma tu contraseña",
          },
          label: "Confirmar Contraseña",
          placeholder: "Repite tu contraseña",
        },
        contactInfo: {
          errors: {
            invalid: "Ingresa un número de contacto válido",
            required: "El número de contacto es requerido",
          },
          label: "Número de contacto",
          placeholder: "Ej. 300 123 4567",
        },
        email: {
          errors: {
            invalid: "Ingresa un correo válido (ej: angel@nivo.com)",
            required: "El correo es requerido",
          },
          label: "Correo",
          placeholder: "tu@correo.com",
        },
        password: {
          errors: {
            minLength: "La contraseña debe tener al menos 8 caracteres",
            pattern: "Debe contener mayúscula, minúscula y número",
            required: "La contraseña es requerida",
          },
          label: "Contraseña",
          placeholder: "Mínimo 8 caracteres",
        },
        username: {
          errors: {
            maxLength: "El nombre no puede exceder 50 caracteres",
            minLength: "El nombre debe tener al menos 3 caracteres",
            pattern: "Solo letras, números y espacios permitidos",
            required: "El nombre de usuario es requerido",
          },
          label: "Nombre de usuario",
          placeholder: "Ej. Ángel Corzo",
        },
      },
      title: "Crear una cuenta",
    },
  },
  checkIn: {
    cancel: "Cancelar",
    capacityWarning:
      "No hay cupos disponibles para esta categoría en este momento.",
    countryCo: "Colombia",
    countryUnplated: "Sin Placa",
    countryVe: "Venezuela",
    emailHint: "(Opcional para recibo digital)",
    emailLabel: "Correo Electrónico",
    emailPlaceholder: "cliente@ejemplo.com",
    enterKey: "↵ Enter",
    issuing: "Registrando...",
    noVehicleTypes:
      "No hay tipos de vehículo con cupos disponibles en este momento.",
    originLabel: "Origen / Tipo de Placa",
    phoneHint: "Opcional para recibo móvil",
    phoneLabel: "Teléfono Móvil",
    phonePlaceholder: "Ej: 300 123 4567",
    photoLabel: "Fotografía del Vehículo",
    plateHintVe: "Formato venezolano ej: AB-123-CD",
    plateLabel: "Placa / Matrícula",
    platePlaceholderCo: "Ej: ABC-123",
    platePlaceholderVe: "Ej: AB-123-CD",
    rateLabel: "Tarifa",
    rateNoRates: "Sin tarifas configuradas",
    slotLabel: "Cupo / Espacio",
    slotNoSlots: "Sin cupos disponibles",
    submitButton: "Emitir Ticket",
    subtitle: "Asignar cupo y emitir ticket de parqueo",
    title: "Registrar Ingreso de Vehículo",
    vehicleAutomobile: "Automóvil",
    vehicleBicycle: "Bicicleta",
    vehicleMotorcycle: "Motocicleta",
    vehicleTypeLabel: "Tipo de Vehículo",
  },
  dashboard: {
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
        sevenDays:
          "Curva de flujo diario: Entradas vs Salidas (últimos 7 días)",
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
      description:
        "Transacciones de ingreso, permanencia y recaudo por vehículo",
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
  },
  dataTable: {
    empty: {
      defaultMessage: "No se encontraron resultados",
    },
    pagination: {
      firstPage: "Primera página",
      lastPage: "Última página",
      nextPage: "Página siguiente",
      pageInfo: (current: number, total: number) =>
        `Página ${current} de ${total}`,
      previousPage: "Página anterior",
      rowsPerPage: "Filas por página:",
      totalResults: (total: number) =>
        `Total: ${total} resultado${total === 1 ? "" : "s"}`,
    },
    search: {
      clear: "Limpiar búsqueda",
      placeholder: "Buscar...",
    },
  },
  landing: {
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
      brandAriaLabel: "Nivo Home",
      login: "Iniciar Sesión",
      navAriaLabel: "Main Navigation",
      pricing: "Precios",
      register: "Crear Cuenta",
      simulator: "Simulador",
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
  },
  parking: {
    actions: {
      backToList: "Volver a la lista",
      create: "Crear parqueadero",
      delete: "Eliminar",
      edit: "Guardar cambios",
      editAction: "Editar",
      placeholderMap: "Selecciona la ubicación en el mapa",
      viewDetails: "Ver detalle",
      viewTickets: "Ver tickets",
    },
    confirmations: {
      delete: {
        cancel: "Cancelar",
        confirm: "Sí, eliminar",
        message:
          "¿Estás seguro de que deseas eliminar este parqueadero? Esta acción no se puede deshacer.",
        title: "Eliminar parqueadero",
      },
    },
    detail: {
      actions: {
        delete: "Eliminar",
        edit: "Editar",
        manageSlots: "Gestionar plazas",
      },
      backToList: "Volver a la lista",
      empty: "Parqueadero no encontrado",
      fields: {
        address: "Dirección",
        coordinates: "Coordenadas",
        createdAt: "Creado",
        gracePeriodMinutes: "Tiempo de gracia",
        gracePeriodPrice: "Tarifa tiempo de gracia",
        ivaRate: "Tasa IVA",
        operatingHours: "Horario de atención",
        parkingId: "ID del parqueadero",
        policySubtitle: "Reglas de cobro por gracia y tasa de impuestos",
        policyTitle: "Políticas de liquidación",
        totalCapacity: "Capacidad total",
        updatedAt: "Actualizado",
      },
      loading: "Cargando información...",
      map: {
        placeholder: "Sin coordenadas registradas",
        title: "Ubicación",
      },
      slotDistribution: {
        prefix: "Prefijo",
        slotsLabel: (count: number) => `${count} cupo${count === 1 ? "" : "s"}`,
        summary: (count: number) =>
          `${count} grupo${count === 1 ? "" : "s"} de cupos`,
        title: "Distribución de cupos",
        totalSlots: (total: number) => `${total} en total`,
      },
      title: "Detalle del parqueadero",
    },
    form: {
      create: {
        description: "Registra un nuevo parqueadero en tu cuenta",
        title: "Crear Parqueadero",
      },
      edit: {
        description: "Actualiza la información de tu parqueadero",
        title: "Editar Parqueadero",
      },
      fields: {
        address: {
          city: {
            errors: {
              required: "La ciudad es requerida",
            },
            label: "Ciudad",
            placeholder: "Selecciona o escribe una ciudad",
          },
          state: {
            errors: {
              required: "El departamento es requerido",
            },
            label: "Departamento",
            placeholder: "Selecciona un departamento",
          },
          street: {
            errors: {
              required: "La dirección es requerida",
            },
            label: "Calle / Dirección",
            placeholder: "Ej. Carrera 7 #11-10",
          },
          title: "Dirección",
          zipCode: {
            errors: {
              invalid: "Ingresa un código postal válido",
            },
            label: "Código postal",
            placeholder: "Ej. 110111",
          },
        },
        name: {
          errors: {
            maxLength: "El nombre no puede exceder 100 caracteres",
            minLength: "El nombre debe tener al menos 3 caracteres",
            required: "El nombre del parqueadero es requerido",
          },
          label: "Nombre del parqueadero",
          placeholder: "Ej. Parqueadero Centro",
        },
        operatingHours: {
          closeTime: {
            errors: {
              invalidFormat: "Formato inválido. Use HH:mm",
              invalidRange:
                "La hora de cierre debe ser posterior a la de apertura",
              required: "La hora de cierre es requerida",
            },
            label: "Hora de cierre",
            placeholder: "Ej. 20:00",
          },
          openTime: {
            errors: {
              invalidFormat: "Formato inválido. Use HH:mm",
              required: "La hora de apertura es requerida",
            },
            label: "Hora de apertura",
            placeholder: "Ej. 08:00",
          },
          title: "Horario de operación",
        },
        slots: {
          actions: {
            add: "Agregar grupo",
            remove: "Eliminar grupo",
          },
          count: {
            label: "Cantidad",
            placeholder: "Ej. 100",
          },
          description:
            "Cada grupo define un prefijo, una zona, un tipo de vehículo y una cantidad.",
          itemLabel: "Grupo",
          prefix: {
            label: "Prefijo",
            placeholder: "Ej. A",
          },
          title: "Grupos de cupos",
          type: {
            label: "Tipo de vehículo",
            placeholder: "Selecciona un tipo de vehículo",
          },
          zone: {
            label: "Zona",
            placeholder: "Ej. Norte",
          },
        },
      },
    },
    list: {
      empty: {
        description:
          "Comienza agregando tu primer parqueadero para gestionar tus propiedades.",
        title: "No tienes parqueaderos registrados",
      },
      search: {
        noResults: "No se encontraron parqueaderos",
        placeholder: "Busca por nombre del parqueadero",
      },
      subtitle: "Gestiona y administra tus propiedades",
      table: {
        columns: {
          actions: "Acciones",
          address: "Dirección",
          city: "Ciudad",
          currency: "Moneda",
          name: "Nombre",
          operatingHours: "Horario",
          timezone: "Zona horaria",
        },
      },
      title: "Parqueaderos",
    },
    messages: {
      created: "Parqueadero creado exitosamente",
      deleted: "Parqueadero eliminado exitosamente",
      errors: {
        duplicateName: "Ya existe un parqueadero con ese nombre",
        notFound: "Parqueadero no encontrado",
        unauthorized: "No tienes permisos para realizar esta acción",
      },
      updated: "Parqueadero actualizado exitosamente",
    },
    slots: {
      create: {
        subtitle: "Genera un lote de plazas secuenciales",
        title: "Crear plazas",
      },
      edit: {
        subtitle: "Actualiza la información de la plaza",
        title: "Editar plaza",
      },
      list: {
        empty: {
          description:
            "Comienza creando un lote de plazas para este parqueadero.",
          parkingNotFound: "Parqueadero no encontrado",
          title: "No hay plazas configuradas",
        },
        search: {
          noResults: "No se encontraron plazas",
          placeholder: "Busca por número, zona o prefijo",
        },
        subtitle: "Gestiona las plazas de este parqueadero",
        title: "Plazas",
      },
    },
  },
  photoCapture: {
    badgeSize: (kb: number) => `${kb} KB`,
    cameraError:
      "No se pudo acceder a la cámara. Usa la opción de subir archivo.",
    capture: "Capturar",
    clearPhoto: "Eliminar foto",
    hint: "JPG comprimido (< 100 KB) para registro de motocicleta",
    invalidType: "El archivo seleccionado debe ser una imagen válida.",
    loadError: "Error al procesar la imagen.",
    noPhoto: "Sin fotografía registrada",
    retake: "Tomar otra",
    startCamera: "Abrir cámara",
    stopCamera: "Cancelar",
    uploadFallback: "Subir archivo",
  },
  publicTicket: {
    accumulatedCostLabel: "Cobro Acumulado Estimado",
    activeStatus: "En Estancia",
    closedStatus: "Finalizado",
    cop: "COP",
    elapsedTimeLabel: "Tiempo Transcurrido",
    entryTimeLabel: "Hora de Ingreso",
    exitTimeLabel: "Hora de Salida",
    loading: "Cargando comprobante...",
    notFoundDescription:
      "El comprobante solicitado no existe, ha expirado o el enlace es incorrecto.",
    notFoundTitle: "Ticket No Encontrado",
    originCo: "Colombia",
    originUnplated: "Sin Placa",
    originVe: "Venezuela",
    parkingLotDefault: "Nivo Parking",
    photoBadge: "Foto Registrada al Ingreso",
    plateLabel: "Placa / Código",
    qrNotice:
      "Muestra este código QR en la taquilla al momento de salir para liquidar y validar tu salida.",
    rateLabel: "Tarifa",
    refreshButton: "Actualizar Cobro en Vivo",
    shareWhatsApp: "Compartir por WhatsApp",
    slotLabel: "Bahía / Espacio",
    statusLabel: "Estado del Ticket",
    subtitle: "Consulta en tiempo real de tu estancia y tarifa",
    title: "Comprobante Digital de Parqueo",
    unplatedVehicle: "Vehículo Sin Placa",
  },
  server: {
    errors: {
      404: "Recurso no encontrado. La página o recurso que busca no existe.",
      500: "Error interno del servidor. Por favor, inténtelo de nuevo más tarde o contacte a soporte.",
      generic:
        "Ha ocurrido un error inesperado. Por favor, recargue la página e inténtelo de nuevo.",
      network: "Error de conexión. Verifique su conexión a internet.",
      timeout:
        "La solicitud ha tardado demasiado tiempo. Por favor, inténtelo de nuevo.",
    },
  },
  sidebar: {
    logo: "Nivo",
    logout: "Cerrar sesión",
    nav: sidebarNav,
    theme: {
      label: "Tema",
    },
  },
  slots: {
    actions: {
      backToList: "Volver al listado",
      create: "Crear plazas",
      delete: "Eliminar",
      edit: "Editar",
      viewDetails: "Ver detalle",
    },
    create: {
      actions: {
        cancel: "Cancelar",
        create: "Crear plazas",
      },
      fields: {
        from: {
          label: "Desde",
          placeholder: "Ej. 1",
        },
        prefix: {
          label: "Prefijo",
          placeholder: "Ej. A",
        },
        status: {
          label: "Estado inicial",
          placeholder: "Selecciona un estado",
        },
        to: {
          label: "Hasta",
          placeholder: "Ej. 50",
        },
        type: {
          label: "Tipo de vehículo",
          placeholder: "Selecciona un tipo",
        },
        zone: {
          label: "Zona",
          placeholder: "Ej. Norte",
        },
      },
      preview: {
        conflictWarning:
          "Algunas plazas del rango ya existen. Ajusta el rango para continuar.",
        count: (count: number) =>
          `Se crearán ${count} plaza${count === 1 ? "" : "s"}`,
        range: (from: number, to: number) => `Rango: ${from} - ${to}`,
        title: "Vista previa",
      },
      subtitle: "Genera un lote de plazas secuenciales",
      title: "Crear plazas",
    },
    deleteModal: {
      cancel: "Cancelar",
      confirm: "Sí, eliminar",
      message:
        "¿Estás seguro de que deseas eliminar esta plaza? Esta acción no se puede deshacer.",
      title: "Eliminar plaza",
      warningHistory:
        "Esta plaza tiene historial de tickets. Debes confirmar para continuar.",
    },
    detail: {
      activeTicket: {
        empty: "No hay ticket activo",
        title: "Ticket activo",
      },
      fields: {
        createdAt: "Creada",
        number: "Número",
        status: "Estado",
        type: "Tipo",
        updatedAt: "Actualizada",
        zone: "Zona",
      },
      history: {
        empty: "Sin historial de tickets",
        title: "Historial de tickets",
      },
      tabs: {
        general: "General",
        history: "Historial",
      },
      title: "Detalle de plaza",
    },
    edit: {
      actions: {
        cancel: "Cancelar",
        save: "Guardar cambios",
      },
      fields: {
        number: {
          label: "Número",
          placeholder: "Ej. A-01",
        },
        prefix: {
          label: "Prefijo",
          placeholder: "Ej. A",
        },
        status: {
          label: "Estado",
          placeholder: "Selecciona un estado",
        },
        type: {
          label: "Tipo de vehículo",
          placeholder: "Selecciona un tipo",
        },
        zone: {
          label: "Zona",
          placeholder: "Ej. Norte",
        },
      },
      restrictions: {
        activeTicketType:
          "Existe un ticket activo. El tipo no se puede modificar.",
        occupiedNumber:
          "La plaza está ocupada. El número no se puede modificar.",
      },
      subtitle: "Actualiza la información de la plaza",
      title: "Editar plaza",
    },
    list: {
      batchBar: {
        changeStatus: "Cambiar estado",
        delete: "Eliminar seleccionadas",
        selected: (count: number) =>
          `${count} plaza${count === 1 ? "" : "s"} seleccionada${count === 1 ? "" : "s"}`,
      },
      empty: {
        createCta: "Crear plazas",
        description:
          "Comienza creando un lote de plazas para este parqueadero.",
        parkingNotFound: "Parqueadero no encontrado",
        title: "No hay plazas configuradas",
      },
      filterEmpty: {
        clearFilters: "Limpiar filtros",
        description: "Ajusta los filtros para ver más resultados.",
        title: "Sin coincidencias",
      },
      filters: {
        all: "Todos",
        status: "Estado",
        type: "Tipo",
        zone: "Zona",
      },
      search: {
        noResults: "No se encontraron plazas",
        placeholder: "Busca por número, zona o prefijo",
      },
      searchEmpty: {
        description: "Ninguna plaza coincide con tu búsqueda.",
        title: "Sin resultados",
      },
      subtitle: "Gestiona las plazas de este parqueadero",
      table: {
        columns: {
          actions: "Acciones",
          number: "Número",
          prefix: "Prefijo",
          status: "Estado",
          type: "Tipo",
          zone: "Zona",
        },
      },
      title: "Plazas",
    },
    messages: {
      created: "Plazas creadas exitosamente",
      deleted: "Plaza eliminada exitosamente",
      errors: {
        generic: "Ha ocurrido un error inesperado.",
        notFound: "Plaza no encontrada",
      },
      updated: "Plaza actualizada exitosamente",
    },
    statusModal: {
      cancel: "Cancelar",
      confirm: "Confirmar",
      confirmChange: (from: string, to: string) =>
        `¿Confirmar cambio de estado de ${from} a ${to}?`,
      error: "Error al actualizar estado",
      success: "Estado actualizado",
      title: "Cambiar estado",
      warningActiveTicket:
        "La plaza tiene un ticket activo. Cambiar a disponible liberará el ticket actual. Esta acción puede generar inconsistencias.",
    },
  },
  ticketReceipt: {
    closeButton: "Cerrar",
    entryTimeLabel: "Hora de Ingreso:",
    exitTimeLabel: "Hora de Salida:",
    paymentMethodLabel: "Método de Pago:",
    photoBadge: "Foto de Ingreso",
    plateLabel: "Placa del Vehículo",
    printButton: "Imprimir",
    qrNotice: "Escanea para ver recibo digital y estado en vivo",
    rateLabel: "Tarifa Aplicada",
    rateStandardFallback: "Estándar",
    shareWhatsApp: "Enviar por WhatsApp",
    slotAssignedFallback: "Asignado",
    slotLabel: "Espacio / Cupo",
    totalPaidLabel: "Total Pagado:",
    unplatedVehicle: "Vehículo Sin Placa",
    whatsAppMessage: (plate: string, url: string) =>
      `¡Hola! Aquí tienes tu comprobante digital de parqueo para el vehículo ${plate}: ${url}`,
  },
  tickets: {
    actions: {
      backToOperations: "Volver a Operaciones",
      backToParkingLots: "Volver a Parqueaderos",
      closeDetail: "Cerrar detalle",
      closeDrawer: "Cerrar",
      reprintReceipt: "Reimprimir Comprobante",
      resetFilters: "Restablecer Filtros",
      viewDetail: "Ver detalle",
      viewTickets: "Ver Tickets",
    },
    detail: {
      close: "Cerrar detalle",
      elapsedTime: "Tiempo transcurrido:",
      entryPhoto: "Fotografía de ingreso",
      entryPhotoAlt: "Fotografía capturada al ingreso",
      entryTime: "Fecha y hora de entrada:",
      exitTime: "Fecha y hora de salida:",
      finalizedPayment: {
        method: "Método de Pago:",
        reference: "Referencia:",
        title: "Detalle de Pago Finalizado",
        totalPaid: "Total Pagado:",
      },
      idPrefix: "ID:",
      liveSimulation: {
        calculating: "Calculando valor en tiempo real...",
        estimatedTotal: "Total Estimado a Cobrar:",
        iva: "IVA",
        subtotal: "Subtotal:",
        title: "Simulación de Tarifa en Vivo",
      },
      rate: "Tarifa:",
      rateDefault: "Estándar",
      slotAssigned: "Plaza asignada:",
      slotNone: "Sin plaza",
      statusClosed: "Cerrado / Cobrado",
      statusLabel: "Estado del Ticket",
      statusOpen: "Activo (En Estancia)",
      title: "Detalle del Ticket",
      unplatedBadge: "SIN PLACA",
    },
    emptyState: {
      description:
        "No hay tickets registrados que coincidan con los filtros aplicados.",
      message: "No se encontraron tickets",
      title: "No se encontraron tickets",
    },
    filters: {
      parkingLot: {
        all: "Todos los parqueaderos",
        label: "Parqueadero",
        placeholder: "Selecciona parqueadero",
      },
      plate: {
        label: "Buscar Placa",
        placeholder: "Ej. ABC123",
      },
      reset: "Limpiar Filtros",
      status: {
        all: "Todos los estados",
        closed: "Finalizado (Cerrado)",
        label: "Estado",
        open: "Activo (Abierto)",
        placeholder: "Selecciona estado",
      },
      vehicle: {
        all: "Todos los tipos",
        bicycle: "Bicicleta",
        car: "Carro",
        label: "Tipo de Vehículo",
        motorcycle: "Moto",
        placeholder: "Selecciona tipo",
      },
    },
    receiptModal: {
      subtitle: "Reimpresión de ticket / recibo",
      title: "Comprobante de Ticket",
    },
    stats: {
      closed: "Finalizados",
      open: "Activos en Estancia",
      total: "Total Registrados",
    },
    status: {
      closed: "Finalizado",
      open: "Activo",
    },
    table: {
      columns: {
        actions: "Acciones",
        entryTime: "Fecha y Hora de Ingreso",
        parkingLot: "Parqueadero",
        plate: "Placa",
        status: "Estado",
        total: "Total",
        vehicleType: "Tipo Vehículo",
      },
      emptyFallback: "---",
    },
    titles: {
      parkingLots: {
        subtitle:
          "Audita tickets históricos y activos, filtra por placa o estado y reimprime comprobantes.",
        title: "Gestión de Tickets e Historial",
      },
      tenant: {
        subtitle: "Audita tickets y estadías de todos los parqueaderos",
        title: "Tickets e Historial General",
      },
    },
  },
  users: {
    actions: {
      allRolesFilter: "Todos los roles",
      changeRole: "Cambiar Rol",
      deactivate: "Desactivar Usuario",
      invite: "Invitar Usuario",
      resetFilters: "Limpiar Filtros",
      searchPlaceholder: "Buscar por nombre o correo...",
    },
    kpis: {
      activeOperators: "Operadores Activos",
      deactivated: "Usuarios Inactivos",
      managers: "Administradores",
      totalUsers: "Total Usuarios",
    },
    modals: {
      deactivate: {
        actions: {
          cancel: "Cancelar",
          confirm: "Desactivar",
        },
        description:
          "Esta acción revocará el acceso al sistema para este usuario. Podrás reactivarlo posteriormente si es necesario.",
        lastOwnerWarning:
          "No se puede desactivar al único propietario activo del parqueadero.",
        selfDeactivationWarning:
          "No puedes desactivar tu propia cuenta mientras estés en sesión activa.",
        singleOwnerWarning:
          "No se puede desactivar al único propietario activo del parqueadero.",
        title: "¿Desactivar usuario?",
      },
      invite: {
        actions: {
          cancel: "Cancelar",
          submit: "Enviar Invitación",
        },
        form: {
          contactInfo: {
            errors: {
              invalid: "Ingresa un número de contacto válido",
            },
            label: "Teléfono de Contacto",
            placeholder: "Ej: +57 300 123 4567",
          },
          email: {
            errors: {
              invalid: "Ingresa un correo electrónico válido",
              required: "El correo electrónico es requerido",
            },
            label: "Correo Electrónico",
            placeholder: "ejemplo@correo.com",
          },
          fullName: {
            errors: {
              minLength: "El nombre debe tener al menos 3 caracteres",
              required: "El nombre completo es requerido",
            },
            label: "Nombre Completo",
            placeholder: "Ej: Carlos Gómez",
          },
          role: {
            errors: {
              required: "Debes seleccionar un rol para el usuario",
            },
            label: "Rol Asignado",
            placeholder: "Selecciona un rol...",
          },
        },
        subtitle:
          "Envía una invitación por correo para sumar un miembro al equipo de tu parqueadero.",
        title: "Invitar Usuario",
      },
      modifyRole: {
        actions: {
          cancel: "Cancelar",
          submit: "Guardar Rol",
        },
        currentRoleLabel: "Rol Actual",
        form: {
          role: {
            errors: {
              required: "Debes seleccionar un rol válido",
            },
            label: "Nuevo Rol",
            placeholder: "Selecciona el nuevo rol...",
          },
        },
        ownerRoleNotice: "El rol de Propietario no puede ser modificado.",
        subtitle:
          "Modifica el nivel de acceso y permisos del usuario en la plataforma.",
        title: "Modificar Rol de Usuario",
        userLabel: "Usuario",
      },
    },
    table: {
      actions: {
        changeRole: "Cambiar Rol",
        deactivate: "Desactivar",
      },
      emptyState: {
        description:
          "No hay usuarios registrados que coincidan con los criterios de búsqueda o filtros aplicados.",
        resetFilters: "Limpiar Filtros",
        title: "No se encontraron usuarios",
      },
      headers: {
        actions: "Acciones",
        contact: "Contacto",
        createdAt: "Fecha de Registro",
        role: "Rol",
        status: "Estado",
        user: "Usuario",
      },
      roles: {
        auditor: "Auditor",
        driver: "Conductor",
        manager: "Administrador",
        operator: "Operador",
        owner: "Propietario",
        superadmin: "Super Admin",
      },
      status: {
        active: "Activo",
        inactive: "Inactivo",
      },
    },
    titles: {
      page: "Gestión de Usuarios",
      subtitle:
        "Administra el equipo de tu parqueadero, asigna roles y controla accesos.",
    },
    toasts: {
      deactivateError: "Ocurrió un error al desactivar el usuario",
      deactivateSuccess: "Usuario desactivado correctamente",
      inviteError: "Ocurrió un error al enviar la invitación",
      inviteSuccess: "Invitación enviada con éxito",
      modifyRoleError: "Ocurrió un error al actualizar el rol",
      modifyRoleSuccess: "Rol actualizado exitosamente",
    },
  },
} as const;

export const LANDING_TEXTS = APP_TEXTS.landing;
