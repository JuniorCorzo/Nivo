export const AUTH_TEXTS = {
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
} as const;
