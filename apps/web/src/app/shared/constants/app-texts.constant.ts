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
  server: {
    errors: {
      500: 'Error interno del servidor. Por favor, inténtelo de nuevo más tarde o contacte a soporte.',
      404: 'Recurso no encontrado. La página o recurso que busca no existe.',
      generic: 'Ha ocurrido un error inesperado. Por favor, recargue la página e inténtelo de nuevo.',
      network: 'Error de conexión. Verifique su conexión a internet.',
      timeout: 'La solicitud ha tardado demasiado tiempo. Por favor, inténtelo de nuevo.',
    },
  },
} as const;
