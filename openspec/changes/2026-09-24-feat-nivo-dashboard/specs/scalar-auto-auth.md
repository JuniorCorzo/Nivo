<!-- TAG: ADDED -->

# Delta Spec: Scalar Pre-Request Auto-Authentication Script

## Motivación

Probar la API interactiva en la interfaz de Scalar (`/scalar`) requiere actualmente autenticarse de manera manual enviando credenciales a `/api/v1/auth/login`, copiar el token de acceso JWT y pegarlo en el diálogo modal de seguridad Bearer. La automatización de este proceso agiliza las pruebas exploratorias del equipo de desarrollo, QA y evaluadores de producto sin degradar los estándares de seguridad.

## Requerimientos

### 1. Extensión OpenAPI / Hook de Configuración Scalar

1. **Configuración en Spring Boot**:
   - Enriquecer la configuración de Scalar (`application.yaml` y `SwaggerConfiguration.java`) inyectando el script hook de auto-autenticación pre-request.
   - Habilitar la directiva o script compatible con Scalar para la intercepción de peticiones salientes (`onBeforeRequest` / extensión `x-pre-request`).

### 2. Comportamiento del Script Pre-Request

#### Escenario: Primera petición interactiva protegida en Scalar

- **Dado** que un usuario abre la interfaz de documentación interactiva en `/scalar`
- **Y** no posee un token de acceso activo en el almacenamiento local de sesión (`localStorage` / `sessionStorage`)
- **Cuando** pulsa "Test Request" o "Send" sobre cualquier endpoint protegido con Bearer Authentication
- **Entonces** el script pre-request intercepta la llamada saliente antes de que llegue a la red
- **Y** envía una petición en segundo plano a `POST /api/v1/auth/login` con credenciales de prueba predefinidas (`demo@nivo.dev` / contraseña de entorno local)
- **Y** extrae el `accessToken` del JSON de respuesta
- **Y** lo almacena en la caché de sesión con su marca de expiración
- **Y** agrega la cabecera `Authorization: Bearer <token>` a la petición original antes de enviarla.

#### Escenario: Token existente y vigente

- **Dado** que ya existe un `accessToken` almacenado cuya vigencia no ha expirado
- **Cuando** se ejecuta cualquier petición en Scalar
- **Entonces** el script reutiliza el token existente e inyecta la cabecera `Authorization: Bearer <token>` de forma inmediata sin disparar una nueva petición de login.

#### Escenario: Fallo de autenticación o credenciales inválidas

- **Dado** que el servicio de autenticación responde con error 401 o 500 durante el auto-login
- **Cuando** falla la obtención del token
- **Entonces** el script muestra una notificación clara en la consola/interfaz de Scalar y permite al usuario ingresar su token manualmente en el diálogo habitual de Bearer Auth.

### 3. Seguridad y Entornos

- Las credenciales de demostración utilizadas por el script de auto-login deben ser parametrizables vía variables de entorno (`SCALAR_AUTO_AUTH_EMAIL`, `SCALAR_AUTO_AUTH_PASSWORD`).
- En entornos productivos estrictos, la propiedad `scalar.auto-auth.enabled` puede desactivarse (`false`) para no exponer credenciales automatizadas en la documentación.
