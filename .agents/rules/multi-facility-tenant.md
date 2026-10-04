# Multi-Facility Tenant Architecture (Doble Ámbito)

## Soporte Dual Nativo (Sede Individual vs. Consolidado Global)

- Analítica, finanzas u operaciones de instalaciones físicas deben soportar consulta por sede puntual (`?parkingId={uuid}`) o agregada de red del tenant (omitir `parkingId` o usar `scope=GLOBAL`).

## Detección Automática en Frontend

- **Tenant con 1 Sola Sede:** Frontend enfoca directamente esa instalación sin selectores redundantes ni opción de consolidado.
- **Tenant con Múltiples Sedes (> 1):** Navegación y cabecera proveen opción "Todas las Sedes (Consolidado Global)", agregan KPIs corporativos y ofrecen widget comparativo entre instalaciones (ranking/gráfico de barras).
