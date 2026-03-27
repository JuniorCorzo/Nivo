# Nivo — Sistema de logo (entrega final)

## Variante master recomendada

- **Archivo:** `nivo-logo-horizontal.svg`
- **Uso:** encabezados, propuestas comerciales, deck, website, dashboard y firma corporativa.
- **Razon:** es la variante con mejor legibilidad y balance entre isotipo y wordmark.

## Assets finales

| Archivo | Tipo | Dimensiones | Uso principal |
|---------|------|-------------|---------------|
| `nivo-logo-horizontal.svg` | Isotipo + wordmark | 180 x 68 | Logo principal, headers, firmas |
| `nivo-logo-stacked.svg` | Isotipo + wordmark apilado | 180 x 148 | Formatos cuadrados, tarjetas |
| `nivo-logo-icon.svg` | Isotipo solo | 64 x 64 | Favicon, avatar, app icon |

## Especificaciones tecnicas

- Todos los SVG usan `currentColor` — monocromo adaptable a fondo claro u oscuro sin edicion.
- **Wordmark convertido a curvas** — sin dependencia de fuentes instaladas. Portabilidad total.
- Geometria de la N corregida y unificada entre variantes con compensacion optica de diagonal.
- IDs de mascara unicos por variante para evitar colisiones al embeber multiples logos en un mismo documento.

## Construccion del isotipo

- Contenedor redondeado (`rx` proporcional al tamano) comunica sistema, control y confiabilidad.
- Corte esquina superior derecha: tension minima que sugiere acceso, movimiento y modernidad.
- N en negativo con trazos de ~26% del ancho disponible y diagonal compensada opticamente (+20%).
- Counters internos (triangulos negativos) balanceados para legibilidad a tamano reducido.

## Proporciones de la N por variante

| Variante | Espacio N | Trazo vertical | Ratio |
|----------|-----------|----------------|-------|
| Icon (64px) | 38 x 34 px | 10 px | 26.3% |
| Horizontal (64px isotipo) | 38 x 34 px | 10 px | 26.3% |
| Stacked (72px isotipo) | 43 x 38 px | 11 px | 25.6% |

## Reglas de uso

- Priorizar uso monocromo: `#09090b` sobre fondos claros, `#fafafa` sobre fondos oscuros.
- No agregar gradientes, sombras ni contornos extra.
- Area de seguridad: equivalente a la altura de la N del wordmark.
- Tamano minimo isotipo: `24 x 24` px.
- Tamano minimo logo horizontal: `120` px de ancho.
- No distorsionar proporciones. Escalar siempre uniformemente.
