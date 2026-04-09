import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const distPackagePath = resolve(process.cwd(), 'dist/libs/design-system/package.json');

const pkg = JSON.parse(readFileSync(distPackagePath, 'utf8'));

pkg.exports ??= {};
pkg.exports['./styles/tokens.css'] = './styles/tokens.css';
pkg.exports['./styles/components.css'] = './styles/components.css';

writeFileSync(distPackagePath, `${JSON.stringify(pkg, null, 2)}\n`, 'utf8');

console.log('Patched dist package exports with ./styles/tokens.css and ./styles/components.css');
