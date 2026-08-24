## ADDED Requirements

### Requirement: Formulario de registro multi-inquilino

El sistema SHALL presentar un formulario de registro que permita a un nuevo propietario crear su cuenta y su parqueadero en una sola operación. El formulario SHALL incluir los campos: email, contraseña, confirmación de contraseña y nombre del parqueadero.

#### Scenario: Registro exitoso

- **WHEN** el usuario completa todos los campos válidos y envía el formulario
- **THEN** el sistema SHALL enviar la solicitud al endpoint de registro y redirigir al panel de control

#### Scenario: Email inválido

- **WHEN** el usuario ingresa un email con formato inválido
- **THEN** el sistema SHALL mostrar el mensaje "Ingresa un email válido" debajo del campo de email, en tiempo real (sin esperar envío)

#### Scenario: Contraseña insuficiente

- **WHEN** el usuario ingresa una contraseña con menos de 8 caracteres
- **THEN** el sistema SHALL mostrar el mensaje "La contraseña debe tener al menos 8 caracteres" debajo del campo contraseña

#### Scenario: Contraseñas no coinciden

- **WHEN** el campo confirmación de contraseña no coincide con el campo contraseña
- **THEN** el sistema SHALL mostrar el mensaje "Las contraseñas no coinciden" debajo del campo de confirmación

#### Scenario: Nombre de parqueadero vacío

- **WHEN** el usuario deja el campo nombre del parqueadero vacío e intenta enviar
- **THEN** el sistema SHALL mostrar el mensaje "El nombre del parqueadero es requerido" y bloquear el envío

#### Scenario: Email ya registrado

- **WHEN** el usuario envía el formulario con un email que ya existe en el sistema
- **THEN** el sistema SHALL mostrar el mensaje "Este email ya está registrado. ¿Querés iniciar sesión?" en el formulario, sin limpiar los campos

#### Scenario: Error de red durante registro

- **WHEN** el envío del formulario falla por error de red o servidor
- **THEN** el sistema SHALL mostrar el mensaje "Ocurrió un error. Por favor intentá de nuevo." y permitir reintentar

### Requirement: Validación en tiempo real

El sistema SHALL validar los campos del formulario de registro mientras el usuario escribe (on change) y también en blur (al perder el foco), para proporcionar feedback inmediato.

#### Scenario: Validación on-blur

- **WHEN** el usuario abandona un campo sin completarlo correctamente
- **THEN** el sistema SHALL mostrar el error correspondiente inmediatamente

#### Scenario: Corrección de error

- **WHEN** el usuario corrige un campo que tenía error
- **THEN** el sistema SHALL remover el mensaje de error en tiempo real

### Requirement: Estado de carga del formulario

El sistema SHALL indicar visualmente cuando el formulario está procesando el registro.

#### Scenario: Envío en progreso

- **WHEN** el formulario es enviado y está esperando respuesta del servidor
- **THEN** el sistema SHALL deshabilitar todos los campos e inputs y mostrar un indicador de carga en el botón de registro
