export const APP_TEXTS = {
  auth: {
    login: {
      title: 'Bienvenido de nuevo',
      description: 'Ingresa a tu panel de control',
      form: {
        email: {
          label: 'Correo',
          placeholder: 'angel@nivo.com',
          errors: {
            required: 'El correo es requerido',
            invalid: 'Ingresa un correo válido (ej: angel@nivo.com)',
          },
        },
        password: {
          label: 'Contraseña',
          placeholder: 'Password',
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
          placeholder: 'Nivo Solutions',
          errors: {
            required: 'El nombre de la compañía es requerido',
            minLength: 'El nombre debe tener al menos 3 caracteres',
            maxLength: 'El nombre no puede exceder 100 caracteres',
          },
        },
        username: {
          label: 'Nombre de usuario',
          placeholder: 'Angel Corzo',
          errors: {
            required: 'El nombre de usuario es requerido',
            minLength: 'El nombre debe tener al menos 3 caracteres',
            maxLength: 'El nombre no puede exceder 50 caracteres',
            pattern: 'Solo letras, números y espacios permitidos',
          },
        },
        email: {
          label: 'Correo',
          placeholder: 'angel@nivo.com',
          errors: {
            required: 'El correo es requerido',
            invalid: 'Ingresa un correo válido (ej: angel@nivo.com)',
          },
        },
        contactInfo: {
          label: 'Número de contacto',
          placeholder: '321-2321212',
          errors: {
            required: 'El número de contacto es requerido',
            invalid: 'Ingresa un número de contacto válido',
          },
        },
        password: {
          label: 'Contraseña',
          placeholder: 'Password',
          errors: {
            required: 'La contraseña es requerida',
            minLength: 'La contraseña debe tener al menos 8 caracteres',
            pattern: 'Debe contener mayúscula, minúscula y número',
          },
        },
        confirmPassword: {
          label: 'Confirmar Contraseña',
          placeholder: 'Password',
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
        placeholder: 'Buscar parqueadero por nombre...',
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
        title: 'Nuevo Parqueadero',
        description: 'Registra un nuevo parqueadero en tu cuenta',
      },
      edit: {
        title: 'Editar Parqueadero',
        description: 'Actualiza la información de tu parqueadero',
      },
      fields: {
        name: {
          label: 'Nombre del parqueadero',
          placeholder: 'Parking Sol',
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
            placeholder: 'Carrera 7 # 11-10',
            errors: {
              required: 'La dirección es requerida',
            },
          },
          city: {
            label: 'Ciudad',
            placeholder: 'Bogotá',
            errors: {
              required: 'La ciudad es requerida',
            },
          },
          state: {
            label: 'Departamento / Estado',
            placeholder: 'Cundinamarca',
            errors: {
              required: 'El departamento es requerido',
            },
          },
          country: {
            label: 'País',
            placeholder: 'Colombia',
            errors: {
              required: 'El país es requerido',
            },
          },
          zipCode: {
            label: 'Código postal',
            placeholder: '110311',
            errors: {
              invalid: 'Ingresa un código postal válido',
            },
          },
        },
        timezone: {
          label: 'Zona horaria',
          placeholder: 'UTC-5',
          errors: {
            required: 'La zona horaria es requerida',
            invalid: 'Formato de zona horaria inválido (ej: UTC-5)',
          },
        },
        currency: {
          label: 'Moneda',
          placeholder: 'COP',
          errors: {
            required: 'La moneda es requerida',
            invalid: 'Código de moneda inválido (ej: COP, USD)',
          },
        },
        operatingHours: {
          title: 'Horario de operación',
          openTime: {
            label: 'Hora de apertura',
            placeholder: '08:00',
            errors: {
              required: 'La hora de apertura es requerida',
            },
          },
          closeTime: {
            label: 'Hora de cierre',
            placeholder: '20:00',
            errors: {
              required: 'La hora de cierre es requerida',
              invalidRange: 'La hora de cierre debe ser posterior a la de apertura',
            },
          },
        },
      },
    },
    actions: {
      create: 'Crear parqueadero',
      edit: 'Guardar cambios',
      delete: 'Eliminar',
      viewDetails: 'Ver detalle',
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
        url: '/app/parking-lots',
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
