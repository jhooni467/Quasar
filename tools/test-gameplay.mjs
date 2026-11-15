/**
 * Prueba de la lógica de juego SIN navegador (npm run test:gameplay):
 *  - los segmentos hechos a mano son válidos y el validador rechaza los imposibles;
 *  - un bot con planificación completa 25 partidas de 4 minutos sin chocar
 *    (todos los tramos tienen camino resoluble);
 *  - sin hacer nada, la partida termina en choque;
 *  - la física del salto coincide con la configuración.
 * Sale con código 1 si algo falla.
 */
let failures = 0;
const check = (name, ok, detail = '') => {
  console.log(`${ok ? '✓' : '✗'} ${name}${detail ? ' — ' + detail : ''}`);
  if (!ok) failures++;
};

import { SegmentRegistry } from '../www/src/gameplay/segments/SegmentRegistry.js';
import { SEGMENT_DEFINITIONS } from '../www/src/gameplay/segments/definitions/index.js';
import { HandmadeSegmentSource } from '../www/src/gameplay/segments/SegmentSource.js';
import { validateSegmentDefinition, hasSafePath } from '../www/src/gameplay/segments/SegmentDefinition.js';
import { Run } from '../www/src/gameplay/Run.js';
import { mulberry32 } from '../www/src/graphics/random.js';
import { RUN } from '../www/src/config/gameplay.config.js';

const reg = new SegmentRegistry();
for (const s of SEGMENT_DEFINITIONS) reg.register(s);
check('segmentos registrados y válidos', reg.list().length === SEGMENT_DEFINITIONS.length, String(reg.list().length));

// El validador debe rechazar un tramo imposible y datos malos.
check('tramo imposible rechazado', validateSegmentDefinition({id:'a',name:'a',difficulty:1,rows:['xxx','...']}).length>0);
check('carácter desconocido rechazado', validateSegmentDefinition({id:'a',name:'a',difficulty:1,rows:['q..','...']}).length>0);
check('cambios de carril demasiado seguidos rechazados', hasSafePath(['xx.','..x','xx.','..x']) === false);

function makeRun(seed) {
  const source = new HandmadeSegmentSource({ registry: reg, rnd: mulberry32(seed) });
  const r = new Run({ source });
  r.onEvent = (n) => { if (n === 'lane') r._lastLaneZ = r.z; };
  return r;
}

// Bot con planificación y ventana física de cambio de carril (tras pasar la fila, antes de llegar a la siguiente).
function bot(run) {
  const p = run.player;
  const ROW = 3;
  const items = run.track.items;
  const r0 = Math.ceil((run.z - 0.75) / ROW);   // primera fila que aún no se ha dejado atrás
  const prev = r0 - 1;
  const K = 12;
  const blocked = (r, lane) => items.some((it) => it.type === 'block' && Math.round(it.z / ROW) === r && Math.round(it.x) === lane);
  function plan(lane, since, depth, first) {
    if (depth === K) return { ok: true, first };
    const rr = prev + depth;
    if (depth > 0 && blocked(rr, lane)) return null;
    const stay = plan(lane, Math.min(2, since + 1), depth + 1, first);
    if (stay) return stay;
    if (since >= 2) {
      for (const to of [lane - 1, lane + 1]) {
        if (to < -1 || to > 1) continue;
        if (blocked(rr + 1, to)) continue;
        const res = plan(to, 0, depth + 1, first || { row: rr, lane: to });
        if (res) return res;
      }
    }
    return null;
  }
  const since = Math.min(2, Math.floor((run.z - (run._lastLaneZ ?? -99)) / ROW));
  const res = plan(p.lane, since, 0, null);
  if (res && res.first && res.first.row === prev) run.swipe(res.first.lane < p.lane ? 'left' : 'right');
  for (const it of items) {
    if (it.kind !== 'obstacle' || it.type === 'block') continue;
    const dz = it.z - run.z;
    if (dz < -0.4) continue;
    if (dz > 3) break;
    if (Math.round(it.x) !== p.lane) continue;
    if (it.type === 'hurdle' && p.grounded && dz < 2.2 + run.speed * 0.05) run.swipe('up');
    if (it.type === 'gate' && p.grounded && !p.sliding && dz < 2.4) run.swipe('down');
  }
}

let crashes = 0, maxDist = 0, totalCoins = 0;
for (let seed = 1; seed <= 25; seed++) {
  const run = makeRun(seed);
  const dt = 1 / 60;
  let t = 0;
  while (t < 240 && run.state === 'running') { bot(run); run.update(dt, 120); t += dt; }
  if (run.state !== 'running') { crashes++; console.log(`seed ${seed}: choque a ${run.distance.toFixed(0)} m, t=${t.toFixed(1)}s con`, run.hitItem && run.hitItem.type, 'lane', run.player.lane, 'y', run.player.y.toFixed(2)); }
  maxDist = Math.max(maxDist, run.distance); totalCoins += run.coins;
}
check('bot: 25 partidas sin choque', crashes === 0, `${crashes} choques; dist. máx ${maxDist.toFixed(0)} m; monedas ${totalCoins}`);

// Sin hacer nada debe chocar (hay obstáculos en el centro) y terminar.
const idle = makeRun(5);
let steps = 0; let over = false;
idle.onEvent = (n) => { if (n === 'over') over = true; };
while (steps++ < 60 * 120 && !over) idle.update(1 / 60);
check('sin jugar, la partida termina en choque', over && idle.state === 'over', `distancia ${idle.distance.toFixed(0)} m, puntos ${idle.score}`);

// Física del salto: apex y duración
const r = makeRun(1); r.state='running'; r.time=10; 
const p = r.player; p.swipe('up'); let apex=0, tt=0; while(!p.grounded || tt===0){ p.update(1/240); apex=Math.max(apex,p.y); tt+=1/240; if(tt>2)break;}
check('física del salto (altura y duración)', Math.abs(apex - RUN.jump.height) < 0.05 && Math.abs(tt - RUN.jump.airTime) < 0.03, `altura ${apex.toFixed(2)}, duración ${tt.toFixed(2)} s`);

if (failures) { console.error(`\n${failures} comprobación(es) fallida(s)`); process.exit(1); }
console.log('\nLógica de juego correcta.');
