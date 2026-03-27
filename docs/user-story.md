# Historias de Usuario - Nivo

Este documento contiene las historias de usuario y sus criterios de aceptación para el proyecto Nivo, basados en el documento de requerimientos.

---

### HU-01: Registro y Login Multi-Inquilino

**Como** un nuevo Propietario, **quiero** registrarme en el sistema para crear mi propio entorno de parqueadero y empezar a gestionarlo, **para** poder utilizar la plataforma.

**Criterios de Aceptación (Gherkin):**
```gherkin
Feature: Registro e Inicio de Sesión

  Scenario: Registro de un nuevo propietario (inquilino)
    Given un usuario no está registrado en el sistema
    When completa el formulario de registro con email, contraseña y nombre de parqueadero
    Then se crea un nuevo inquilino y se almacena el usuario con rol de Owner.

  Scenario: Inicio de sesión de un usuario existente
    Given un usuario existente pertenece al parqueadero "Parqueadero Central"
    When inicia sesión con credenciales válidas
    Then accede al panel de control de ese parqueadero.

  Scenario: Intento de inicio de sesión con credenciales inválidas
    Given un usuario intenta iniciar sesión con credenciales inválidas
    When envía el formulario
    Then el sistema muestra un mensaje de error y no permite el acceso.
```

---

### HU-02: Gestión de Parqueaderos

**Como** Owner, **quiero** dar de alta, editar y listar mis parqueaderos, **para** poder configurar y administrar mis propiedades.

**Criterios de Aceptación (Gherkin):**
```gherkin
Feature: Gestión de Parqueaderos

  Scenario: Creación exitosa de un parqueadero por el Owner
    Given un Owner ha iniciado sesión
    When crea un nuevo parqueadero con nombre "Parking Sol" y ubicación "Calle Falsa 123"
    Then el sistema guarda el parqueadero y aparece en su lista de parqueaderos.

  Scenario: Edición de un parqueadero existente
    Given un parqueadero existe y el Owner edita su capacidad
    When guarda los cambios
    Then la información actualizada se refleja correctamente en los detalles del parqueadero.

  Scenario: Intento de creación por un rol no autorizado
    Given un Usuario con rol de Operador ha iniciado sesión
    When intenta crear un nuevo parqueadero
    Then el sistema deniega la acción por falta de permisos.
```

---

### HU-03: Gestión de Plazas/Slots

**Como** Owner o Gerente, **quiero** definir y gestionar las plazas de mi parqueadero, **para** organizar el espacio y asignar tipos de vehículos.

**Criterios de Aceptación (Gherkin):**
```gherkin
Feature: Gestión de Plazas

  Scenario: Agregar una nueva plaza a un parqueadero
    Given el Owner selecciona uno de sus parqueaderos
    When agrega una plaza con número "A-101" y tipo "Automóvil"
    Then se crea la plaza asociada y aparece en la lista de plazas del parqueadero.

  Scenario: Editar el tipo de una plaza existente
    Given la plaza "A-101" existe
    When el Owner edita el tipo de vehículo a "Moto"
    Then el cambio se guarda y se actualiza en la vista de plazas.

  Scenario: Intento de creación de plaza por rol no autorizado
    Given un Operador en sitio intenta crear una plaza nueva
    When envía la solicitud
    Then el sistema deniega la acción.
```

---

### HU-04: Configuración de Tarifas

**Como** Owner, **quiero** configurar las tarifas de estacionamiento para mi parqueadero con reglas específicas, **para** definir cómo se calcularán los cobros a los clientes.

**Criterios de Aceptación (Gherkin):**
```gherkin
Feature: Configuración de Tarifas

  Scenario: Definir una nueva tarifa por hora
    Given el Owner accede a la sección de tarifas de su parqueadero
    When define una tarifa de "10 USD por hora" y la guarda
    Then esta tarifa se asocia correctamente al parqueadero.

  Scenario: Cálculo de cobro basado en tarifa por hora
    Given una tarifa está definida como "10 USD por hora"
    When un vehículo entra a las 09:00 y sale a las 11:30
    Then el sistema calcula correctamente el cobro (e.g., 25 USD si se cobra por fracción).

  Scenario: Aplicar tarifas diferenciadas por zona
    Given se configuran tarifas diferentes para la "Zona VIP"
    When se registra un vehículo en una plaza de la "Zona VIP"
    Then el sistema aplica la tarifa correspondiente a esa zona para el cálculo del cobro.
```

---

### HU-05: Gestión de Reservas de Plaza

**Como** Conductor, **quiero** reservar una plaza para una fecha y hora futura y poder cancelarla, **para** asegurarme de tener un lugar disponible y tener flexibilidad.

