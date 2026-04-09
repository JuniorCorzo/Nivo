## ADDED Requirements

### Requirement: Formulario de login

El sistema SHALL presentar una pantalla de login con campos de email y contraseña que permita al usuario autenticarse en el sistema.

#### Scenario: Login exitoso

- **WHEN** el usuario ingresa credenciales válidas y envía el formulario
- **THEN** el sistema SHALL autenticar al usuario y redirigir al panel de control correspondiente a su parqueadero

#### Scenario: Credenciales inválidas

- **WHEN** el usuario envía credenciales incorrectas (email o contraseña erróneos)
- **THEN** el sistema SHALL mostrar el mensaje "Email o contraseña incorrectos" en el formulario, sin especificar cuál de los dos falló (por seguridad)

#### Scenario: Usuario no encontrado

- **WHEN** el usuario ingresa un email que no existe en el sistema
- **THEN** el sistema SHALL mostrar el mismo mensaje genérico "Email o contraseña incorrectos" (sin revelar que el email no existe)

#### Scenario: Campos vacíos al enviar

- **WHEN** el usuario intenta enviar el formulario con campos vacíos
- **THEN** el sistema SHALL mostrar "Este campo es requerido" debajo de cada campo vacío y bloquear el envío

#### Scenario: Error de red durante login

- **WHEN** el intento de login falla por error de red o servidor (5xx)
- **THEN** el sistema SHALL mostrar el mensaje "No se pudo conectar. Verificá tu conexión e intentá de nuevo."

### Requirement: Visibilidad de contraseña

El sistema SHALL permitir al usuario alternar la visibilidad del campo contraseña en el formulario de login.

#### Scenario: Mostrar contraseña

- **WHEN** el usuario hace clic en el ícono de visibilidad junto al campo contraseña
- **THEN** el sistema SHALL cambiar el tipo del input de `password` a `text`, revelando el contenido

#### Scenario: Ocultar contraseña

- **WHEN** el campo contraseña está en modo visible y el usuario hace clic en el ícono nuevamente
- **THEN** el sistema SHALL cambiar el tipo del input de `text` a `password`, ocultando el contenido

### Requirement: Estado de carga del login

El sistema SHALL indicar visualmente cuando el formulario de login está procesando la autenticación.

#### Scenario: Login en progreso

- **WHEN** el formulario es enviado y está esperando respuesta del servidor
- **THEN** el sistema SHALL deshabilitar todos los campos y mostrar un indicador de carga en el botón de login

### Requirement: Enlace a registro desde login

El sistema SHALL mostrar un enlace hacia la pantalla de registro para usuarios que no tienen cuenta.

#### Scenario: Navegación a registro

- **WHEN** el usuario hace clic en el enlace "Registrarse" en la pantalla de login
- **THEN** el sistema SHALL navegar a la pantalla de registro sin perder el email ingresado si ya había uno
