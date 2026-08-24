## ADDED Requirements

### Requirement: Almacenamiento seguro de tokens

El sistema SHALL almacenar el access token de forma segura en el cliente, preferentemente usando httpOnly cookies gestionadas por el servidor, para prevenir acceso desde JavaScript (XSS).

#### Scenario: Token recibido tras autenticación exitosa

- **WHEN** el servidor responde con un access token tras login o registro exitoso
- **THEN** el sistema SHALL almacenar el token de forma segura y actualizar el estado de autenticación en la aplicación

#### Scenario: Token no expuesto en JavaScript

- **WHEN** la sesión está activa
- **THEN** el token de acceso NO SHALL ser accesible desde `window`, `localStorage`, ni `sessionStorage`

### Requirement: Renovación automática de sesión (token refresh)

El sistema SHALL renovar automáticamente la sesión del usuario antes de que el access token expire, usando el refresh token, sin interrumpir la experiencia del usuario.

#### Scenario: Access token expirado con refresh token válido

- **WHEN** una petición falla con status 401 y existe un refresh token válido
- **THEN** el sistema SHALL intentar renovar el access token automáticamente y reintentar la petición original

#### Scenario: Refresh token expirado

- **WHEN** el intento de renovación falla porque el refresh token también expiró
- **THEN** el sistema SHALL invalidar la sesión local, limpiar el estado de autenticación y redirigir al usuario a la pantalla de login

#### Scenario: Múltiples requests fallando simultáneamente con 401

- **WHEN** múltiples peticiones fallan con 401 al mismo tiempo
- **THEN** el sistema SHALL realizar UN SOLO intento de refresh y resolver todas las peticiones pendientes con el nuevo token (sin múltiples refresh calls en paralelo)

### Requirement: Cierre de sesión

El sistema SHALL permitir al usuario cerrar su sesión de forma explícita, invalidando el estado de autenticación en el cliente.

#### Scenario: Logout exitoso

- **WHEN** el usuario hace clic en "Cerrar sesión"
- **THEN** el sistema SHALL limpiar el estado de autenticación, invalidar los tokens almacenados y redirigir a la pantalla de login

#### Scenario: Estado post-logout

- **WHEN** el usuario ha cerrado sesión
- **THEN** el sistema SHALL impedir el acceso a rutas protegidas y redirigir a login si el usuario intenta acceder directamente

### Requirement: Persistencia de sesión entre recargas

El sistema SHALL mantener la sesión del usuario activa al recargar la página, siempre que los tokens sigan siendo válidos.

#### Scenario: Recarga con sesión válida

- **WHEN** el usuario recarga la página o abre una nueva pestaña con una sesión activa
- **THEN** el sistema SHALL restaurar el estado de autenticación automáticamente sin solicitar login nuevamente

#### Scenario: Recarga con sesión expirada

- **WHEN** el usuario recarga la página con tokens expirados
- **THEN** el sistema SHALL redirigir al usuario a la pantalla de login
