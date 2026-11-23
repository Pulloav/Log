// Valida la integridad de los datos semilla (sin dependencias).
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const load = (file, names) => {
  const ctx = {};
  vm.runInNewContext(readFileSync(file, 'utf8') + `;globalThis.__r={${names}}`, ctx);
  return ctx.__r;
};
const { MATERIAL_SEED } = load('js/data/materials.js', 'MATERIAL_SEED');
const { DRIVERS_SEED } = load('js/data/drivers.js', 'DRIVERS_SEED');
const { CLIENT_OPTIONS, PRODUCT_OPTIONS } = load('js/data/clients-products.js', 'CLIENT_OPTIONS,PRODUCT_OPTIONS');

const errors = [];
const CATS = new Set(['IBC', 'TB', 'MP', 'POR DEFINIR']);
const codes = new Set();
for (const m of MATERIAL_SEED) {
  if (!m.code || !m.name) errors.push(`Material sin código/nombre: ${JSON.stringify(m)}`);
  if (codes.has(m.code)) errors.push(`Código SAP duplicado: ${m.code}`);
  codes.add(m.code);
  if (!CATS.has(m.category)) errors.push(`Categoría inválida (${m.category}) en ${m.code}`);
  if (!(m.gross >= 0) || !(m.net >= 0)) errors.push(`Peso inválido en ${m.code}`);
}
const ids = new Set();
for (const d of DRIVERS_SEED) {
  if (ids.has(d.id)) errors.push(`ID de chofer duplicado: ${d.id}`);
  ids.add(d.id);
  if (!d.name) errors.push(`Chofer sin nombre: ${d.id}`);
}
for (const [n, l] of [['clientes', CLIENT_OPTIONS], ['productos', PRODUCT_OPTIONS]])
  if (new Set(l).size !== l.length) errors.push(`Hay ${n} duplicados en las listas de autocompletado`);

if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
console.log(`OK · ${MATERIAL_SEED.length} materiales, ${DRIVERS_SEED.length} choferes, ${CLIENT_OPTIONS.length} clientes, ${PRODUCT_OPTIONS.length} productos`);
