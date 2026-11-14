// Verificador estático (sin dependencias): npm run check
//  1. Sintaxis de cada módulo JS (node --check).
//  2. Que cada import relativo apunte a un archivo existente.
//  3. Que cada import con nombre exista como export en el módulo destino.
//  4. Que index.html referencie solo archivos locales que existen.
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const WWW = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'www');
const errors = [];

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

const rel = (file) => path.relative(path.dirname(WWW), file);
const jsFiles = ['src', 'assets'].flatMap((d) => (fs.existsSync(path.join(WWW, d)) ? walk(path.join(WWW, d)) : [])).filter((f) => f.endsWith('.js'));

function exportsOf(source) {
  const names = new Set();
  for (const m of source.matchAll(/export\s+(?:async\s+)?(?:class|function\*?|const|let|var)\s+([A-Za-z_$][\w$]*)/g)) names.add(m[1]);
  for (const m of source.matchAll(/export\s*\{([^}]*)\}/g)) {
    for (const part of m[1].split(',')) {
      const name = part.trim().split(/\s+as\s+/).pop();
      if (name) names.add(name);
    }
  }
  if (/export\s+default\b/.test(source)) names.add('default');
  return names;
}

for (const file of jsFiles) {
  const syntax = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
  if (syntax.status !== 0) errors.push(`${rel(file)}: error de sintaxis\n${syntax.stderr}`);

  const source = fs.readFileSync(file, 'utf8');
  const importRe = /import\s+(?:([\w$]+)\s*,?\s*)?(?:\{([^}]*)\}\s*)?(?:from\s+)?['"]([^'"]+)['"]/g;
  for (const m of source.matchAll(importRe)) {
    const [, defaultName, namedList, spec] = m;
    if (!spec.startsWith('.')) continue;
    const target = path.resolve(path.dirname(file), spec);
    if (!fs.existsSync(target)) {
      errors.push(`${rel(file)}: importa "${spec}" pero el archivo no existe`);
      continue;
    }
    const exported = exportsOf(fs.readFileSync(target, 'utf8'));
    if (defaultName && !exported.has('default')) errors.push(`${rel(file)}: "${spec}" no tiene export default`);
    if (namedList) {
      for (const part of namedList.split(',')) {
        const name = part.trim().split(/\s+as\s+/)[0];
        if (name && !exported.has(name)) errors.push(`${rel(file)}: "${spec}" no exporta "${name}"`);
      }
    }
  }
}

const html = fs.readFileSync(path.join(WWW, 'index.html'), 'utf8');
for (const m of html.matchAll(/(?:src|href)="([^"#]+)"/g)) {
  const ref = m[1];
  if (/^(?:[a-z]+:|data:|\/\/)/i.test(ref)) continue;
  if (!fs.existsSync(path.join(WWW, ref))) errors.push(`index.html: referencia "${ref}" no existe`);
}

if (errors.length) {
  console.error(`✗ ${errors.length} problema(s):\n\n${errors.join('\n')}\n`);
  process.exit(1);
}
console.log(`✓ ${jsFiles.length} módulos JS correctos; imports y referencias resueltos.`);
