// Genera una versión de UN SOLO ARCHIVO (index.html) con todo el juego dentro:
// HTML + CSS + JavaScript. Sin dependencias.
//
//   npm run build:single               → index.html (en la raíz del repositorio)
//   node tools/build-single.mjs ruta   → ruta personalizada
//
// Sirve para probar el juego sin servidor ni carpetas:
//  - publicándolo con GitHub Pages (rama main, carpeta raíz), o
//  - abriéndolo directamente en el navegador.
// El código fuente de desarrollo sigue siendo www/ (módulos ES separados).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const WWW = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'www');
const ENTRY = path.join(WWW, 'src', 'main.js');
const OUT = path.resolve(process.argv[2] || path.join(WWW, '..', 'index.html'));

const idOf = (file) => path.relative(WWW, file).split(path.sep).join('/');

const IMPORT_RE = /import\s+(?:(\w+)\s*,\s*)?(?:\{([^}]*)\}|(\w+))?\s*from\s*['"]([^'"]+)['"];?/g;
const EXPORT_DECL_RE = /^export\s+((?:async\s+)?(?:class|function\*?|const|let|var))\s+([A-Za-z_$][\w$]*)/gm;

const modules = new Map(); // id → { code }
const order = []; // dependencias primero

function visit(file) {
  const id = idOf(file);
  if (modules.has(id)) return;
  modules.set(id, null); // marca para detectar ciclos
  let source = fs.readFileSync(file, 'utf8');

  // 1) imports → lectura del objeto de exports del módulo importado
  source = source.replace(IMPORT_RE, (_, defaultA, named, defaultB, spec) => {
    if (!spec.startsWith('.')) throw new Error(`${id}: import externo no soportado: ${spec}`);
    const depFile = path.resolve(path.dirname(file), spec);
    const depId = idOf(depFile);
    if (modules.has(depId) && modules.get(depId) === null) throw new Error(`Dependencia circular: ${id} ↔ ${depId}`);
    visit(depFile);
    const parts = [];
    const def = defaultA || defaultB;
    if (def) parts.push(`const ${def} = __m[${JSON.stringify(depId)}].default;`);
    if (named) {
      const list = named
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
        .map((s) => s.replace(/\s+as\s+/, ': '))
        .join(', ');
      parts.push(`const { ${list} } = __m[${JSON.stringify(depId)}];`);
    }
    return parts.join(' ');
  });

  // 2) exports → declaraciones normales + objeto de exports al final
  const names = [];
  source = source.replace(EXPORT_DECL_RE, (_, kind, name) => {
    names.push(name);
    return `${kind} ${name}`;
  });
  let hasDefault = false;
  source = source.replace(/^export\s+default\s+/m, () => {
    hasDefault = true;
    return 'const __default = ';
  });
  if (/^export\s*\{/m.test(source)) throw new Error(`${id}: "export { … }" no soportado por el empaquetador`);

  const exportsObj = names.concat(hasDefault ? ['default: __default'] : []).join(', ');
  const code = `__m[${JSON.stringify(id)}] = (function () {\n'use strict';\n${source}\nreturn { ${exportsObj} };\n})();`;
  modules.set(id, { code });
  order.push(id);
}

visit(ENTRY);

const bundle = `(function () {\n'use strict';\nconst __m = {};\n${order.map((id) => modules.get(id).code).join('\n')}\n})();`;
if (bundle.includes('</script')) throw new Error('El código contiene "</script": no se puede incrustar');

// HTML: CSS y JS en línea
let html = fs.readFileSync(path.join(WWW, 'index.html'), 'utf8');
html = html.replace(/<link rel="stylesheet" href="([^"]+)"\s*\/?>/g, (_, href) => {
  const css = fs.readFileSync(path.join(WWW, href), 'utf8');
  return `<style>\n${css}\n</style>`;
});
const scriptTag = /<script type="module" src="src\/main\.js"><\/script>/;
if (!scriptTag.test(html)) throw new Error('No se encontró la etiqueta <script type="module"> en index.html');
html = html.replace(scriptTag, () => `<script>\n${bundle}\n</script>`);

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, html);
console.log(`✓ ${order.length} módulos empaquetados → ${path.relative(process.cwd(), OUT)} (${(html.length / 1024).toFixed(0)} KB)`);
