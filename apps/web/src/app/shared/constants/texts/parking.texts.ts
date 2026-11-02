export const PARKING_TEXTS = {
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
} as const;