**Criterios de Aceptación (Gherkin):**
```gherkin
Feature: Gestión de Reservas

  Scenario: Reserva exitosa de una plaza disponible
    Given un conductor logueado selecciona una fecha, hora de inicio y fin
    When elige una plaza disponible y confirma la reserva
    Then se crea una reserva vinculada a esa plaza y usuario, y la plaza queda marcada como "Reservada" en ese rango horario.

  Scenario: Intento de reserva en una plaza ya reservada (Overbooking)
    Given la plaza "B-05" ya está reservada de 09:00 a 11:00
    When otro usuario intenta reservar esa misma plaza de 10:00 a 12:00
    Then el sistema rechaza la acción para evitar el overbooking.

  Scenario: Cancelación de una reserva
    Given un usuario tiene una reserva activa para el futuro
    When cancela su reserva antes del tiempo límite establecido
    Then la plaza se libera y vuelve a estar disponible para ese horario.
```

---

### HU-06: Check-in de Vehículo

**Como** Operador, **quiero** registrar la entrada de un vehículo escaneando un QR o manualmente, **para** iniciar el proceso de estacionamiento y ocupar la plaza.

**Criterios de Aceptación (Gherkin):**
```gherkin
Feature: Check-in de Vehículo

  Scenario: Check-in con reserva y código QR
    Given un Operador en sitio recibe un vehículo con un código QR de reserva
    When escanea el QR de la reserva
    Then el sistema genera un ticket de entrada digital, lo asigna a la plaza reservada y registra la hora de entrada.

  Scenario: Check-in de un vehículo sin reserva
    Given un vehículo llega sin reserva previa
    When el Operador selecciona una plaza libre y confirma la entrada
    Then se genera un ticket asignado a esa plaza y el estado de la plaza cambia a "Ocupada".
```

---

### HU-07: Check-out y Cobro en Sitio

**Como** Operador, **quiero** registrar la salida de un vehículo, calcular el monto a pagar y procesar el pago, **para** completar el servicio y liberar la plaza.

**Criterios de Aceptación (Gherkin):**
```gherkin
Feature: Check-out y Cobro

  Scenario: Proceso de check-out y pago exitoso
    Given un ticket activo tiene una hora de entrada de 10:00 y una tarifa definida
    When el Operador registra la hora de salida a las 12:00
    Then el sistema calcula el monto a pagar, solicita la confirmación del pago, y al confirmar, cierra el ticket, libera la plaza y crea un registro de transacción.

  Scenario: Generación de recibo tras el pago
    Given se ha completado un pago de check-out
    When el sistema genera el recibo
    Then el recibo incluye el desglose de tiempo, la tarifa aplicada y el total pagado.

  Scenario: Intento de salida sin pago confirmado
    Given un ticket está abierto pero el pago no ha sido confirmado
    When se intenta registrar la salida del vehículo
    Then el sistema no permite cerrar el ticket ni liberar la plaza hasta que se confirme la transacción.
```

---

### HU-08: Dashboard y Reportes Operativos

**Como** Owner, **quiero** visualizar un dashboard con métricas en tiempo real y generar reportes de ingresos y ocupación, **para** analizar el desempeño de mi negocio.

**Criterios de Aceptación (Gherkin):**
```gherkin
Feature: Dashboard y Reportes

  Scenario: Visualización del dashboard en tiempo real
    Given existen datos de entradas y salidas de vehículos
    When el Owner consulta el dashboard de su parqueadero
    Then ve la ocupación actual (ej. "70% de plazas ocupadas") y los ingresos totales del día.

  Scenario: Exportación de reporte de ingresos
    Given un rango de fechas es seleccionado
    When se solicita exportar el reporte de ingresos
    Then el sistema genera un archivo (CSV/PDF) que contiene las fechas y los montos de ingresos diarios para ese período.
```

---

### HU-09: API Pública de Disponibilidad

**Como** desarrollador de una aplicación de terceros, **quiero** consultar la disponibilidad de plazas de un parqueadero a través de una API pública, **para** integrar esta información en mi propio servicio.

**Criterios de Aceptación (Gherkin):**
```gherkin
Feature: API Pública de Disponibilidad

  Scenario: Consultar disponibilidad en un horario específico
    Given el parqueadero "Parking Sol" tiene una reserva en la plaza "C-01" de 09:00 a 11:00
    When un cliente externo hace una petición GET a /api/v1/parkings/{id}/availability?from=10:00&to=11:00
    Then la respuesta de la API no incluye la plaza "C-01" en la lista de disponibles.

  Scenario: Consultar disponibilidad y recibir plazas libres
    Given la plaza "D-05" está libre en el rango horario consultado
    When se realiza la consulta a la API de disponibilidad
    Then la API retorna una respuesta HTTP 200 en formato JSON con la plaza "D-05" en la lista de disponibles.
```

---

### HU-10: Gestión de Usuarios Internos (Roles)

**Como** Owner, **quiero** invitar y asignar roles (Gerente, Operador) a miembros de mi equipo, **para** delegar responsabilidades en la gestión del parqueadero.

**Criterios de Aceptación (Gherkin):**
```gherkin
Feature: Gestión de Usuarios Internos

  Scenario: Asignación de un nuevo rol de Operador
    Given el Owner está en la sección de gestión de usuarios
    When agrega el correo de un nuevo miembro y le asigna el rol de "Operador"
    Then el sistema envía una invitación al correo y, una vez aceptada, el nuevo usuario puede iniciar sesión con los permisos de Operador.
```
