## Why

El sistema Nivo necesita una interfaz visual completa de autenticación para que los propietarios de parqueaderos puedan registrarse y acceder a su panel de control. Sin este flujo, la plataforma multi-inquilino (HU-01, ANC-13) no tiene una entrada funcional para los usuarios finales.

## What Changes

- Nuevo formulario de registro con validación en tiempo real (email, contraseña, nombre del parqueadero)
- Nueva pantalla de login con manejo de errores específicos por tipo de fallo
- Panel de control inicial post-autenticación con redirección según rol
- Manejo de sesiones en el cliente (almacenamiento y renovación de tokens)
- Componentes reutilizables para formularios de autenticación

## Capabilities

### New Capabilities

- `register-form`: Formulario de registro multi-inquilino con validaciones en tiempo real, campos de email, contraseña y nombre del parqueadero
- `login-form`: Pantalla de login con manejo de errores granular (credenciales inválidas, usuario no encontrado, etc.)
- `auth-session`: Manejo de sesiones en el cliente: almacenamiento seguro de tokens, renovación automática y cierre de sesión
- `dashboard-redirect`: Redirección automática al panel correspondiente según el rol del usuario autenticado

### Modified Capabilities

<!-- No hay specs existentes en este momento -->

## Impact

- **Código nuevo**: Componentes y módulos Angular en `apps/web/src/` para formularios y pantallas de autenticación
- **Estado**: Integración con un servicio de autenticación + Signals o BehaviorSubject para el estado de sesión
- **Routing**: Nuevas rutas para `/register`, `/login` y `/dashboard` con Angular Router
- **API**: Consumo de endpoints de autenticación del backend vía `HttpClient` (registro, login, refresh token)
- **Dependencias**: `@angular/forms` (Reactive Forms nativo) para validaciones — sin dependencias externas de formularios
- **Accesibilidad**: Formularios accesibles con ARIA labels, manejo de foco y mensajes de error asociados
