<!-- TAG: ADDED -->
# Delta Spec: Public Availability API with Rate Limiting

## Motivación
Desarrolladores y plataformas de navegación externa (ej. Waze, Google Maps o aplicaciones de movilidad urbana) necesitan consultar la disponibilidad de plazas libres en tiempo real de cualquier parqueadero sin necesidad de autenticarse con una cuenta administrativa de Nivo. Para evitar ataques de denegación de servicio (DoS) o sobrecarga en la base de datos, el endpoint debe estar rigurosamente protegido por un limitador de tasa Token Bucket y respaldado por una capa de caché de corta duración.

## Requerimientos

### 1. Endpoint Público Versionado
- **Ruta**: `GET /api/v1/public/parkings/{parkingId}/availability`
- **Alias de Compatibilidad**: `GET /api/v1/parking/{parkingId}/availability`
- **Seguridad**: Configurado como `permitAll()` en la cadena de seguridad `SecurityChain`. No exige cabecera `Authorization`.

### 2. Estructura de Respuesta (Contrato JSON)

#### Escenario: Consulta exitosa de disponibilidad
- **Dado** un `parkingId` válido y activo
- **Cuando** un cliente externo realiza una petición GET
- **Entonces** la API retorna código HTTP `200 OK` con el payload:
```json
{
  "parkingId": "c8b3687c-3f95-4424-9b5d-9c3f4e1762aa",
  "name": "Parqueadero Plaza Mayor",
  "timestamp": "2026-09-24T21:45:00Z",
  "totalSlots": 120,
  "availableSlots": 45,
  "occupiedSlots": 75,
  "occupancyRate": 62.5,
  "slotDistribution": [
    { "type": "CAR", "total": 80, "available": 25, "occupied": 55 },
    { "type": "MOTORCYCLE", "total": 30, "available": 15, "occupied": 15 },
    { "type": "EV", "total": 10, "available": 5, "occupied": 5 }
  ]
}
```

#### Escenario: Parqueadero inexistente
- **Dado** un `parkingId` inexistente o marcado como eliminado (`deleted_at IS NOT NULL`)
- **Cuando** un cliente consulta su disponibilidad
- **Entonces** la API retorna código HTTP `404 Not Found` con mensaje `"Parking lot not found: {parkingId}"`.

### 3. Rate Limiting por Token Bucket (60 req/min por IP)

1. **Algoritmo y Configuración**:
   - Cada dirección IP cliente (`RemoteAddr` o primer valor de `X-Forwarded-For`) tiene asignado un bucket con capacidad de 60 tokens.
   - Los tokens se reponen a una tasa de 1 token por segundo (60 tokens por minuto).
   - El consumo de 1 petición descuenta 1 token.

2. **Cabeceras de Control en Respuestas 200 OK**:
   - `X-RateLimit-Limit: 60`
   - `X-RateLimit-Remaining: <tokens_restantes>`
   - `X-RateLimit-Reset: <epoch_timestamp_de_recarga_completa>`

3. **Manejo de Exceso de Tasa (HTTP 429 Too Many Requests)**:
   - Si el bucket se agota, las solicitudes subsecuentes son rechazadas sin ejecutar la consulta en la base de datos.
   - **Código HTTP**: `429 Too Many Requests`
   - **Cabeceras**:
     - `Retry-After: <segundos_para_próximo_token>`
     - `X-RateLimit-Limit: 60`
     - `X-RateLimit-Remaining: 0`
   - **Cuerpo JSON**:
     ```json
     {
       "status": 429,
       "error": "Too Many Requests",
       "message": "Rate limit exceeded. Maximum 60 requests per minute allowed.",
       "retryAfterSeconds": 24
     }
     ```

### 4. Estrategia de Caché de Corta Duración
- Las respuestas se almacenan en una caché en memoria (Caffeine) con un TTL de 30 segundos indexado por `parkingId`.
- La cabecera HTTP `Cache-Control: public, max-age=30` se incluye en las respuestas 200 OK.
- Se asegura una latencia inferior a 50ms para peticiones con acierto de caché (cache hit), e inferior a 200ms en cache miss.

### 5. Documentación OpenAPI / Swagger
- Se documenta en el grupo público de OpenAPI mediante anotaciones `@Operation`, `@ApiResponses`:
  - `200`: Disponibilidad devuelta exitosamente.
  - `404`: Parqueadero no encontrado.
  - `429`: Límite de tasa excedido.
