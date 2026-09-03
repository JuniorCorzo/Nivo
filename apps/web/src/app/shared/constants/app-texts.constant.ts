import { APP_ROUTES } from "./app-routes.constant";

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
  parking: {
    actions: {
      backToList: "Volver a la lista",
      create: "Crear parqueadero",
      delete: "Eliminar",
      edit: "Guardar cambios",
      placeholderMap: "Selecciona la ubicación en el mapa",
      viewDetails: "Ver detalle",
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
        parkingId: "ID del parqueadero",
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
    nav: [
      {
        icon: "lucideLayoutDashboard",
        label: "Overview",
        url: "",
      },
      {
        icon: "lucideCar",
        label: "Parqueaderos",
        url: APP_ROUTES.app.parkingLots,
      },
    ],
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
      title: "Cambiar estado",
      warningActiveTicket:
        "Esta plaza tiene un ticket activo. ¿Estás seguro de cambiar el estado?",
    },
  },
} as const;
