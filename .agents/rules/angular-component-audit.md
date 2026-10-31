# Guía y Reglas de Auditoría: Detección y División de Componentes Grandes en Angular

Este documento define los criterios cuantitativos y cualitativos para auditar componentes de Angular (`.ts` y `.html`), identificar "componentes gigantes" (*God Components*) y recomendar su refactorización.

---

## 1. Umbrales Cuantitativos (Límites Duros y Advertencias)

| Métrica | Estado Óptimo | Nivel de Advertencia (Warning) | Nivel Crítico (Refactor Obligatorio) |
| :--- | :--- | :--- | :--- |
| **Líneas en TypeScript (`.ts`)** | < 150 líneas | 200 - 300 líneas | > 350 líneas |
| **Líneas en Template (`.html`)** | < 80 líneas | 100 - 150 líneas | > 150 líneas |
| **Dependencias Inyectadas** | 1 - 3 servicios | 4 - 5 servicios | ≥ 6 servicios (`constructor` o `inject()`) |
| **Entradas y Salidas (`@Input`, `@Output`, `input()`, `output()`)** | 1 - 4 combinados | 5 - 7 combinados | ≥ 8 combinados |
| **Nivel de Anidamiento en Template** | ≤ 3 niveles de profundidad DOM | 4 niveles con directivas de control | ≥ 5 niveles o bloques condicionales anidados |

---

## 2. Heurísticas de Auditoría y Detección de "Code Smells"

El agente auditor debe marcar como prioritario cualquier componente que presente al menos **dos** de las siguientes anomalías arquitectónicas:

### Regla A: Violación de Responsabilidad Única (SRP)
* **Condición de fallo:** El componente combina dos o más de las siguientes tareas:
  1. Llamadas directas a API o manipulación de `HttpClient`.
  2. Lógica intensiva de validación o construcción de formularios (`FormBuilder`, `FormGroup`).
  3. Control manual de estado visual/interacción (abrir/cerrar modales, banners, tooltips, toasts).
  4. Transformación compleja de modelos o mapeo de datos de negocio.
* **Acción requerida:** Extraer la lógica de negocio a un Servicio o *Signal Store*, y delegar elementos visuales a componentes secundarios.

### Regla B: Complejidad Ciclomática y Estructural en el Template
* **Condición de fallo:**
  * Uso de múltiples bloques `@if` / `*ngIf` anidados que actúan como "máquinas de estados de vista" dentro del mismo archivo.
  * Presencia de subsecciones visuales identificables con más de 20 líneas de marcado (ej. tablas, barras de filtros, resúmenes financieros, paginadores).
* **Acción requerida:** Aplicar el patrón **Container/Presentational (Smart vs. Dumb)** extrayendo la UI en componentes de presentación.

### Regla C: "Prop Drilling" y Sobrecarga de Entradas/Salidas
* **Condición de fallo:** Componentes que reciben inputs únicamente para reenviarlos directamente a componentes hijos en la plantilla, sin procesar la información.
* **Acción requerida:** Evaluar el uso de un servicio scoped para compartir estado o reestructurar la jerarquía de vistas.

### Regla D: Complejidad Excesiva de Pruebas Unitarias
* **Condición de fallo:** Archivos `.spec.ts` donde la configuración de `TestBed` requiere más de 5 mocks de servicios o fixtures de datos mayores a 50 líneas solo para instanciar el componente.
* **Acción requerida:** Reducir acoplamiento dividiendo el componente en unidades funcionales aisladas.

---

## 3. Matriz de Decisión para Refactorización

Al detectar un componente fuera de los umbrales, el auditor debe sugerir la estrategia adecuada según el síntoma:

```
¿Dónde radica la sobrecarga principal?
│
├── Lógica TypeScript (.ts > 300 líneas / > 5 servicios inyectados)
│   ├── ¿Es manejo de estado o API? ──────> Extraer a Service / Component Store
│   └── ¿Es cálculo o parseo de datos? ───> Extraer a Funciones puras / Pipes
│
├── Template HTML (.html > 150 líneas / DOM anidado)
│   ├── ¿Hay secciones reutilizables? ────> Crear Componentes de Presentación (Dumb)
│   └── ¿Maneja múltiples submáquinas de vista? ──> Dividir en Rutas Hijas / Child Components
│
└── Manipulación intensiva de DOM / Estilos
    └── ¿Se interactúa con eventos nativos/clases? ─> Extraer a Directivas personalizadas
```

---

## 4. Formato de Salida Esperado del Agente Auditor

Cada hallazgo reportado por el auditor debe estructurarse de la siguiente manera:

1. **Ruta del archivo:** `src/app/.../component-name.ts`
2. **Severidad:** [Crítico | Advertencia | Sugerencia]
3. **Métricas detectadas:** (ej. *Lines TS: 410, Injected Services: 7, Inputs: 9*)
4. **Principio infringido:** (ej. *SRP, Container/Presentational Pattern*)
5. **Recomendación concreta:** Acción paso a paso para la división (ej. *"Extraer la tabla de resultados a `<app-item-table>` y migrar las llamadas HTTP al servicio `ItemDataService`"*).
