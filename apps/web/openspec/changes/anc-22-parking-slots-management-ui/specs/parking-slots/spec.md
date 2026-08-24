# parking-slots Specification

## Purpose
TBD - created from Open Design `nivo-gestion-plazas-v3.html`. Update Purpose after archive.

## Requirements

### Requirement: Slots list page
El sistema SHALL mostrar una página de listado de plazas bajo el contexto de un parqueadero, con tabla, búsqueda, filtros, paginación y acciones por fila.

#### Scenario: Visualización del listado
- **WHEN** el usuario navega a la sección de plazas de un parqueadero
- **THEN** se muestra una tabla con columnas: número, prefijo, zona, tipo, estado y acciones

#### Scenario: Búsqueda y filtros
- **WHEN** el usuario escribe un término o ajusta filtros por tipo, estado o zona
- **THEN** la tabla se actualiza para mostrar solo plazas que coinciden con esos criterios

#### Scenario: Acciones por fila
- **WHEN** el usuario ve una fila de la tabla
- **THEN** dispone de acciones para ver detalle, editar y eliminar según el estado de la plaza

### Requirement: Empty states
El sistema SHALL mostrar estados vacíos específicos para ausencia de datos y para búsquedas o filtros sin resultados.

#### Scenario: Sin plazas configuradas
- **WHEN** el parqueadero no tiene plazas
- **THEN** se muestra un mensaje vacío con CTA para crear el primer lote

#### Scenario: Búsqueda vacía
- **WHEN** la búsqueda no encuentra coincidencias
- **THEN** se muestra un mensaje indicando que no hay resultados para el término ingresado

#### Scenario: Filtros vacíos
- **WHEN** los filtros activos no retornan datos
- **THEN** se muestra un mensaje indicando que ningún registro coincide y una acción para limpiar filtros

### Requirement: Batch create page
El sistema SHALL proveer una página de creación por lote para generar plazas secuenciales con prefijo, rango, zona, tipo y estado inicial.

#### Scenario: Previsualización del rango
- **WHEN** el usuario completa prefijo, desde, hasta y tipo
- **THEN** se muestra un preview con el número de plazas a crear y los primeros valores del rango

#### Scenario: Validación de conflicto
- **WHEN** el rango propuesto se superpone con plazas existentes
- **THEN** se muestra una advertencia de conflicto y el envío queda bloqueado hasta corregir el rango

#### Scenario: Creación exitosa
- **WHEN** el usuario confirma un rango válido
- **THEN** se crean las plazas secuenciales y se retorna al listado con feedback de éxito

### Requirement: Slot edit page
El sistema SHALL proveer una página de edición de plaza con campos controlados por restricciones de estado y ticket activo.

#### Scenario: Plaza ocupada
- **WHEN** la plaza está ocupada
- **THEN** el campo de número queda bloqueado y se muestra una ayuda explicando la restricción

#### Scenario: Ticket activo
- **WHEN** la plaza tiene un ticket activo
- **THEN** el campo de tipo queda bloqueado y se muestra un warning contextual

#### Scenario: Guardado de cambios
- **WHEN** el usuario guarda cambios válidos
- **THEN** se persisten los cambios y se retorna al listado

### Requirement: Slot detail drawer
El sistema SHALL mostrar el detalle de una plaza en un drawer lateral con tabs General e Historial.

#### Scenario: Abrir detalle
- **WHEN** el usuario hace click en ver detalle
- **THEN** se abre un drawer con la información principal de la plaza

#### Scenario: Historial de tickets
- **WHEN** el usuario cambia al tab Historial
- **THEN** se muestran tickets previos en tarjetas separadas

### Requirement: Status change modal
El sistema SHALL usar un modal para cambiar el estado de una plaza, con opciones dependientes del estado actual.

#### Scenario: Opciones por estado actual
- **WHEN** la plaza está disponible, ocupada o en mantenimiento
- **THEN** el modal solo ofrece transiciones válidas para ese estado

#### Scenario: Cambio con ticket activo
- **WHEN** el usuario intenta pasar una plaza ocupada a disponible y existe ticket activo
- **THEN** se muestra una advertencia extra y se exige confirmación explícita

### Requirement: Delete modal
El sistema SHALL usar un modal para eliminar una plaza, con confirmación adicional cuando exista historial.

#### Scenario: Eliminación sin historial
- **WHEN** la plaza no tiene historial relevante
- **THEN** el modal permite confirmar la eliminación directamente

#### Scenario: Eliminación con historial
- **WHEN** la plaza tiene historial de tickets
- **THEN** el modal exige una confirmación adicional antes de habilitar el botón final

### Requirement: Navigation and breadcrumb
El sistema SHALL mantener la gestión de plazas dentro del contexto del parqueadero padre y mostrar breadcrumbs coherentes.

#### Scenario: Contexto de parqueadero
- **WHEN** el usuario navega a la gestión de plazas
- **THEN** el breadcrumb muestra Parqueaderos > parqueadero actual > Plazas

#### Scenario: Volver al listado
- **WHEN** el usuario cancela creación o edición
- **THEN** vuelve al listado de plazas sin perder el contexto del parqueadero padre
