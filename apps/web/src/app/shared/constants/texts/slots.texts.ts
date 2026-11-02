export const SLOTS_TEXTS = {
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
      occupiedNumber: "La plaza está ocupada. El número no se puede modificar.",
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
      description: "Comienza creando un lote de plazas para este parqueadero.",
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
} as const;
