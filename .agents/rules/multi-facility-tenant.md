# Multi-Facility Tenant Architecture (Doble Ámbito)

## Soporte Dual Nativo (Sede Individual vs. Consolidado Global)

- Cualquier funcionalidad analítica, financiera u operativa de instalaciones físicas debe soportar consulta unificada por sede puntual (`?parkingId={uuid}`) o agregada de toda la red del tenant (omitiendo `parkingId` o `scope=GLOBAL`).

## Detección Automática en Frontend

- **Tenant con 1 Sola Sede:** El frontend se enfoca directamente en dicha instalación sin selectores redundantes ni opciones de consolidado.
- **Tenant con Múltiples Sedes (> 1):** La navegación y cabecera deben proveer la opción "Todas las Sedes (Consolidado Global)", agregando KPIs corporativos y ofreciendo un widget comparativo entre instalaciones (ranking/gráfico de barras).
