# <a name="header"></a><a name="content"></a><a name="x30718ff082a0108d986a8ec2aa37be4e6988d53"></a>Requerimientos del sistema de gestión de parqueaderos (SaaS multi-inquilino)
## <a name="resumen-ejecutivo"></a>Resumen ejecutivo
Se propone una plataforma web **SaaS multi-inquilino** para gestión de parqueaderos. Cada propietario (inquilino) administrará sus parqueaderos de forma independiente, con datos aislados según estándares *multitenant[\[1\]](https://adrianalonsodev.medium.com/enfoques-de-arquitectura-multitenant-para-aplicaciones-saas-cf210d6c2f10#:~:text=La%20arquitectura%20multitenant%20es%20una,de%20trabajo%20por%20cada%20organizaci%C3%B3n)*. El sistema cubre el registro y edición de parqueaderos y plazas, control de entradas/salidas (check-in/out con QR o ticket físico), reservas anticipadas con bloqueo de plazas, cobro en sitio de las tarifas definidas y generación de recibos digitales. Además ofrecerá **dashboard** y reportes de ocupación e ingresos. Se garantizará el **aislamiento de datos** entre inquilinos (cada dueño solo accede a su información)[\[2\]](https://frontegg.com/blog/saas-multitenancy#:~:text=Tenant%20Isolation%20Techniques). La plataforma será escalable y basada en la nube[\[3\]](https://parklio.com/es/software-de-aparcamiento/sistema-de-gestion-de-aparcamiento#:~:text=El%20sistema%20de%20gesti%C3%B3n%20de,y%20un%20control%20remoto%20fiable), con interfaces web/móviles y API públicas (p.ej. consulta de disponibilidad). Se integrará con hardware estándar (tickets con QR, barreras, sensores, etc.)[\[4\]](https://parklio.com/es/software-de-aparcamiento/sistema-de-gestion-de-aparcamiento#:~:text=,Soporta%20pagos%20sin%20contacto)[\[5\]](https://parklio.com/es/software-de-aparcamiento/sistema-de-gestion-de-aparcamiento#:~:text=PMS%20es%20compatible%20con%20sus,inteligente%20de%20gesti%C3%B3n%20de%20estacionamiento). No se incluyen funciones de suscripción premium ni módulos de marketing o CRM en esta etapa.
## <a name="actores-roles"></a>Actores / Roles
- **Superadministrador:** Usuario global del sistema. Crea inquilinos (propietarios), gestiona suscripciones de usuarios, configura parámetros globales y visualiza datos consolidados.
- **Propietario (Owner) de parqueadero:** Dueño/administrador de uno o varios parqueaderos. Configura parques, plazas y tarifas; gestiona gerentes y operadores de su organización; visualiza reportes e ingresos.
- **Gerente:** Miembro del equipo del propietario. Tiene permisos similares al dueño para operaciones diarias (no crea nuevos parqueaderos). Puede asignar operadores y consultar reportes.
- **Operador en sitio:** Trabaja en el parqueadero. Registra check-in y check-out de vehículos, valida tickets/QR y procesa pagos en terminal. Solo ve la información del parqueadero asignado.
- **Usuario conductor (Cliente):** Usuario final que busca estacionamiento. Puede registrarse en el sistema, consultar disponibilidad, hacer reservas, entrar/salir con QR o ticket y realizar pagos.
- **Auditor:** Rol de solo lectura, asignado para revisar y auditar transacciones, logs y reportes de uno o varios parqueaderos. No realiza modificaciones operativas.
- **Integrador de hardware:** Técnico encargado de instalar y configurar dispositivos (sensores de ocupación, barreras, cámaras ANPR, terminales de pago). Se conecta al backend para habilitar la integración física con el sistema.
- **Proveedor de pagos:** Sistema o servicio externo de pagos que se integra vía API (p.ej. Stripe, PayPal o proveedores locales). Procesa transacciones y notifica al sistema el resultado.

Se empleará control de acceso basado en roles (RBAC) por inquilino[\[6\]](https://blog.logto.io/es/build-multi-tenant-saas-application#:~:text=En%20una%20arquitectura%20multi,pueden%20realizar%20en%20recursos%20particulares). Cada usuario solo dispondrá de los permisos adecuados a su rol dentro de su parqueadero. Por ejemplo, la plataforma permitirá asignar a usuarios roles de superadmin, admin o operador[\[7\]](https://parklio.com/es/software-de-aparcamiento/sistema-de-gestion-de-aparcamiento#:~:text=Al%20asignar%20responsabilidades%20de%20superadministrador%2C,adapte%20a%20todas%20tus%20necesidades), garantizando que acciones sensibles (como borrar datos o ajustar tarifas) queden reservadas a administradores autorizados[\[6\]](https://blog.logto.io/es/build-multi-tenant-saas-application#:~:text=En%20una%20arquitectura%20multi,pueden%20realizar%20en%20recursos%20particulares)[\[7\]](https://parklio.com/es/software-de-aparcamiento/sistema-de-gestion-de-aparcamiento#:~:text=Al%20asignar%20responsabilidades%20de%20superadministrador%2C,adapte%20a%20todas%20tus%20necesidades).
## <a name="alcance"></a>Alcance
**Cubre:** Registro y login multi-inquilino; gestión de parqueaderos y plazas (alta/edición); configuración de tarifas por periodo/vehículo; control de entradas/salidas (QR o ticket); reservas anticipadas con bloqueo de plaza; cobro básico al salir y registro de transacciones; dashboard operativo de ocupación e ingresos; reportes clave (ocupación diaria, ingresos); API pública de consulta de disponibilidad; integración con hardware estándar (terminales de pago, barreras, sensores, cámaras). También incluye características de seguridad (autenticación, permisos) y operación offline mínima (los terminales locales almacenan eventos para sincronizar luego).

**No cubre:** Módulos de suscripción/pago recurrente, programas de fidelización, marketing/CRM, facturación fiscal avanzada, analítica predictiva, ni otras funciones no esenciales. Tampoco se abordan extensiones de negocio fuera de la gestión operativa (p.ej. alianzas publicitarias). Este MVP se centra en las funciones operativas indispensables.
## <a name="modelo-de-multitenancy"></a>Modelo de multitenancy
La aplicación se diseñará como SaaS multitenant: una sola instancia de la aplicación servirá a múltiples organizaciones, separando los datos por inquilino[\[1\]](https://adrianalonsodev.medium.com/enfoques-de-arquitectura-multitenant-para-aplicaciones-saas-cf210d6c2f10#:~:text=La%20arquitectura%20multitenant%20es%20una,de%20trabajo%20por%20cada%20organizaci%C3%B3n). Cada parqueadero/dueño actúa como un “tenant” independiente. Según la literatura, existen tres enfoques comunes para la capa de datos multitenant: base de datos separada por cliente, un esquema distinto en la misma base de datos, o un esquema compartido con diferenciación por inquilino[\[8\]](https://adrianalonsodev.medium.com/enfoques-de-arquitectura-multitenant-para-aplicaciones-saas-cf210d6c2f10#:~:text=,la%20misma%20base%20de%20datos). En este proyecto se adoptará un modelo con **datos lógicamente compartidos** y un campo *tenant\_id* en las tablas, que identifica al dueño. Esto permite aislar la información en el mismo esquema y facilita el despliegue, manteniendo la confidencialidad entre clientes[\[2\]](https://frontegg.com/blog/saas-multitenancy#:~:text=Tenant%20Isolation%20Techniques)[\[8\]](https://adrianalonsodev.medium.com/enfoques-de-arquitectura-multitenant-para-aplicaciones-saas-cf210d6c2f10#:~:text=,la%20misma%20base%20de%20datos). (Opcionalmente, si se requiere mayor seguridad por cliente, se podría optar por esquemas separados o instancias dedicadas). El aislamiento es crítico: cada dueño solo podrá consultar/editar los datos asociados a su parqueadero[\[2\]](https://frontegg.com/blog/saas-multitenancy#:~:text=Tenant%20Isolation%20Techniques)[\[9\]](https://adrianalonsodev.medium.com/enfoques-de-arquitectura-multitenant-para-aplicaciones-saas-cf210d6c2f10#:~:text=Una%20base%20de%20datos%20para,cada%20organizaci%C3%B3n).
## <a name="requisitos-funcionales"></a>Requisitos funcionales
1. **RF-001: Registro e inicio de sesión multi-inquilino**
1. **Descripción:** Permitir crear nuevas cuentas de propietarios (inquilinos) y usuarios. Al registrar un nuevo dueño, se crea automáticamente su entorno (parqueadero). El login debe autenticar usuarios y dirigirlos al dashboard de su parqueadero.
1. **Prioridad:** M
1. **Dependencias:** Ninguna
1. **Criterios de aceptación (Gherkin):**
   - Dado que *un usuario* no está registrado en el sistema, cuando completa el formulario de registro con email, contraseña y nombre de parqueadero, entonces se crea un nuevo inquilino y se almacena el usuario con rol de Owner[\[6\]](https://blog.logto.io/es/build-multi-tenant-saas-application#:~:text=En%20una%20arquitectura%20multi,pueden%20realizar%20en%20recursos%20particulares).
   - Dado que *un usuario existente* pertenece al parqueadero X, cuando inicia sesión con credenciales válidas, entonces accede al panel de control de ese parqueadero.
   - Dado que un usuario intenta iniciar sesión con credenciales inválidas, cuando envía el formulario, entonces el sistema muestra un mensaje de error y no permite el acceso.
1. **RF-002: Gestión de parqueaderos**
1. **Descripción:** Permitir al Owner crear, editar y listar sus parqueaderos. Un parqueadero incluye nombre, dirección, zonas/áreas y configuración básica (moneda, horario). Solo el Owner (o Superadmin) puede modificar sus parques.
1. **Prioridad:** M
1. **Dependencias:** RF-001 (login, Owner)
1. **Criterios de aceptación (Gherkin):**
   - Dado que un *Owner* ha iniciado sesión, cuando crea un nuevo parqueadero con nombre y ubicación válidos, entonces el sistema guarda el parqueadero y aparece en su lista.
   - Dado que un parqueadero existe y el Owner edita sus datos (p.ej. cambia capacidad), cuando guarda los cambios, entonces la información actualizada se refleja correctamente.
   - Dado que un Usuario sin rol Owner (p.ej. Operador) intenta crear un parqueadero, cuando lo solicita, entonces el sistema deniega la acción por falta de permisos.
1. **RF-003: Gestión de plazas/slots**
1. **Descripción:** Permitir al Owner o Gerente definir las plazas de cada parqueadero: cada plaza tiene un número o identificador, zona (si aplica), tipo de vehículo (autos, motos, discapacitado, EV), y estado inicial (libre). Se listan todas las plazas con su estado.
1. **Prioridad:** M
1. **Dependencias:** RF-002 (parqueadero activo)
1. **Criterios de aceptación (Gherkin):**
   - Dado que el Owner selecciona un parqueadero, cuando agrega una plaza con número 101 y tipo “Automóvil”, entonces se crea la plaza asociada y aparece en la tabla de plazas.
   - Dado que la plaza 101 existe, cuando el Owner edita el tipo de vehículo a “Motos”, entonces el cambio se guarda y se actualiza en la vista de plazas.
   - Dado que un Operador en sitio intenta crear una plaza nueva, entonces el sistema deniega la acción (sólo Owner/Gerente pueden).
1. **RF-004: Configuración de tarifas**
1. **Descripción:** Permitir configurar tarifas de estacionamiento por parqueadero. Cada tarifa tiene descripción, valor y unidad de tiempo (p.ej. X por minuto o por hora), con posibles reglas especiales (precio mínimo, recargos por tipo de vehículo o zona).
1. **Prioridad:** M
1. **Dependencias:** RF-002 (parqueadero definido)
1. **Criterios de aceptación (Gherkin):**
   - Dado que el Owner accede a la sección de tarifas, cuando define una tarifa de “10 USD por hora” y guarda, entonces esta tarifa se asocia al parqueadero.
   - Dado una tarifa definida como 10 USD/hora, cuando un vehículo entra a las 9:00 y sale a las 11:30, entonces el sistema calcula correctamente el cobro (20 USD + fracción proporcional) según las reglas definidas.
   - Dado que se configuran tarifas diferentes por zona o tipo de vehículo, cuando se registra un vehículo en una plaza de zona A, entonces se aplica la tarifa correspondiente a esa zona[\[10\]](https://parklio.com/es/software-de-aparcamiento/sistema-de-gestion-de-aparcamiento#:~:text=Establece%20diferentes%20tarifas%20para%20distintas,adapten%20a%20tus%20necesidades%20espec%C3%ADficas).
1. **RF-005: Check-in de vehículo**
1. **Descripción:** Permitir registrar la entrada de un vehículo de forma presencial. El Operador escanea un código QR (de reserva) o introduce datos (placa) para generar un ticket de ingreso digital. El sistema registra hora de entrada y marca la plaza como ocupada.
1. **Prioridad:** M
1. **Dependencias:** RF-003, RF-007 (plazas y reservas disponibles)
1. **Criterios de aceptación (Gherkin):**
   - Dado que un *Operador en sitio* recibe un vehículo reservado con código QR, cuando escanea el QR de la reserva, entonces el sistema genera un ticket de entrada digital asignado a esa plaza y registra la hora de entrada.
   - Dado que un vehículo llega sin reserva, cuando el Operador selecciona una plaza libre y confirma entrada, entonces se genera un ticket asignado a esa plaza y la marca cambia a ocupada.
   - Dado que un vehículo entra, entonces ninguna otra reserva podrá bloquear esa misma plaza al mismo tiempo (evita overbooking).
1. **RF-006: Check-out y cobro en sitio**
1. **Descripción:** Permitir registrar la salida del vehículo y procesar el pago al final de la estadía. El Operador (o el usuario en un terminal de pago) verifica el ticket, calcula el monto según tarifa y tiempo acumulado, registra el pago y libera la plaza. Se genera un registro de transacción.
1. **Prioridad:** M
1. **Dependencias:** RF-005 (ticket de entrada)
1. **Criterios de aceptación (Gherkin):**
   - Dado un *ticket activo* con hora de entrada 10:00 y tarifa definida, cuando el Operador registra la hora de salida a las 12:00, entonces el sistema calcula el monto (ej. 20 USD) y solicita confirmación de pago. Al confirmar el pago, el ticket se cierra, se libera la plaza y se crea una transacción de 20 USD.
   - Dado que se completó el pago, cuando el sistema genera el recibo, entonces incluye el desglose de horas y el total pagado.
   - Dado un ticket abierto sin pago, el sistema no debe permitir la salida hasta que se confirme la transacción.
1. **RF-007: Reserva anticipada de plaza**
1. **Descripción:** Permitir a un Usuario conductor hacer reservas de plaza para una fecha y rango horario futuros. Al reservar, se bloquea la plaza seleccionada para ese intervalo. No se permiten reservas concurrentes que solapen la misma plaza.
1. **Prioridad:** M
1. **Dependencias:** RF-001 (usuario), RF-003 (plazas)
1. **Criterios de aceptación (Gherkin):**
   - Dado que un *conductor logueado* selecciona una fecha y hora de inicio y fin, cuando elige una plaza disponible y confirma la reserva, entonces se crea una reserva vinculada a esa plaza y usuario, y la plaza queda marcada como reservada en ese rango.
   - Dado que la plaza 10 ya está reservada de 9:00 a 11:00, cuando otro usuario intenta reservar esa plaza de 10:00 a 12:00, entonces el sistema rechaza la acción (evita overbooking).
   - Dado que un usuario cancela su reserva antes de tiempo límite, cuando la cancela en la app, entonces la plaza se libera nuevamente para esos horarios.
1. **RF-008: Registro de transacciones**
1. **Descripción:** Registrar todas las transacciones de pago realizadas en el sistema (cobros por estacionamiento). Cada transacción enlaza el ticket (o reserva) con el pago, indicando monto, fecha, método y estado (exitoso/rechazado).
1. **Prioridad:** M
1. **Dependencias:** RF-006 (cobro en check-out)
1. **Criterios de aceptación (Gherkin):**
   - Dado que se realiza un pago de X USD en el check-out, cuando la pasarela de pagos confirma la transacción, entonces el sistema crea un registro con monto X, fecha actual y marca “completada”.
   - Dado que una pasarela devuelve error en el pago, cuando se recibe esta respuesta, entonces la transacción queda marcada como “fallida” y no se libera la plaza hasta nuevo intento.
1. **RF-009: Dashboard y reportes operativos**
1. **Descripción:** Proveer visualizaciones de indicadores clave para cada parqueadero. Incluye un panel con métricas en tiempo real (ocupación actual, plazas libres, ingresos del día) y reportes exportables (CSV/PDF) de ocupación diaria, ingresos por periodo, estancia promedio, reservas y tickets perdidos.
1. **Prioridad:** M
1. **Dependencias:** RF-005 a RF-008 (datos de operaciones)
1. **Criterios de aceptación (Gherkin):**
   - Dado que hay datos de entradas/salidas, cuando el Owner consulta el dashboard, entonces ve la ocupación actual (p.ej. “70% plazas ocupadas”) y las estadísticas del día (vehículos entrados, ingresos totales).
   - Dado que se han emitido tickets perdidos hoy, al generar el reporte diario, entonces el informe incluye el total de tickets perdidos y el ingreso asociado.
   - Dado un rango de fechas, cuando se exporta el reporte de ingresos, entonces el archivo contiene fechas y montos diarios de esos ingresos.
1. **RF-010: API pública de disponibilidad**
   - **Descripción:** Exponer un endpoint público (sin autenticación) que permita consultar plazas disponibles de un parqueadero para un horario específico. Ideal para integrarse en apps de terceros o sitios web.
   - **Prioridad:** M
   - **Dependencias:** RF-003, RF-007 (plazas y reservas)
   - **Criterios de aceptación (Gherkin):**
   - Dado que el parqueadero 5 tiene una reserva en la plaza 12 de 9:00 a 11:00, cuando un cliente hace GET /api/v1/parkings/5/availability?from=10:00&to=11:00, entonces la plaza 12 no aparece en los disponibles.
   - Dado que la plaza 15 está libre en el rango consultado, entonces la API retorna la plaza 15 en la lista de disponibles con respuesta HTTP 200 y formato JSON.
   - Dado que la solicitud incluye parámetros inválidos (fecha/hora erróneas), cuando se realiza, entonces la API responde con error 400 indicando el problema.

1. **RF-011: Gestión de invitaciones y roles de usuario interno**
   - **Descripción:** Permitir al Owner invitar a nuevos colaboradores a su organización vinculados a un rol operativo (`MANAGER`, `OPERATOR`, `AUDITOR`). El sistema genera un token seguro de invitación con vigencia de 3 días y despacha una notificación por correo. El invitado activa su cuenta completando sus credenciales. El Owner puede modificar roles de colaboradores existentes o desactivar usuarios garantizando que nunca se desactive ni degrade al último Owner del tenant.
   - **Prioridad:** M
   - **Dependencias:** RF-001 (tenant y autenticación)
   - **Criterios de aceptación (Gherkin):**
     - Dado que un *Owner* autenticado invita al correo `operador@parqueadero.com` con rol `OPERATOR`, cuando envía la solicitud, entonces el sistema genera una invitación con estado `PENDING`, expiración en 72 horas y despacha el correo de invitación.
     - Dado que el correo `operador@parqueadero.com` ya pertenece al tenant activo, cuando el Owner intenta invitarlo nuevamente, entonces el sistema rechaza la solicitud con error `UserAlreadyExistsInTenantException` (HTTP 409).
     - Dado que el Owner intenta asignar un rol no permitido para invitaciones externas (`OWNER` o `SUPERADMIN`), cuando envía la invitación, entonces el sistema rechaza la acción con `InvalidRoleException` (HTTP 400).
     - Dado que un invitado accede con un token válido y no expirado, cuando confirma su contraseña y datos personales, entonces el sistema activa su usuario con el rol asignado, marca la invitación como `ACCEPTED` y permite su inicio de sesión en el tenant.
     - Dado que el tenant cuenta con 1 solo usuario con rol `OWNER`, cuando se intenta desactivar o degradar su rol a `OPERATOR`, entonces el sistema bloquea la operación para prevenir orfandad administrativa del tenant.

1. **RF-012: Check-in y comprobante digital para vehículos sin placa**
   - **Descripción:** Permitir el registro de entrada de vehículos que carecen de matrícula física visible (ej. motocicletas nuevas o de concesionario). La taquilla permite conmutar la modalidad a "Sin Placa (Foto)", exigiendo obligatoriamente una captura fotográfica del vehículo. El backend asigna un identificador secuencial sintético único por sede (`SP-xxxx`), genera el ticket y expone un enlace/QR a una vista pública de comprobante digital (`/public-ticket/:id`) que muestra la foto, hora y tarifas, permitiendo además registrar el teléfono del conductor para compartir el comprobante vía WhatsApp.
   - **Prioridad:** M
   - **Dependencias:** RF-003, RF-005 (cupos y check-in)
   - **Criterios de aceptación (Gherkin):**
     - Dado que el Operador registra un vehículo seleccionando la modalidad "Sin Placa", cuando adjunta una fotografía válida y confirma el ingreso, entonces el sistema genera un código secuencial único (`SP-1001`), registra la foto, marca el cupo como `OCCUPIED` y emite el ticket digital.
     - Dado que el Operador intenta registrar un vehículo en modalidad "Sin Placa" sin adjuntar fotografía, cuando confirma la operación, entonces el sistema bloquea el registro con `UnplatedVehiclePhotoRequiredException` (HTTP 422).
     - Dado un ticket emitido para vehículo sin placa, cuando el conductor o el operario abre el enlace público `/public-ticket/{ticketId}`, entonces el sistema muestra la vista pública sanitizada con la fotografía del vehículo, placa sintética `SP-xxxx`, plaza asignada, fecha de ingreso y desglose de tarifas vigentes, sin exponer datos privados de otros usuarios ni del tenant.
     - Dado que el Operador ingresa un número de teléfono en el check-in sin placa, cuando se emite el ticket, el sistema genera el enlace directo de WhatsApp con el URL público del comprobante listo para despacho.

## <a name="requisitos-no-funcionales"></a>Requisitos no funcionales
- **Seguridad:** Uso de HTTPS/TLS en todas las comunicaciones. Almacenamiento de contraseñas con hash seguro. Autenticación robusta con token JWT (OAuth2/Bearer). Soporte de MFA opcional. Encriptación de datos sensibles (datos personales, credenciales) en la base. Control de acceso estricto por rol e inquilino[\[6\]](https://blog.logto.io/es/build-multi-tenant-saas-application#:~:text=En%20una%20arquitectura%20multi,pueden%20realizar%20en%20recursos%20particulares). Cumplimiento con GDPR/local (posibilidad de borrar datos de usuario, consentimiento de datos, etc).
- **Rendimiento:** Respuesta de interfaz < 1s en operaciones típicas. El sistema debe soportar picos de concurrencia (varios autos entrando al mismo tiempo) sin degradar la experiencia.
- **Disponibilidad (SLA):** Objetivo ~99.9% uptime para los servicios críticos. Mantenimiento planificado fuera de horas pico. Mecanismos de monitorización y alertas.
- **Escalabilidad:** Arquitectura en la nube escalable horizontalmente[\[3\]](https://parklio.com/es/software-de-aparcamiento/sistema-de-gestion-de-aparcamiento#:~:text=El%20sistema%20de%20gesti%C3%B3n%20de,y%20un%20control%20remoto%20fiable). Debe ser posible agregar recursos (instancias web, DB) según crece el número de parqueaderos.
- **Accesibilidad y localización:** Interfaz responsiva para escritorio y móvil[\[11\]](https://parklio.com/es/software-de-aparcamiento/sistema-de-gestion-de-aparcamiento#:~:text=%C2%BFPuedo%20usarlo%20en%20mi%20tel%C3%A9fono,m%C3%B3vil). Cumplimiento de estándares de accesibilidad (WCAG). Soporte multi-idioma (min. español e inglés) y configuración regional (formato de fecha/hora, moneda local).
- **Respaldo/retención de datos:** Copias de seguridad diarias de la base de datos. Políticas de retención: mantener registros operativos (entradas/salidas, transacciones) por al menos 2–5 años (según regulación local).
- **Fiabilidad:** Tolerancia a fallos con reintentos automáticos en integraciones críticas (pago, email). Operación local en modo offline: los terminales de acceso/barra funcionarán con conexión intermitente y sincronizarán al restablecerse la red.
- **Otros:** El sistema será *cloud-native*, operativo sobre navegadores modernos sin necesidad de instalar software. Debe funcionar en modo offline limitado (p.ej. dispositivos locales solo requieren conexión para sincronizar registros, pero registro de entrada/salida básico debe continuar operando).
## <a name="integraciones-y-hardware-soportado"></a>Integraciones y hardware soportado
- **APIs de pago:** Se integrará con pasarelas de pago (p.ej. Stripe, PayPal u otros proveedores locales) mediante sus APIs REST. El sistema debe permitir configurar claves API y webhooks para validar pagos. *Nivel de integración:* API abierta estándar (no plugin).
- **Lectores QR / Tickets:** Se soportarán lectores de códigos de barras/QR en los terminales de entrada/salida. Por ejemplo, máquinas de tickets con escáner QR incorporado[\[4\]](https://parklio.com/es/software-de-aparcamiento/sistema-de-gestion-de-aparcamiento#:~:text=,Soporta%20pagos%20sin%20contacto) permiten leer reservas y validar entradas. También se podrán imprimir tickets con QR desde la app. *Integración:* APIs de control del dispositivo o plugin del lector, según hardware disponible.
- **Barreras automáticas:** Integración con el controlador de barreras para apertura remota. El sistema será compatible con módulos inteligentes (p.ej. **Parklio Brain**) que se conectan a las barreras existentes[\[5\]](https://parklio.com/es/software-de-aparcamiento/sistema-de-gestion-de-aparcamiento#:~:text=PMS%20es%20compatible%20con%20sus,inteligente%20de%20gesti%C3%B3n%20de%20estacionamiento). *Nivel:* Módulo intermedio (setup físico con API de barrera). En algunos casos puede requerirse desarrollo de PoC para controladores específicos.
- **Sensores de ocupación:** Soporte para sensores de plazas (ultrasónicos, magnéticos, etc.) que informan la ocupación en tiempo real. Estos sensores se conectarán vía API local o API cloud para actualizar el estado de cada plaza automáticamente. *Nivel:* Se prevé integración con API estándar de proveedores o mediante módulos IoT personalizados (se deberá evaluar por PoC con el proveedor de sensores elegido).
- **Cámaras / ALPR:** Permite cámaras con reconocimiento automático de matrículas (ANPR) para registrar entradas/salidas sin intervención manual. Se integrará mediante API del software de cámara o SDK (p.ej. enviar imágenes a un servicio ANPR). El sistema admite cámaras ANPR con hasta 6 unidades[\[12\]](https://parklio.com/es/software-de-aparcamiento/sistema-de-gestion-de-aparcamiento#:~:text=,Identificaci%C3%B3n%20de%20veh%C3%ADculos%20ANPR%20integrada). *Nivel:* Plugin de proveedor ANPR o servicio web (PoC requerido).
- **Terminales de pago y otros dispositivos:** Ejemplo: terminal de pago de salida que autoriza apertura de barrera tras pago[\[13\]](https://parklio.com/es/software-de-aparcamiento/sistema-de-gestion-de-aparcamiento#:~:text=,Acepta%20diversos%20m%C3%A9todos%20de%20pago). Estos dispositivos se integrarán vía API (Webhooks) o directamente se marcarán como pagos manuales en el sistema.
- En resumen, se emplearán APIs REST para pagos, protocolos estándar para lectores/BX, plugins o PoC para hardware especializado (sensores, cámaras). El integrador de hardware trabajará junto a los proveedores para habilitar estas conexiones.
## <a name="modelo-de-datos-básico-entidades-clave"></a>Modelo de datos básico / Entidades clave
- **Parqueadero:**
  - id
  - nombre
  - dirección completa
  - capacidad total
  - dueño/propietario (referencia a Owner)
  - zona horaria
  - moneda por defecto
  - horario de operación
  - atributos adicionales (ej. coordenadas)
- **Plaza (Slot):**
  - id
  - parqueadero_id
  - número o código interno
  - tipo de plaza (auto, moto, discapacitado, EV, etc.)
  - zona/área
  - estado actual (libre, reservada, ocupada)
  - posición en mapa (opcional)
  - sensor asociada (opcional)
- **Tarifa:**
  - id
  - parqueadero_id
  - descripción
  - precio por unidad de tiempo (por minuto, hora)
  - tiempo mínimo cobrado
  - unidad de tiempo base
  - vehículo_tipo (si aplica)
  - horario de vigencia (p.ej. tarifas diferentes por día de la semana)
  - políticas especiales (first free minutes, tarifa diaria máxima, etc.)
- **Reserva:**
  - id
  - plaza_id
  - usuario_id (conductor)
  - inicio_datetime
  - fin_datetime
  - estado (activa, cancelada, finalizada)
  - fecha de creación
  - método de pago (si se preautoriza un pago) o código de reserva
- **Ticket de estacionamiento:**
  - id
  - plaza_id
  - licencia_vehículo
  - usuario_id (cliente, opcional)
  - hora_entrada
  - hora_salida
  - reserva_id (si vino de reserva)
  - tarifa_aplicada
  - total_a_cobrar
  - estado (abierto, cerrado)
  - método_pago
  - referencia_transacción
- **Usuario:**
  - id
  - nombre completo
  - correo electrónico
  - contraseña (hash)
  - rol (Owner, Manager, Operador, Conductor, Auditor)
  - parqueadero_id (para roles internos)
  - datos de contacto
  - fecha de creación
- **Transacción:**
  - id
  - ticket_id o reserva_id
  - fecha
  - monto
  - método de pago (tarjeta, efectivo, etc.)
  - estado (éxito, fallida)
  - detalles del proveedor de pagos (por ej. ID de transacción externa)
- **RegistroEntradaSalida:** (opcional, relacionado con Ticket)
  - id
  - ticket_id
  - hora_entrada
  - hora_salida
  - lugar de registro (p.ej. terminal identificador)
  - notas (pérdida de ticket, incidente)
- **Propietario (Owner):**
  - id
  - nombre de empresa o persona
  - datos de contacto
  - email
  - fecha de registro
  - estado activo/inactivo
  - configuración del parqueadero (p.ej. branding, límites de usuarios)
  - *(En la práctica, Owner es un Usuario con rol Owner más campos de organización.)*
## <a name="reglas-de-negocio-críticas"></a>Reglas de negocio críticas
- **Tarificación por fracción de tiempo:** Se cobrará por minuto u hora según lo definido. Ejemplo: tarifa X por hora con unidad de cobro en fracciones (cobro proporcional). Se puede definir tiempo mínimo (p.ej. la primera media hora siempre completa) para asegurar pago mínimo.
- **Tarifas variables:** Se podrán establecer tarifas diferentes según la zona del parqueadero o el tipo de vehículo (auto, moto, camión)[\[10\]](https://parklio.com/es/software-de-aparcamiento/sistema-de-gestion-de-aparcamiento#:~:text=Establece%20diferentes%20tarifas%20para%20distintas,adapten%20a%20tus%20necesidades%20espec%C3%ADficas). Por ejemplo, zona VIP +20%, auto > moto, etc.
- **Overbooking:** No se debe permitir más de una entrada/reserva simultánea en la misma plaza. El sistema bloqueará plazas al reservar o registrar entrada, garantizando que no haya colisión de horarios para una plaza.
- **Cancelaciones:** Si un conductor cancela una reserva con antelación (según política configurable), la plaza se libera. Si cancela tarde (después de X horas antes) o no se presenta, se podría aplicar una penalización (p.ej. cargo de una fracción de la tarifa, o tarifazo de no-show).
- **Pérdida de ticket:** Si el usuario pierde su ticket o QR de ingreso, se le cobrará una tarifa fija máxima (p.ej. tarifa diaria completa) para simular el peor escenario de estancia. Esta política debe estar predefinida por el Owner.
- **Cobros manuales:** En caso de fallo de sistemas, se permite marcar como manual un pago (p.ej. pago en efectivo). Aun así se genera una transacción con estado “manual” para auditoría.
- **Periodos gratuitos o especiales:** Puede incluirse un lapso de cortesía (p.ej. primeros 10 minutos gratis) o tarifas por períodos especiales (noche, fines de semana).
- **Integridad de datos:** Los usuarios no podrán modificar datos críticos fuera de su ámbito (un Owner no modifica datos de otro). Cada transacción debe referenciar un ticket válido; no se permiten enlaces huérfanos.
## <a name="casos-de-uso-prioritarios"></a>Casos de uso prioritarios
1. **US-001: Reserva de plaza (Conductor)**
1. *Historia:* Como **Conductor**, quiero reservar una plaza en un parqueadero para una fecha y hora futura, para asegurarme de tener lugar al llegar.
1. *Criterios (Gherkin):*
   - Dado que el conductor ha iniciado sesión, cuando selecciona fecha, hora de inicio/fin y confirma la plaza disponible, entonces se registra la reserva y la plaza queda bloqueada en ese intervalo.
1. **US-002: Cancelación de reserva (Conductor)**
1. *Historia:* Como **Conductor**, quiero poder cancelar mi reserva antes de llegar, para liberar la plaza y recibir reembolso parcial/total según política.
1. *Criterios (Gherkin):*
   - Dado que el conductor posee una reserva futura, cuando la cancela a tiempo, entonces la reserva desaparece y la plaza vuelve a estar disponible; se genera un crédito o reembolso según política.
1. **US-003: Check-in con QR (Operador / Conductor)**
1. *Historia:* Como **Operador**, quiero registrar la entrada de un vehículo escaneando su código QR de reserva o ticket, para generar el ticket de ingreso.
1. *Criterios (Gherkin):*
   - Dado que el vehículo tiene reserva, cuando el Operador escanea el QR en la entrada, entonces el sistema crea el ticket de entrada con hora actual y vincula la reserva.
1. **US-004: Pago en el check-out (Operador o Conductor)**
1. *Historia:* Como **Operador/Conductor**, quiero calcular y procesar el pago al momento de salida, para completar la transacción.
1. *Criterios (Gherkin):*
   - Dado que un vehículo llega a pagar, cuando el Operador introduce el ticket y confirma pago, entonces se muestra el monto, al aceptar se cobra y se libera la barrera; el sistema registra la transacción asociada.
1. **US-005: Creación de parqueadero (Owner)**
1. *Historia:* Como **Owner**, quiero dar de alta un nuevo parqueadero con sus datos básicos, para empezar a configurarlo.
1. *Criterios (Gherkin):*
   - Dado que el Owner está autenticado, cuando ingresa nombre y ubicación de un nuevo parqueadero y guarda, entonces el parqueadero queda creado y aparece en su lista.
1. **US-006: Reporte de ingresos (Owner)**
1. *Historia:* Como **Owner**, quiero visualizar un reporte de ingresos (por día/mes), para analizar el desempeño de mi parqueadero.
1. *Criterios (Gherkin):*
   - Dado que existen transacciones registradas, cuando el Owner genera el reporte de ingresos del último mes, entonces recibe un informe (CSV/PDF) con fechas y totales por día.
1. **US-007: Asignación de roles internos (Owner)**
1. *Historia:* Como **Owner**, quiero asignar permisos a un gerente u operador, para que puedan ayudar en la gestión.
1. *Criterios (Gherkin):*
   - Dado que el Owner está en la sección de usuarios internos, cuando agrega un correo y asigna el rol de “Operador”, entonces se envía invitación; al aceptar, el usuario puede iniciar sesión con ese rol.
1. **US-008: Configuración de barrera automatizada (Integrador de hardware)**
1. *Historia:* Como **Integrador de hardware**, quiero conectar una barrera automática al sistema, para que pueda abrirse al validar una entrada/pago.
1. *Criterios (Gherkin):*
   - Dado que el integrador conecta la barrera al módulo Parklio Brain y la registra en el sistema, cuando se envía la prueba de apertura, entonces la barrera sube; el sistema muestra estado “en línea” de la barrera.

(*Se pueden agregar más historias según roles adicionales, pero las anteriores cubren las operaciones clave del MVP.*)
## <a name="reports-y-métricas-clave"></a>Reports y métricas clave
- **Ocupación diaria:** Número de plazas ocupadas vs. totales por día, máximo y promedio.
- **Ingresos por parqueadero:** Total de ingresos diarios/semanales/mensuales, desglozados por estacionamiento y métodos de pago.
- **Tiempo promedio de estancia:** Media de minutos u horas que un vehículo permanece estacionado (por día/semana).
- **Tickets perdidos:** Cantidad de tickets no presentados (pérdida) y los cargos correspondientes.
- **Tasa de uso de reservas:** Número de reservas cumplidas vs. canceladas.
- **Plazas disponibles vs. ocupadas (actual):** Métrica en tiempo real de ocupación por hora.
- **Transacciones por canal:** (opcional) monto total por método de pago (efectivo, tarjeta).

Estos reportes servirán al Owner y Auditores para monitorear y optimizar la operación del parqueadero.
## <a name="requerimientos-de-api"></a>Requerimientos de API

|Método|Ruta|Descripción|Autenticación|
| :- | :- | :- | :- |
|**POST**|/api/v1/auth/register|Registrar nuevo Owner/inquilino|No (public)|
|**POST**|/api/v1/auth/login|Iniciar sesión (devuelve token de acceso)|No|
|**GET**|/api/v1/parkings|Listar parqueaderos del Owner actual|Sí (Token Owner)|
|**POST**|/api/v1/parkings|Crear nuevo parqueadero|Sí (Token Owner)|
|**PUT**|/api/v1/parkings/{id}|Editar datos de un parqueadero|Sí (Token Owner)|
|**DELETE**|/api/v1/parkings/{id}|Eliminar (inactivar) un parqueadero|Sí (Token Owner)|
|**GET**|/api/v1/parkings/{id}/slots|Listar plazas de un parqueadero|Sí (Token Owner/Gerente)|
|**POST**|/api/v1/parkings/{id}/slots|Crear nueva plaza en parqueadero|Sí (Token Owner/Gerente)|
|**GET**|/api/v1/slots/{id}|Detalle de una plaza específica|Sí (Token Owner/Gerente)|
|**GET**|/api/v1/reservations|Listar reservas del usuario (Conductor)|Sí (Token Conductor)|
|**POST**|/api/v1/reservations|Crear una nueva reserva|Sí (Token Conductor)|
|**GET**|/api/v1/reservations/{id}|Detalle de reserva|Sí (Token Conductor)|
|**POST**|/api/v1/tickets/entry|Registrar check-in (entrada) de vehículo|Sí (Token Operador)|
|**POST**|/api/v1/tickets/exit|Registrar check-out (salida) y pago|Sí (Token Operador)|
|**GET**|/api/v1/payments/{ticketId}|Ver estado de pago de un ticket|Sí (Token Owner/Operador)|
|**GET**|/api/v1/parkings/{id}/availability|Ver plazas disponibles (público)|No|
|**GET**|/api/v1/parkings/{id}/reports/occupancy|Obtener reporte de ocupación de un parqueadero|Sí (Token Owner/Auditor)|
|**GET**|/api/v1/parkings/{id}/reports/income|Obtener reporte de ingresos de un parqueadero|Sí (Token Owner/Auditor)|

*(Nota: Rutas y nombres son ejemplos; se asumirá versión de API v1 y autenticación con tokens JWT para las rutas protegidas.)*
## <a name="entregables-esperados"></a>Entregables esperados
- Documento de especificación de requisitos funcionales y no funcionales (este documento).
- Casos de uso detallados y diagramas UML (casos de uso, secuencia).
- Modelo de datos: diagrama Entidad-Relación (ER) de la base.
- CSV de muestra con datos de ejemplo (parqueaderos, plazas, tarifas).
- Especificación de la API en formato OpenAPI/Swagger (documentación de endpoints).
- Prototipos o Wireframes de interfaces clave.
- Plan de MVP con lista priorizada de historias de usuario.
- Manual o guía básica de instalación/configuración (incluyendo integraciones hardware).
## <a name="supuestos-y-restricciones"></a>Supuestos y restricciones
- **Conectividad:** Se asume que cada parqueadero dispone de conexión a internet (aunque debe haber modo offline básico). El hardware (barreras, sensores) y su instalación corren por cuenta del propietario.
- **Costos de hardware:** No están incluidos en el desarrollo; se supondrá que el cliente adquirirá dispositivos compatibles. El sistema debe ser compatible con hardware comercial estándar.
- **Mercado objetivo:** PyMEs de estacionamientos y dueños independientes. Idioma inicial: español, moneda configurable (ej. local).
- **Legislación:** Si opera en la UE o similar, deberá cumplir GDPR (protección datos) y normativas locales (facturación, seguridad física). En LATAM, se asume cumplimiento de leyes de datos personales.
- **Escalas:** Inicialmente se enfocará en operativas básicas; características avanzadas como precios dinámicos, marketing o integración contable se consideran fuera de alcance MVP.
- **Funcionalidad offline:** Aunque se espera conexión constante, el sistema debe permitir registrar entradas/salidas con conectividad intermitente, guardando datos localmente para sincronizar después.
- **Restricciones técnicas:** La solución se implementará en tecnologías web estándares (p.ej. React/Vue + Node/Django), sin dependencia de software propietario.
## <a name="x6047c6071feb8c6389336273b1ce7545cd455e3"></a>Criterios de aceptación general del proyecto
El proyecto se considerará completo cuando:\
\- Todos los requisitos de prioridad "M" estén implementados y verificados.\
\- Los flujos de registro/login, configuración de parqueaderos, check-in/check-out, reservas, pagos y reportes funcionen correctamente en un entorno realista (pruebas con datos reales).\
\- El sistema esté desplegado en un entorno en la nube y accesible públicamente (según demo) con multitenancy activo.\
\- Se cumpla con los objetivos de desempeño y seguridad definidos.\
\- Se hayan entregado los documentos y artefactos requeridos (especificación, ER, API spec, CSV ejemplos).\
\- El cliente (propietario de parqueadero) pueda realizar las operaciones clave (configurar parqueo, recibir clientes, cobrar, consultar reportes) sin errores críticos.

En conjunto, se deberá demostrar la operatividad completa del sistema básico (MVP) según el alcance definido, con datos aislados por parqueadero y todas las funciones críticas implementadas y probadas. En caso de extender el proyecto, servirán de base la documentación y APIs generadas en este MVP.

**Fuentes:** Se han considerado buenas prácticas de arquitectura multitenant[\[1\]](https://adrianalonsodev.medium.com/enfoques-de-arquitectura-multitenant-para-aplicaciones-saas-cf210d6c2f10#:~:text=La%20arquitectura%20multitenant%20es%20una,de%20trabajo%20por%20cada%20organizaci%C3%B3n)[\[8\]](https://adrianalonsodev.medium.com/enfoques-de-arquitectura-multitenant-para-aplicaciones-saas-cf210d6c2f10#:~:text=,la%20misma%20base%20de%20datos) y ejemplos de sistemas de estacionamiento profesionales[\[4\]](https://parklio.com/es/software-de-aparcamiento/sistema-de-gestion-de-aparcamiento#:~:text=,Soporta%20pagos%20sin%20contacto)[\[5\]](https://parklio.com/es/software-de-aparcamiento/sistema-de-gestion-de-aparcamiento#:~:text=PMS%20es%20compatible%20con%20sus,inteligente%20de%20gesti%C3%B3n%20de%20estacionamiento) para guiar estos requerimientos.

-----
<a name="citations"></a>[\[1\]](https://adrianalonsodev.medium.com/enfoques-de-arquitectura-multitenant-para-aplicaciones-saas-cf210d6c2f10#:~:text=La%20arquitectura%20multitenant%20es%20una,de%20trabajo%20por%20cada%20organizaci%C3%B3n) [\[8\]](https://adrianalonsodev.medium.com/enfoques-de-arquitectura-multitenant-para-aplicaciones-saas-cf210d6c2f10#:~:text=,la%20misma%20base%20de%20datos) [\[9\]](https://adrianalonsodev.medium.com/enfoques-de-arquitectura-multitenant-para-aplicaciones-saas-cf210d6c2f10#:~:text=Una%20base%20de%20datos%20para,cada%20organizaci%C3%B3n) Enfoques de Arquitectura Multitenant para Aplicaciones SaaS | by Adrián Alonso | Medium

<https://adrianalonsodev.medium.com/enfoques-de-arquitectura-multitenant-para-aplicaciones-saas-cf210d6c2f10>

[\[2\]](https://frontegg.com/blog/saas-multitenancy#:~:text=Tenant%20Isolation%20Techniques) SaaS Multitenancy: Components, Pros and Cons and 5 Best Practices | Frontegg

<https://frontegg.com/blog/saas-multitenancy>

[\[3\]](https://parklio.com/es/software-de-aparcamiento/sistema-de-gestion-de-aparcamiento#:~:text=El%20sistema%20de%20gesti%C3%B3n%20de,y%20un%20control%20remoto%20fiable) [\[4\]](https://parklio.com/es/software-de-aparcamiento/sistema-de-gestion-de-aparcamiento#:~:text=,Soporta%20pagos%20sin%20contacto) [\[5\]](https://parklio.com/es/software-de-aparcamiento/sistema-de-gestion-de-aparcamiento#:~:text=PMS%20es%20compatible%20con%20sus,inteligente%20de%20gesti%C3%B3n%20de%20estacionamiento) [\[7\]](https://parklio.com/es/software-de-aparcamiento/sistema-de-gestion-de-aparcamiento#:~:text=Al%20asignar%20responsabilidades%20de%20superadministrador%2C,adapte%20a%20todas%20tus%20necesidades) [\[10\]](https://parklio.com/es/software-de-aparcamiento/sistema-de-gestion-de-aparcamiento#:~:text=Establece%20diferentes%20tarifas%20para%20distintas,adapten%20a%20tus%20necesidades%20espec%C3%ADficas) [\[11\]](https://parklio.com/es/software-de-aparcamiento/sistema-de-gestion-de-aparcamiento#:~:text=%C2%BFPuedo%20usarlo%20en%20mi%20tel%C3%A9fono,m%C3%B3vil) [\[12\]](https://parklio.com/es/software-de-aparcamiento/sistema-de-gestion-de-aparcamiento#:~:text=,Identificaci%C3%B3n%20de%20veh%C3%ADculos%20ANPR%20integrada) [\[13\]](https://parklio.com/es/software-de-aparcamiento/sistema-de-gestion-de-aparcamiento#:~:text=,Acepta%20diversos%20m%C3%A9todos%20de%20pago) Software de gestión de aparcamientos escalable Parklio

<https://parklio.com/es/software-de-aparcamiento/sistema-de-gestion-de-aparcamiento>

[\[6\]](https://blog.logto.io/es/build-multi-tenant-saas-application#:~:text=En%20una%20arquitectura%20multi,pueden%20realizar%20en%20recursos%20particulares) Construye una aplicación SaaS multi-inquilino: Una guía completa desde el diseño hasta la implementación · Blog de Logto

<https://blog.logto.io/es/build-multi-tenant-saas-application>
