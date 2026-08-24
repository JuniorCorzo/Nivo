## ADDED Requirements

### Requirement: Redirección automática post-autenticación

El sistema SHALL redirigir automáticamente al usuario al panel de control correspondiente inmediatamente después de una autenticación exitosa (login o registro), sin requerir acción adicional del usuario.

#### Scenario: Redirección tras login exitoso

- **WHEN** el usuario se autentica correctamente con credenciales válidas
- **THEN** el sistema SHALL navegar automáticamente a la ruta del panel de control (`/dashboard`) del parqueadero al que pertenece el usuario

#### Scenario: Redirección tras registro exitoso

- **WHEN** el usuario completa el registro de una nueva cuenta y parqueadero
- **THEN** el sistema SHALL navegar automáticamente al panel de control del nuevo parqueadero creado

#### Scenario: Usuario ya autenticado intenta acceder a login o registro

- **WHEN** un usuario con sesión activa navega a `/login` o `/register`
- **THEN** el sistema SHALL redirigir automáticamente al panel de control, sin mostrar el formulario de autenticación

### Requirement: Protección de rutas autenticadas

El sistema SHALL proteger las rutas del panel de control y otras rutas privadas, redirigiendo a los usuarios no autenticados a la pantalla de login.

#### Scenario: Acceso a ruta protegida sin sesión

- **WHEN** un usuario no autenticado intenta acceder a una ruta protegida (ej: `/dashboard`)
- **THEN** el sistema SHALL redirigir al usuario a `/login` y, tras la autenticación exitosa, SHALL redirigir de vuelta a la ruta original solicitada (deep link redirect)

#### Scenario: Deep link redirect tras login

- **WHEN** un usuario es redirigido a `/login` desde una ruta protegida y completa el login exitosamente
- **THEN** el sistema SHALL redirigir al usuario a la ruta originalmente solicitada, no al dashboard por defecto

### Requirement: Pantalla inicial del panel de control

El sistema SHALL presentar una pantalla de bienvenida básica al panel de control tras la autenticación, que confirme la identidad del usuario y el nombre del parqueadero.

#### Scenario: Panel de control cargado

- **WHEN** el usuario es redirigido al panel de control tras autenticarse
- **THEN** el sistema SHALL mostrar el nombre del parqueadero del usuario y una indicación visual de que la sesión está activa

#### Scenario: Información del parqueadero no disponible

- **WHEN** el usuario llega al panel pero los datos del parqueadero no han cargado aún
- **THEN** el sistema SHALL mostrar un estado de carga (skeleton o spinner) mientras los datos se obtienen
