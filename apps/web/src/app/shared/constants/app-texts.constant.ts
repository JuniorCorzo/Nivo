import { APP_ROUTES } from './app-routes.constant';

export const APP_TEXTS = {
  auth: {
    login: {
      title: 'Bienvenido de nuevo',
      description: 'Ingresa a tu panel de control',
      form: {
        email: {
          label: 'Correo',
          placeholder: 'tu@correo.com',
          errors: {
            required: 'El correo es requerido',
            invalid: 'Ingresa un correo válido (ej: angel@nivo.com)',
          },
        },
        password: {
          label: 'Contraseña',
          placeholder: 'Ingresa tu contraseña',
          errors: {
            required: 'La contraseña es requerida',
            invalid: 'Contraseña incorrecta',
            minLength: 'La contraseña debe tener al menos 8 caracteres',
          },
        },
      },
      actions: {
        submit: 'Iniciar sesión',
        forgotPassword: '¿Olvidaste la contraseña?',
        noAccount: '¿No tienes una cuenta?',
        register: 'Regístrate.',
      },
      errors: {
        invalidCredentials: 'Correo o contraseña incorrectos',
      },
    },
    register: {
      title: 'Crear una cuenta',
      description: 'Registra tu información para comenzar',
      form: {
        companyName: {
          label: 'Nombre de compañía',
          placeholder: 'Ej. Nivo Solutions SAS',
          errors: {
            required: 'El nombre de la compañía es requerido',
            minLength: 'El nombre debe tener al menos 3 caracteres',
            maxLength: 'El nombre no puede exceder 100 caracteres',
          },
        },
        username: {
          label: 'Nombre de usuario',
          placeholder: 'Ej. Ángel Corzo',
          errors: {
            required: 'El nombre de usuario es requerido',
            minLength: 'El nombre debe tener al menos 3 caracteres',
            maxLength: 'El nombre no puede exceder 50 caracteres',
            pattern: 'Solo letras, números y espacios permitidos',
          },
        },
        email: {
          label: 'Correo',
          placeholder: 'tu@correo.com',
          errors: {
            required: 'El correo es requerido',
            invalid: 'Ingresa un correo válido (ej: angel@nivo.com)',
          },
        },
        contactInfo: {
          label: 'Número de contacto',
          placeholder: 'Ej. 300 123 4567',
          errors: {
            required: 'El número de contacto es requerido',
            invalid: 'Ingresa un número de contacto válido',
          },
        },
        password: {
          label: 'Contraseña',
          placeholder: 'Mínimo 8 caracteres',
          errors: {
            required: 'La contraseña es requerida',
            minLength: 'La contraseña debe tener al menos 8 caracteres',
            pattern: 'Debe contener mayúscula, minúscula y número',
          },
        },
        confirmPassword: {
          label: 'Confirmar Contraseña',
          placeholder: 'Repite tu contraseña',
          errors: {
            required: 'Confirma tu contraseña',
            mismatch: 'Las contraseñas no coinciden',
          },
        },
      },
      actions: {
        submit: 'Crear cuenta',
        hasAccount: '¿Ya tienes una cuenta?',
        login: 'Inicia sesión',
      },
    },
  },
  parking: {
    list: {
      title: 'Parqueaderos',
      subtitle: 'Gestiona y administra tus propiedades',
      search: {
        placeholder: 'Busca por nombre del parqueadero',
        noResults: 'No se encontraron parqueaderos',
      },
      table: {
        columns: {
          name: 'Nombre',
          address: 'Dirección',
          city: 'Ciudad',
          timezone: 'Zona horaria',
          currency: 'Moneda',
          operatingHours: 'Horario',
          actions: 'Acciones',
        },
      },
      empty: {
        title: 'No tienes parqueaderos registrados',
        description: 'Comienza agregando tu primer parqueadero para gestionar tus propiedades.',
      },
    },
    form: {
      create: {
        title: 'Crear Parqueadero',
        description: 'Registra un nuevo parqueadero en tu cuenta',
      },
      edit: {
        title: 'Editar Parqueadero',
        description: 'Actualiza la información de tu parqueadero',
      },
      fields: {
        name: {
          label: 'Nombre del parqueadero',
          placeholder: 'Ej. Parqueadero Centro',
          errors: {
            required: 'El nombre del parqueadero es requerido',
            minLength: 'El nombre debe tener al menos 3 caracteres',
            maxLength: 'El nombre no puede exceder 100 caracteres',
          },
        },
        address: {
          title: 'Dirección',
          street: {
            label: 'Calle / Dirección',
            placeholder: 'Ej. Carrera 7 #11-10',
            errors: {
              required: 'La dirección es requerida',
            },
          },
          city: {
            label: 'Ciudad',
            placeholder: 'Selecciona o escribe una ciudad',
            errors: {
              required: 'La ciudad es requerida',
            },
          },
          state: {
            label: 'Departamento',
            placeholder: 'Selecciona un departamento',
            errors: {
              required: 'El departamento es requerido',
            },
          },
          zipCode: {
            label: 'Código postal',
            placeholder: 'Ej. 110111',
            errors: {
              invalid: 'Ingresa un código postal válido',
            },
          },
        },
        operatingHours: {
          title: 'Horario de operación',
          openTime: {
            label: 'Hora de apertura',
            placeholder: 'Ej. 08:00',
            errors: {
              required: 'La hora de apertura es requerida',
              invalidFormat: 'Formato inválido. Use HH:mm',
            },
          },
          closeTime: {
            label: 'Hora de cierre',
            placeholder: 'Ej. 20:00',
            errors: {
              required: 'La hora de cierre es requerida',
              invalidRange: 'La hora de cierre debe ser posterior a la de apertura',
              invalidFormat: 'Formato inválido. Use HH:mm',
            },
          },
        },
        slots: {
          title: 'Grupos de cupos',
          description:
            'Cada grupo define un prefijo, una zona, un tipo de vehículo y una cantidad.',
          itemLabel: 'Grupo',
          prefix: {
            label: 'Prefijo',
            placeholder: 'Ej. A',
          },
          zone: {
            label: 'Zona',
            placeholder: 'Ej. Norte',
          },
          type: {
            label: 'Tipo de vehículo',
            placeholder: 'Selecciona un tipo de vehículo',
          },
          count: {
            label: 'Cantidad',
            placeholder: 'Ej. 100',
          },
          actions: {
            add: 'Agregar grupo',
            remove: 'Eliminar grupo',
          },
        },
      },
    },
    actions: {
      create: 'Crear parqueadero',
      edit: 'Guardar cambios',
      delete: 'Eliminar',
      viewDetails: 'Ver detalle',
      placeholderMap: 'Selecciona la ubicación en el mapa',
      backToList: 'Volver a la lista',
    },
    messages: {
      created: 'Parqueadero creado exitosamente',
      updated: 'Parqueadero actualizado exitosamente',
      deleted: 'Parqueadero eliminado exitosamente',
      errors: {
        unauthorized: 'No tienes permisos para realizar esta acción',
        notFound: 'Parqueadero no encontrado',
        duplicateName: 'Ya existe un parqueadero con ese nombre',
      },
    },
    confirmations: {
      delete: {
        title: 'Eliminar parqueadero',
        message:
          '¿Estás seguro de que deseas eliminar este parqueadero? Esta acción no se puede deshacer.',
        confirm: 'Sí, eliminar',
        cancel: 'Cancelar',
      },
    },
  },
  sidebar: {
    logo: 'Nivo',
    nav: [
      {
        label: 'Overview',
        icon: 'lucideLayoutDashboard',
        url: '',
      },
      {
        label: 'Parqueaderos',
        icon: 'lucideCar',
        url: APP_ROUTES.app.parkingLots,
      },
    ],
    theme: {
      label: 'Tema',
    },
    logout: 'Cerrar sesión',
  },
  server: {
    errors: {
      500: 'Error interno del servidor. Por favor, inténtelo de nuevo más tarde o contacte a soporte.',
      404: 'Recurso no encontrado. La página o recurso que busca no existe.',
      generic:
        'Ha ocurrido un error inesperado. Por favor, recargue la página e inténtelo de nuevo.',
      network: 'Error de conexión. Verifique su conexión a internet.',
      timeout: 'La solicitud ha tardado demasiado tiempo. Por favor, inténtelo de nuevo.',
    },
  },
} as const;
