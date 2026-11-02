export const USERS_TEXTS = {
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
} as const;
