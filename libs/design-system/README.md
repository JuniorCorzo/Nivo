# Nivo Design System

Este es el design system oficial de Nivo. Contiene los elementos de identidad visual y componentes UI reutilizables para construir interfaces consistentes en todas las aplicaciones de Nivo.

## Publicacion en npm

Publica siempre el paquete compilado de `dist`, no la raiz del repo.

```bash
# 1) Build
npm run build

# 2) Verificacion de archivos a publicar
npm run pack:dist

# 3) Publicar solo dist
npm run publish:dist
```

Si ejecutas `npm publish` en la raiz, se intentaria publicar codigo fuente y docs. Este repo tiene una proteccion en `prepublishOnly` para bloquear ese error.

## Estructura

```
src/
├── lib/
│   ├── tokens/       # Design tokens (colores, tipografía, espacios, sombras, etc.)
│   ├── components/   # Componentes UI reutilizables (Button, Input, Card, etc.)
│   └── styles/       # Configuración global de estilos, temas y utilidades
```

## Uso

Para usar el design system en cualquier aplicación o librería:

```bash
# Instalar dependencias (si es necesario)
bun install

# Build de la librería
bunx ng-packagr -p ng-package.json

# Empaquetar (genera .tgz en dist/libs/design-system)
cd ../../dist/libs/design-system
bun pm pack

# En otro proyecto: instalar el paquete local
bun add /ruta/a/design-system-0.0.1.tgz
```

En tu código Angular standalone:

```ts
import { ButtonComponent } from "@nivo/design-system";
```

```ts
@Component({
  standalone: true,
  imports: [ButtonComponent],
  template: `<nv-button>Guardar</nv-button>`,
})
export class ExampleComponent {}
```

### Usar tokens.css desde npm

El archivo `tokens.css` se empaqueta dentro del paquete en `styles/tokens.css`.
Ademas, el paquete ahora exporta explicitamente `./styles/tokens.css` para que funcione con proyectos que respetan `exports` en `package.json`.

En una app Angular, agregalo en `angular.json`:

```json
{
  "styles": [
    "src/styles.css",
    "node_modules/@nivo-sass/design-system/styles/tokens.css"
  ]
}
```

Alternativa: importarlo en tu `styles.css` global:

```css
@import "@nivo-sass/design-system/styles/tokens.css";
```

## Desarrollo

### Construir el design system

```bash
bun run build
```

### Ejecutar tests

```bash
bun run test
```

### Lint

```bash
bun run lint
```

## Guías de contribución

1. **Tokens**: Los cambios en los tokens deben ser cuidadosos ya que afectan a toda la aplicación
2. **Componentes**: Nuevos componentes deben seguir los principios de accesibilidad y reutilización
3. **Documentación**: Cada componente público debe tener ejemplos de uso

## Temas

El design system soporta múltiples temas (claro, oscuro, alto contraste) que pueden ser seleccionados mediante el provider de tema.

Ver `src/lib/styles/themes/` para más detalles.
