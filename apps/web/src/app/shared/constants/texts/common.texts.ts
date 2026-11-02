export const DATA_TABLE_TEXTS = {
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
} as const;

export const SERVER_TEXTS = {
  errors: {
    404: "Recurso no encontrado. La página o recurso que busca no existe.",
    500: "Error interno del servidor. Por favor, inténtelo de nuevo más tarde o contacte a soporte.",
    generic:
      "Ha ocurrido un error inesperado. Por favor, recargue la página e inténtelo de nuevo.",
    network: "Error de conexión. Verifique su conexión a internet.",
    timeout:
      "La solicitud ha tardado demasiado tiempo. Por favor, inténtelo de nuevo.",
  },
} as const;
