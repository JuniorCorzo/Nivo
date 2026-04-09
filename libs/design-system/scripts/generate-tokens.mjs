/**
 * generate-tokens.mjs
 *
 * Genera src/lib/styles/tokens.css a partir de src/lib/tokens/colors.json.
 * Este archivo es la ÚNICA fuente de verdad para los colores del design system.
 *
 * Uso: node scripts/generate-tokens.mjs
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

// --- Leer colors.json ---
const colors = JSON.parse(
  readFileSync(resolve(root, 'src/lib/tokens/colors.json'), 'utf8'),
);

// --- Helpers ---

/**
 * Filtra solo los tokens de tema (excluye paletas como "zinc")
 * Un token de tema tiene las mismas keys en light y dark.
 */
const THEME_KEYS = new Set([
  'background', 'foreground',
  'card', 'card-foreground',
  'popover', 'popover-foreground',
  'primary', 'primary-foreground',
  'secondary', 'secondary-foreground',
  'muted', 'muted-foreground',
  'accent', 'accent-foreground',
  'destructive', 'destructive-foreground',
  'border', 'input', 'ring',
  'semantic-success', 'semantic-warning', 'semantic-info', 'semantic-error',
]);

/**
 * Convierte un objeto de tokens en bloque de CSS custom properties.
 * Filtra solo las keys que pertenecen al tema.
 */
const toVars = (obj, indent = '  ') =>
  Object.entries(obj)
    .filter(([key]) => THEME_KEYS.has(key))
    .map(([key, value]) => `${indent}--${key}: ${value};`)
    .join('\n');

// --- Generar CSS ---
const css = `/* ==========================================================
 * tokens.css — AUTO-GENERADO
 * No edites este archivo directamente.
 * Fuente de verdad: src/lib/tokens/colors.json
 * Regenerar: node scripts/generate-tokens.mjs
 * ========================================================== */

@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;700&family=Space+Mono:wght@700&display=swap');

/* ----------------------------------------------------------
 * Base — light theme como default en :root
 * Requerido para que Tailwind @theme inline pueda resolver
 * los var() en tiempo de build.
 * ---------------------------------------------------------- */
:root {
  --radius: 0.5rem;

${toVars(colors.light)}
}

/* ----------------------------------------------------------
 * Light theme explícito
 * ---------------------------------------------------------- */
.light,
[data-theme="light"] {
${toVars(colors.light)}
}

/* ----------------------------------------------------------
 * Dark theme
 * ---------------------------------------------------------- */
.dark,
[data-theme="dark"] {
${toVars(colors.dark)}
}
`;

// --- Escribir archivo ---
const outputPath = resolve(root, 'src/lib/styles/tokens.css');
writeFileSync(outputPath, css, 'utf8');

console.log('✅ tokens.css generado desde colors.json');
console.log(`   → ${outputPath}`);
