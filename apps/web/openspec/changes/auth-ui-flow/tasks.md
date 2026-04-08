## 1. Configuración y estructura base

- [*] 1.2 Crear `AuthService` con Angular Signals (`signal`) para el estado de sesión (usuario autenticado, token)
- [*] 1.3 Definir los `FormGroup` + `Validators` de Angular Reactive Forms para registro y login
- [*] 1.4 Implementar validador personalizado (`ValidatorFn`) para "contraseñas coinciden"
- [*] 1.5 Configurar rutas para `/login`, `/register` y `/dashboard` en Angular Router

## 2. Formulario de registro

- [*] 2.1 Crear componente `RegisterComponent` con template Angular y Reactive Form (`FormGroup`)
- [*] 2.2 Conectar validaciones al template con `@if (form.get('email').hasError(...))` para mensajes inline
- [*] 2.3 Implementar validación en tiempo real (updateOn: 'change' + 'blur') en los controles del form
- [*] 2.4 Implementar estado de carga: deshabilitar form con `form.disable()` y mostrar spinner durante envío
- [*] 2.5 Conectar `RegisterComponent` con `AuthService` para llamar al endpoint de registro vía `HttpClient`
- [*] 2.6 Manejar error de email duplicado desde la API (setear error en el control con `setErrors()`)
- [*] 2.7 Manejar errores de red/servidor con mensaje global en el template

## 3. Formulario de login

- [*] 3.1 Crear componente `LoginComponent` con template Angular y Reactive Form (`FormGroup`)
- [*] 3.2 Conectar validaciones al template con mensajes de error inline por control
- [*] 3.3 Implementar toggle de visibilidad de contraseña (binding `[type]` dinámico en el input)
- [*] 3.4 Implementar estado de carga durante autenticación con `form.disable()`
- [*] 3.5 Conectar `LoginComponent` con `AuthService` para llamar al endpoint de login
- [*] 3.6 Mostrar mensaje de error genérico para credenciales inválidas (sin revelar cuál campo falló)
- [*] 3.7 Agregar enlace a la pantalla de registro con `routerLink`

## 4. Manejo de sesión y tokens

- [*] 4.1 Implementar almacenamiento seguro de tokens en `AuthService` (memoria vía Signal + httpOnly cookie para refresh)
- [*] 4.2 Crear `AuthInterceptor` (`HttpInterceptorFn`) para adjuntar el token en cada request
- [*] 4.3 Implementar lógica de refresh en el interceptor: detectar 401, renovar token y reintentar el request original
- [*] 4.4 Implementar cola de requests pendientes con RxJS (`Subject`) para evitar múltiples refresh simultáneos
- [*] 4.5 Manejar refresh token expirado: limpiar estado del `AuthService` y redirigir a `/login` con Angular Router
- [*] 4.6 Implementar función `logout()` en `AuthService`: limpiar Signals, invalidar tokens, navegar a `/login`
- [*] 4.7 Implementar restauración de sesión al iniciar la app (en `APP_INITIALIZER` o guard de root)

## 5. Redirección y protección de rutas

- [ ] 5.1 Crear functional guard `authGuard` (`CanActivateFn`) que redirige a `/login` si no hay sesión activa
- [ ] 5.2 Implementar deep link redirect: guardar la ruta solicitada con `ActivatedRouteSnapshot.url` y redirigir tras login
- [ ] 5.3 Crear functional guard `publicGuard` que redirige al `/dashboard` si el usuario ya está autenticado
- [ ] 5.4 Aplicar `authGuard` en las rutas del dashboard y `publicGuard` en `/login` y `/register`

## 6. Panel de control inicial

- [ ] 6.1 Crear componente `DashboardComponent` básico que muestra el nombre del parqueadero del usuario
- [ ] 6.2 Implementar estado de carga con `@if (isLoading())` / skeleton mientras se obtienen los datos
- [ ] 6.3 Agregar botón/opción de logout visible que llama a `AuthService.logout()`

## 7. Accesibilidad y calidad

- [ ] 7.1 Asociar mensajes de error con sus inputs via `aria-describedby` en los templates
- [ ] 7.2 Asegurar que todos los formularios son navegables por teclado (tab order correcto)
- [ ] 7.3 Agregar `aria-live="polite"` a los contenedores de mensajes de error para lectores de pantalla
- [ ] 7.4 Verificar contraste de colores en estados de error y carga (WCAG AA)
