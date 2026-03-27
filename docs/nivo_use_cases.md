# Casos de Uso - Nivo

## Análisis y Extracción de Casos de Uso

Este documento presenta los casos de uso identificados a partir de las historias de usuario del sistema Nivo, organizados por módulos funcionales.

---

## Tabla de Contenido

1. [Módulo de Autenticación y Gestión de Inquilinos](#1-módulo-de-autenticación-y-gestión-de-inquilinos)
2. [Módulo de Gestión de Parqueaderos](#2-módulo-de-gestión-de-parqueaderos)
3. [Módulo de Gestión de Plazas/Slots](#3-módulo-de-gestión-de-plazasslots)
4. [Módulo de Configuración de Tarifas](#4-módulo-de-configuración-de-tarifas)
5. [Módulo de Gestión de Reservas](#5-módulo-de-gestión-de-reservas)
6. [Módulo de Operaciones (Check-in/Check-out)](#6-módulo-de-operaciones-check-incheck-out)
7. [Módulo de Reportes y Dashboard](#7-módulo-de-reportes-y-dashboard)
8. [Módulo de API Pública](#8-módulo-de-api-pública)
9. [Módulo de Gestión de Usuarios y Roles](#9-módulo-de-gestión-de-usuarios-y-roles)
10. [Casos de Uso Transversales](#10-casos-de-uso-transversales)
11. [Resumen de Actores y Casos de Uso](#resumen-de-actores-y-casos-de-uso)

---

## 1. Módulo de Autenticación y Gestión de Inquilinos

### CU-001: Registrar Nuevo Propietario (Inquilino)
**Actor Principal:** Usuario No Registrado  
**Precondiciones:** El usuario no tiene cuenta en el sistema  
**Flujo Principal:**
1. El usuario accede al formulario de registro
2. El sistema solicita: email, contraseña y nombre del parqueadero
3. El usuario completa los datos requeridos
4. El sistema valida la unicidad del email
5. El sistema crea un nuevo inquilino (tenant)
6. El sistema crea el usuario con rol de Owner asociado al tenant
7. El sistema confirma el registro exitoso

**Flujo Alternativo:**
- 4a. Email ya existe: El sistema notifica y solicita usar otro email o iniciar sesión

**Postcondiciones:** Usuario registrado como Owner con su propio entorno multi-inquilino

---

### CU-002: Iniciar Sesión
**Actor Principal:** Usuario Registrado  
**Precondiciones:** El usuario tiene una cuenta activa  
**Flujo Principal:**
1. El usuario accede al formulario de inicio de sesión
2. El sistema solicita credenciales (email y contraseña)
3. El usuario ingresa sus credenciales
4. El sistema valida las credenciales
5. El sistema identifica el tenant del usuario
6. El sistema redirige al panel de control correspondiente al tenant
7. El sistema establece la sesión activa

**Flujo Alternativo:**
- 4a. Credenciales inválidas: El sistema muestra mensaje de error y no permite acceso

**Postcondiciones:** Usuario autenticado con acceso a su tenant específico

---

## 2. Módulo de Gestión de Parqueaderos

### CU-003: Crear Parqueadero
**Actor Principal:** Owner  
**Precondiciones:** Usuario autenticado con rol de Owner  
**Flujo Principal:**
1. El Owner accede a la sección de gestión de parqueaderos
2. El sistema muestra la opción de crear nuevo parqueadero
3. El Owner selecciona "Crear parqueadero"
4. El sistema solicita: nombre, ubicación, capacidad y otros datos
5. El Owner completa la información
6. El sistema valida los datos
7. El sistema crea el parqueadero asociado al tenant del Owner
8. El sistema confirma la creación y muestra el parqueadero en la lista

**Flujo Alternativo:**
- 6a. Datos inválidos: El sistema indica los errores y solicita corrección
- 3a. Usuario sin permisos (ej. Operador): El sistema deniega la acción

**Postcondiciones:** Nuevo parqueadero creado y disponible para configuración

---

### CU-004: Editar Parqueadero
**Actor Principal:** Owner  
**Precondiciones:** Parqueadero existente, usuario con permisos  
**Flujo Principal:**
1. El Owner selecciona un parqueadero de su lista
2. El sistema muestra los detalles del parqueadero
3. El Owner selecciona "Editar"
4. El sistema habilita la edición de campos (nombre, ubicación, capacidad, etc.)
5. El Owner modifica los campos deseados
6. El Owner confirma los cambios
7. El sistema valida y guarda las modificaciones
8. El sistema actualiza la información en la vista de detalles

**Postcondiciones:** Información del parqueadero actualizada

---

### CU-005: Listar Parqueaderos
**Actor Principal:** Owner, Gerente  
**Precondiciones:** Usuario autenticado  
**Flujo Principal:**
1. El usuario accede a la sección de parqueaderos
2. El sistema consulta los parqueaderos del tenant del usuario
3. El sistema muestra la lista de parqueaderos con información básica
4. El usuario puede seleccionar un parqueadero para ver detalles

**Postcondiciones:** Usuario visualiza sus parqueaderos

---

## 3. Módulo de Gestión de Plazas/Slots

### CU-006: Crear Plaza
**Actor Principal:** Owner, Gerente  
**Precondiciones:** Parqueadero existente, usuario con permisos  
**Flujo Principal:**
1. El usuario selecciona un parqueadero
2. El sistema muestra las plazas existentes y opción de agregar
3. El usuario selecciona "Agregar plaza"
4. El sistema solicita: número de plaza, tipo de vehículo, zona (opcional)
5. El usuario completa la información
6. El sistema valida unicidad del número de plaza en el parqueadero
7. El sistema crea la plaza asociada al parqueadero
8. El sistema actualiza la lista de plazas

**Flujo Alternativo:**
- 6a. Número de plaza duplicado: El sistema notifica y solicita otro número
- 3a. Usuario sin permisos (Operador): El sistema deniega la acción

**Postcondiciones:** Nueva plaza disponible en el parqueadero

---

### CU-007: Editar Plaza
**Actor Principal:** Owner, Gerente  
**Precondiciones:** Plaza existente, usuario con permisos  
**Flujo Principal:**
1. El usuario selecciona una plaza de la lista
2. El sistema muestra los detalles de la plaza
3. El usuario selecciona "Editar"
4. El sistema habilita la edición (tipo de vehículo, zona, etc.)
5. El usuario modifica los campos
6. El usuario confirma los cambios
7. El sistema valida y guarda las modificaciones
8. El sistema actualiza la información en la vista

**Postcondiciones:** Información de la plaza actualizada

---

### CU-008: Listar Plazas
**Actor Principal:** Owner, Gerente, Operador  
**Precondiciones:** Usuario autenticado, parqueadero seleccionado  
**Flujo Principal:**
1. El usuario selecciona un parqueadero
2. El sistema consulta las plazas del parqueadero
3. El sistema muestra la lista con: número, tipo, estado (libre/ocupada/reservada)
4. El usuario puede filtrar por estado o tipo

**Postcondiciones:** Usuario visualiza las plazas disponibles

---

## 4. Módulo de Configuración de Tarifas

### CU-009: Definir Tarifa
**Actor Principal:** Owner  
**Precondiciones:** Parqueadero existente  
**Flujo Principal:**
1. El Owner accede a la configuración de tarifas del parqueadero
2. El sistema muestra las tarifas actuales (si existen)
3. El Owner selecciona "Nueva tarifa"
4. El sistema solicita: tipo de tarifa (por hora/día/fracción), monto, zona (opcional)
5. El Owner completa la configuración
6. El sistema valida los datos
7. El sistema guarda la tarifa asociada al parqueadero
8. El sistema confirma la creación

**Flujo Alternativo:**
- 4a. Configuración de tarifas diferenciadas por zona
- 4b. Configuración de reglas especiales (ej. primera hora gratis)

**Postcondiciones:** Tarifa activa para cálculo de cobros

---

### CU-010: Calcular Cobro
**Actor Principal:** Sistema  
**Precondiciones:** Tarifa configurada, ticket activo con hora de entrada  
**Flujo Principal:**
1. El sistema recibe solicitud de cálculo (al momento del check-out)
2. El sistema obtiene la hora de entrada del ticket
3. El sistema obtiene la hora de salida (actual)
4. El sistema calcula la duración del estacionamiento
5. El sistema identifica la tarifa aplicable (según zona, tipo de vehículo)
6. El sistema aplica las reglas de cálculo (por hora, fracción, etc.)
7. El sistema retorna el monto a cobrar

**Flujo Alternativo:**
- 5a. Tarifas diferenciadas: El sistema aplica la tarifa de la zona específica
- 6a. Reglas especiales: El sistema aplica descuentos o tarifas especiales

**Postcondiciones:** Monto calculado listo para cobro

---

## 5. Módulo de Gestión de Reservas

### CU-011: Crear Reserva
**Actor Principal:** Conductor (Cliente)  
**Precondiciones:** Usuario registrado como conductor, plaza disponible  
**Flujo Principal:**
1. El conductor accede al sistema de reservas
2. El sistema solicita: parqueadero, fecha, hora inicio, hora fin
3. El conductor completa los datos
4. El sistema consulta disponibilidad en el rango horario
5. El sistema muestra plazas disponibles
6. El conductor selecciona una plaza
7. El sistema valida que no exista overbooking
8. El sistema crea la reserva asociada al usuario y plaza
9. El sistema marca la plaza como "Reservada" en el rango horario
10. El sistema genera código QR de reserva
11. El sistema envía confirmación al conductor

**Flujo Alternativo:**
- 7a. Plaza ya reservada en ese horario: El sistema rechaza y solicita otra plaza
- 4a. No hay plazas disponibles: El sistema notifica y sugiere otros horarios

**Postcondiciones:** Reserva creada, plaza bloqueada, QR generado

---

### CU-012: Cancelar Reserva
**Actor Principal:** Conductor  
**Precondiciones:** Reserva activa existente  
**Flujo Principal:**
1. El conductor accede a sus reservas activas
2. El sistema muestra lista de reservas futuras
3. El conductor selecciona una reserva
4. El conductor selecciona "Cancelar"
5. El sistema valida el tiempo límite de cancelación
6. El sistema solicita confirmación
7. El conductor confirma la cancelación
8. El sistema libera la plaza en el rango horario
9. El sistema cambia el estado de la reserva a "Cancelada"
10. El sistema notifica al conductor

**Flujo Alternativo:**
- 5a. Fuera del tiempo límite: El sistema no permite cancelación o aplica penalización

**Postcondiciones:** Reserva cancelada, plaza disponible nuevamente

---

### CU-013: Consultar Disponibilidad
**Actor Principal:** Conductor, Sistema Externo (via API)  
**Precondiciones:** Parqueadero activo  
**Flujo Principal:**
1. El actor solicita disponibilidad para un parqueadero, fecha y horario
2. El sistema consulta las plazas del parqueadero
3. El sistema filtra plazas ocupadas y reservadas en el rango horario
4. El sistema retorna lista de plazas disponibles con sus características
5. El sistema incluye información de tarifas (opcional)

**Postcondiciones:** Actor recibe información de disponibilidad

---

## 6. Módulo de Operaciones (Check-in/Check-out)

### CU-014: Realizar Check-in con Reserva
**Actor Principal:** Operador  
**Precondiciones:** Vehículo con reserva activa, código QR de reserva  
**Flujo Principal:**
1. El operador recibe al vehículo en el parqueadero
2. El operador escanea el código QR de la reserva
3. El sistema valida la reserva (fecha, horario, estado)
4. El sistema verifica la plaza asignada
5. El sistema genera ticket digital de entrada
6. El sistema registra hora de entrada
7. El sistema asocia el ticket a la plaza reservada
8. El sistema cambia estado de plaza a "Ocupada"
9. El sistema cambia estado de reserva a "En uso"
10. El sistema muestra confirmación al operador

**Flujo Alternativo:**
- 3a. Reserva inválida o vencida: El sistema notifica y ofrece check-in sin reserva
- 3b. Llegada fuera de horario: El sistema aplica políticas configuradas

**Postcondiciones:** Vehículo ingresado, ticket activo, plaza ocupada

---

### CU-015: Realizar Check-in sin Reserva
**Actor Principal:** Operador  
**Precondiciones:** Plazas disponibles en el parqueadero  
**Flujo Principal:**
1. El operador recibe al vehículo sin reserva
2. El sistema muestra plazas disponibles
3. El operador selecciona una plaza libre
4. El operador ingresa datos del vehículo (placa, tipo)
5. El sistema genera ticket digital de entrada
6. El sistema registra hora de entrada
7. El sistema asocia el ticket a la plaza seleccionada
8. El sistema cambia estado de plaza a "Ocupada"
9. El sistema muestra confirmación y entrega comprobante

**Flujo Alternativo:**
- 2a. No hay plazas disponibles: El sistema notifica al operador

**Postcondiciones:** Vehículo ingresado, ticket activo, plaza ocupada

---

### CU-016: Realizar Check-out y Cobro
**Actor Principal:** Operador  
**Precondiciones:** Ticket activo, tarifa configurada  
**Flujo Principal:**
1. El operador identifica el vehículo que sale (por placa o ticket)
2. El sistema recupera el ticket activo
3. El operador registra la hora de salida
4. El sistema invoca CU-010 (Calcular Cobro)
5. El sistema muestra el monto a pagar al operador
6. El operador informa al cliente y procesa el pago
7. El operador confirma el pago en el sistema
8. El sistema registra la transacción (método de pago, monto)
9. El sistema cierra el ticket
10. El sistema libera la plaza (estado "Libre")
11. El sistema genera recibo digital
12. El sistema muestra confirmación

**Flujo Alternativo:**
- 7a. Pago no confirmado: El sistema no permite cerrar ticket ni liberar plaza
- 6a. Cliente disputa monto: Operador puede solicitar revisión de cálculo

**Postcondiciones:** Ticket cerrado, transacción registrada, plaza liberada, recibo generado

---

### CU-017: Generar Recibo
**Actor Principal:** Sistema  
**Precondiciones:** Transacción de pago completada  
**Flujo Principal:**
1. El sistema recibe solicitud de generación de recibo
2. El sistema recupera datos del ticket (hora entrada, hora salida)
3. El sistema recupera datos de la transacción (monto, método pago)
4. El sistema calcula desglose (duración, tarifa aplicada)
5. El sistema genera documento de recibo con:
   - Datos del parqueadero
   - Datos del vehículo
   - Hora de entrada y salida
   - Duración del estacionamiento
   - Tarifa aplicada
   - Monto total pagado
   - Método de pago
   - Fecha y hora de emisión
6. El sistema almacena el recibo
7. El sistema retorna el recibo en formato digital (PDF/email)

**Postcondiciones:** Recibo generado y disponible

---

## 7. Módulo de Reportes y Dashboard

### CU-018: Visualizar Dashboard en Tiempo Real
**Actor Principal:** Owner, Gerente  
**Precondiciones:** Usuario autenticado con permisos  
**Flujo Principal:**
1. El usuario accede al dashboard
2. El sistema consulta datos en tiempo real del parqueadero
3. El sistema calcula métricas:
   - Ocupación actual (% plazas ocupadas)
   - Plazas disponibles
   - Ingresos del día
   - Número de vehículos activos
   - Reservas activas
4. El sistema genera visualizaciones (gráficos, indicadores)
5. El sistema muestra el dashboard con actualización periódica

**Postcondiciones:** Usuario visualiza métricas operativas actuales

---

### CU-019: Generar Reporte de Ingresos
**Actor Principal:** Owner, Gerente  
**Precondiciones:** Transacciones registradas en el sistema  
**Flujo Principal:**
1. El usuario accede a la sección de reportes
2. El sistema solicita parámetros: rango de fechas, parqueadero
3. El usuario define los parámetros
4. El sistema consulta transacciones en el rango especificado
5. El sistema agrupa datos por fecha
6. El sistema calcula totales e indicadores
7. El sistema genera el reporte con:
   - Ingresos diarios
   - Ingresos totales del período
   - Número de transacciones
   - Ticket promedio
   - Métodos de pago utilizados
8. El sistema muestra vista previa del reporte
9. El usuario selecciona formato de exportación (CSV/PDF)
10. El sistema genera archivo descargable

**Postcondiciones:** Reporte generado y descargado

---

### CU-020: Generar Reporte de Ocupación
**Actor Principal:** Owner, Gerente  
**Precondiciones:** Datos históricos de ocupación disponibles  
**Flujo Principal:**
1. El usuario accede a reportes de ocupación
2. El sistema solicita parámetros: rango de fechas, parqueadero
3. El usuario define los parámetros
4. El sistema consulta registros de tickets en el período
5. El sistema calcula métricas:
   - Ocupación promedio por día
   - Horas pico
   - Tiempo promedio de estacionamiento
   - Rotación de plazas
6. El sistema genera visualizaciones
7. El usuario puede exportar en formato deseado

**Postcondiciones:** Reporte de ocupación generado

---

## 8. Módulo de API Pública

### CU-021: Consultar Disponibilidad via API
**Actor Principal:** Aplicación Externa (Cliente API)  
**Precondiciones:** API pública disponible, parqueadero configurado como público  
**Flujo Principal:**
1. El cliente realiza petición GET a `/api/v1/parkings/{id}/availability`
2. El sistema valida los parámetros: parking_id, from (fecha-hora), to (fecha-hora)
3. El sistema verifica que el parqueadero permita consultas públicas
4. El sistema invoca CU-013 (Consultar Disponibilidad)
5. El sistema formatea respuesta en JSON con:
   - Lista de plazas disponibles
   - Características de cada plaza
   - Información de tarifas
6. El sistema retorna HTTP 200 con el JSON

**Flujo Alternativo:**
- 2a. Parámetros inválidos: Retorna HTTP 400 con mensaje de error
- 3a. Parqueadero no público: Retorna HTTP 403
- 4a. Parqueadero no encontrado: Retorna HTTP 404

**Postcondiciones:** Cliente recibe información de disponibilidad

---

### CU-022: Autenticación API (Futuro)
**Actor Principal:** Aplicación Externa  
**Precondiciones:** Sistema de API keys implementado  
**Flujo Principal:**
1. El cliente incluye API key en header de la petición
2. El sistema valida la API key
3. El sistema verifica permisos asociados a la key
4. El sistema permite acceso al recurso solicitado

**Flujo Alternativo:**
- 2a. API key inválida: Retorna HTTP 401
- 3a. Permisos insuficientes: Retorna HTTP 403

**Postcondiciones:** Cliente autenticado y autorizado

---

## 9. Módulo de Gestión de Usuarios y Roles

### CU-023: Invitar Usuario con Rol
**Actor Principal:** Owner  
**Precondiciones:** Owner autenticado  
**Flujo Principal:**
1. El Owner accede a gestión de usuarios
2. El sistema muestra lista de usuarios actuales del tenant
3. El Owner selecciona "Invitar usuario"
4. El sistema solicita: email, rol (Gerente/Operador)
5. El Owner completa la información
6. El sistema valida el email
7. El sistema crea invitación con token único
8. El sistema envía email de invitación con link de activación
9. El sistema registra la invitación pendiente

**Flujo Alternativo:**
- 6a. Email ya existe en el tenant: El sistema notifica y sugiere editar rol
- 8a. Error al enviar email: El sistema notifica y permite reenviar

**Postcondiciones:** Invitación creada y enviada

---

### CU-024: Aceptar Invitación
**Actor Principal:** Usuario Invitado  
**Precondiciones:** Invitación válida recibida  
**Flujo Principal:**
1. El usuario hace clic en el link de invitación
2. El sistema valida el token de invitación
3. El sistema muestra formulario de registro/vinculación
4. El usuario completa contraseña y datos adicionales
5. El sistema crea/vincula la cuenta al tenant
6. El sistema asigna el rol especificado en la invitación
7. El sistema marca la invitación como aceptada
8. El sistema redirige al usuario al login o dashboard

**Flujo Alternativo:**
- 2a. Token inválido o expirado: El sistema notifica y ofrece solicitar nueva invitación

**Postcondiciones:** Usuario activo con rol asignado en el tenant

---

### CU-025: Modificar Rol de Usuario
**Actor Principal:** Owner  
**Precondiciones:** Usuario existente en el tenant  
**Flujo Principal:**
1. El Owner accede a gestión de usuarios
2. El sistema muestra lista de usuarios con sus roles
3. El Owner selecciona un usuario
4. El Owner modifica el rol del usuario
5. El sistema valida que no sea el único Owner (si aplica)
6. El sistema actualiza el rol
7. El sistema notifica al usuario afectado
8. El sistema registra el cambio en auditoría

**Flujo Alternativo:**
- 5a. Intento de remover último Owner: El sistema deniega la acción

**Postcondiciones:** Rol de usuario actualizado

---

### CU-026: Desactivar Usuario
**Actor Principal:** Owner  
**Precondiciones:** Usuario activo en el tenant  
**Flujo Principal:**
1. El Owner selecciona un usuario de la lista
2. El Owner selecciona "Desactivar usuario"
3. El sistema solicita confirmación
4. El Owner confirma
5. El sistema valida que no sea el único Owner
6. El sistema desactiva la cuenta del usuario
7. El sistema revoca sesiones activas
8. El sistema notifica al usuario

**Flujo Alternativo:**
- 5a. Intento de desactivar único Owner: El sistema deniega

**Postcondiciones:** Usuario desactivado, sin acceso al tenant

---

## 10. Casos de Uso Transversales

### CU-027: Auditar Acciones del Sistema
**Actor Principal:** Sistema  
**Precondiciones:** Acción significativa ejecutada  
**Flujo Principal:**
1. El sistema detecta una acción auditable (ej. crear parqueadero, check-out)
2. El sistema captura: usuario, acción, timestamp, datos relevantes
3. El sistema almacena el registro de auditoría
4. El registro queda disponible para consultas

**Postcondiciones:** Acción registrada en log de auditoría

---

### CU-028: Validar Permisos de Acceso
**Actor Principal:** Sistema  
**Precondiciones:** Usuario autenticado intenta realizar acción  
**Flujo Principal:**
1. El sistema recibe solicitud de acción del usuario
2. El sistema identifica el rol del usuario
3. El sistema consulta permisos del rol para la acción solicitada
4. El sistema verifica que la acción sea sobre recursos del mismo tenant
5. El sistema autoriza o deniega la acción
6. Si se deniega, el sistema retorna mensaje de error

**Postcondiciones:** Acción autorizada o denegada según permisos

---

## Resumen de Actores y Casos de Uso

### Actores Identificados:

| Actor | Casos de Uso |
|-------|--------------|
| **Usuario No Registrado** | CU-001 |
| **Usuario Registrado** | CU-002 |
| **Owner** | CU-003, CU-004, CU-005, CU-009, CU-018, CU-019, CU-020, CU-023, CU-025, CU-026 |
| **Gerente** | CU-005, CU-006, CU-007, CU-008, CU-018, CU-019, CU-020 |
| **Operador** | CU-008, CU-014, CU-015, CU-016 |
| **Conductor** | CU-011, CU-012, CU-013 |
| **Aplicación Externa** | CU-021, CU-022 |
| **Sistema** | CU-010, CU-017, CU-027, CU-028 |

### Resumen por Módulos:

| Módulo | Casos de Uso | Total |
|--------|--------------|-------|
| Autenticación y Multi-tenancy | CU-001, CU-002 | 2 |
| Gestión de Parqueaderos | CU-003, CU-004, CU-005 | 3 |
| Gestión de Plazas | CU-006, CU-007, CU-008 | 3 |
| Configuración de Tarifas | CU-009, CU-010 | 2 |
| Gestión de Reservas | CU-011, CU-012, CU-013 | 3 |
| Operaciones Check-in/Check-out | CU-014, CU-015, CU-016, CU-017 | 4 |
| Reportes y Dashboard | CU-018, CU-019, CU-020 | 3 |
| API Pública | CU-021, CU-022 | 2 |
| Gestión de Usuarios y Roles | CU-023, CU-024, CU-025, CU-026 | 4 |
| Transversales | CU-027, CU-028 | 2 |
| **TOTAL** | | **28** |

---

## Notas del Analista

### Observaciones Importantes:

1. **Multi-tenancy**: El sistema está diseñado con una arquitectura multi-inquilino donde cada Owner tiene su propio entorno aislado.

2. **Control de Acceso**: Se implementa un sistema de roles con tres niveles principales:
   - Owner: Control total sobre su tenant
   - Gerente: Gestión operativa y configuración
   - Operador: Operaciones diarias de check-in/check-out

3. **Prevención de Overbooking**: El sistema debe validar en tiempo real la disponibilidad de plazas para evitar dobles reservas.

4. **Trazabilidad**: Los casos de uso transversales (CU-027, CU-028) son críticos para mantener auditoría y seguridad en todas las operaciones.

5. **Integración Externa**: La API pública (Módulo 8) permite que terceros consulten disponibilidad, abriendo posibilidades de integración con aplicaciones de navegación o servicios de movilidad.

6. **Flujos Críticos**: Los casos de uso relacionados con check-in/check-out y cobros son los más críticos para la operación del negocio y requieren especial atención en la implementación.

### Recomendaciones:

- Implementar validaciones robustas en todos los puntos de entrada de datos
- Considerar mecanismos de recuperación ante fallos en procesos de pago
- Diseñar notificaciones push/email para eventos críticos (reservas, check-in, pagos)
- Evaluar la necesidad de un caso de uso para gestión de conflictos (plazas ocupadas más allá del tiempo reservado)
- Considerar casos de uso adicionales para mantenimiento de plazas (fuera de servicio, en reparación)

---

**Documento generado:** Octubre 2025  
**Versión:** 1.0  
**Proyecto:** Nivo - Sistema de Gestión de Parqueaderos Multi-inquilino