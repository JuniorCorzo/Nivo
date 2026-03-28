# NeoParking Design System

Este es el design system oficial de NeoParking. Contiene todos los elementos de identidad visual y componentes UI reutilizables para construir interfaces consistentes en todas las aplicaciones de NeoParking.

## Estructura

```
src/
├── lib/
│   ├── tokens/       # Design tokens (colores, tipografía, espacios, sombras, etc.)
│   ├── components/   # Componentes UI reutilizables (Button, Input, Card, etc.)
│   └── styles/       # Configuración global de estilos, temas y utilidades
```

## Uso

Para usar el design system en cualquier aplicación o librería del monorepo:

```bash
# Instalar dependencias del workspace (si es necesario)
npm install

# El design system ya está disponible como dependencia de proyecto
# En tu código:
import { Button } from '@neoparking/design-system';
import { colors } from '@neoparking/design-system/tokens';
```

## Desarrollo

### Construir el design system
```bash
nx build design-system
```

### Ejecutar tests
```bash
nx test design-system
```

### Lint
```bash
nx lint design-system
```

## Guías de contribución

1. **Tokens**: Los cambios en los tokens deben ser cuidadosos ya que afectan a toda la aplicación
2. **Componentes**: Nuevos componentes deben seguir los principios de accesibilidad y reutilización
3. **Documentación**: Cada componente público debe tener ejemplos de uso

## Temas

El design system soporta múltiples temas (claro, oscuro, alto contraste) que pueden ser seleccionados mediante el provider de tema.

Ver `src/lib/styles/themes/` para más detalles.