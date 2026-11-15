# QUASAR

> **QUASAR es un nombre provisional.** Se cambia en un solo lugar (ver [Cambiar el nombre](#cambiar-el-nombre)).

Videojuego original de tipo **Runner 2.5D** con estética colorida, llamativa y fantástica. Es un universo compuesto por regiones, criaturas, escenarios y fenómenos propios. El estilo es 2D pero busca transmitir tridimensionalidad con perspectiva, profundidad, iluminación, sombras, escalas y capas ambientales.

Pensado para **teléfonos y tablets Android en vertical (Portrait)**. Se desarrolla primero en navegador y después se empaqueta como APK con [Capacitor](https://capacitorjs.com/).

## Estado actual: v0.2.0 · Etapa 01 · Primer núcleo jugable

Ya hay una **partida jugable**: un runner vertical de tres carriles con cámara detrás del personaje.

**Cómo se juega** (pantalla de título → **Jugar**):

| Gesto (móvil) | Tecla (ordenador) | Acción |
| --- | --- | --- |
| Deslizar ← / → | ← / → o A / D | Cambiar de carril |
| Deslizar ↑ | ↑, W o Espacio | Saltar (vallas bajas) |
| Deslizar ↓ | ↓ o S | Deslizarse (arcos altos); en el aire, caer más rápido |
| — | Esc o P | Pausa (también se pausa sola al salir de la app) |

Hay que esquivar los **bloques** (cambiando de carril), **saltar** las vallas y **deslizarse** bajo los arcos. Un golpe termina la partida; el HUD muestra distancia, monedas y puntos, y la pantalla final permite reintentar. La velocidad aumenta con la distancia.

Lo que existe y funciona:

- Escena 2.5D con pista en perspectiva, tres carriles reconocibles, terreno, colinas, cielo y elementos ambientales (pinos, árboles, arbustos, rocas, setas, flores, farolas) a distintas escalas y profundidades, con bruma de horizonte.
- Personaje provisional (fácilmente sustituible) con animaciones de correr, saltar, deslizarse y golpe.
- Obstáculos básicos (valla, arco, bloque) y monedas provisionales.
- Gestos táctiles con respuesta inmediata, sin desplazamiento ni zoom accidental de la página; teclado para probar en ordenador.
- Tramos de pista **hechos a mano** (17 en 3 niveles de dificultad) como datos validados, con una interfaz (`SegmentSource`) preparada para añadir generación procedural más adelante.
- Arte ilustrado con "colored lineart" (contornos de color, nunca negros), texturas pictóricas sutiles y sprites prerenderizados.
- Adaptación a cualquier móvil o tablet en vertical; selector de calidad Baja / Media / Alta (distancia de dibujado, cantidad de decorado, resolución de sprites, grano y partículas).
- Todo lo de la Etapa 00 (base técnica, guardado, regiones, personajes modulares, diagnóstico).

**Pendiente (no incluido en esta etapa):** habilidades y potenciadores, tiendas, misiones, regiones desbloqueables, progresión permanente, generación procedural (solo está la interfaz), audio, personaje definitivo, botón de pausa en pantalla y guardado de la mejor puntuación.

## Cómo probarlo

Requisito: [Node.js](https://nodejs.org/) 18 o superior. **No hay que instalar dependencias** (no usa `npm install`).

```bash
npm start
```

Abre <http://localhost:8080>.

Otras opciones:

| Comando | Qué hace |
| --- | --- |
| `npm start` | Servidor local en `http://localhost:8080` |
| `PORT=3000 npm start` | Usa otro puerto |
| `HOST=0.0.0.0 npm start` | Lo hace accesible desde tu red: abre en el móvil la dirección «Red» que imprime la consola |
| `npm run check` | Verifica sintaxis, imports y referencias de todos los archivos |
| `npm test` | Prueba la lógica de juego sin navegador (validación de tramos, bot que juega 25 partidas, colisiones y física del salto) |
| `npm run build:single` | Regenera `index.html` (raíz), la versión de un solo archivo |

> Los módulos ES de `www/` no se cargan al abrir `www/index.html` con doble clic (`file://`); hace falta el servidor local. Cualquier otro servidor estático que sirva la carpeta `www/` también funciona. El `index.html` de la raíz (un solo archivo) sí se abre con doble clic.

### Probar sin instalar nada (GitHub Pages)

El `index.html` de la **raíz** del repositorio es una versión de **un solo archivo** con todo el juego dentro (HTML, CSS y JavaScript). No necesita servidor ni carpetas. Está generado a partir de `www/`.

Para publicarlo (una sola vez):

1. En el repositorio: **Settings → Pages → Build and deployment**. En *Source* elige **Deploy from a branch**, rama **main** y carpeta **/ (root)**. Pulsa **Save**.
2. Espera 1–2 minutos y abre `https://TU_USUARIO.github.io/TU_REPO/` desde el navegador del móvil o la tablet.

GitHub Pages es gratis para repositorios públicos; en uno privado requiere un plan de pago.

También puedes abrir el `index.html` de la raíz directamente en un navegador.

> **Importante:** `index.html` (raíz) se genera automáticamente. No lo edites a mano: cambia el código en `www/` y regéneralo con `npm run build:single` antes de subir los cambios.

**Para probar en pantalla de móvil sin móvil:** en Chrome, `F12` → icono de dispositivo → elige un teléfono (en vertical). Con el botón **Diagnóstico** de la pantalla de título verás FPS, tiempo de dibujado, tamaño y escala (y, en partida, velocidad y elementos activos).

## Tecnología elegida

**JavaScript moderno (módulos ES) + Canvas 2D + HTML/CSS, sin motor ni framework y sin dependencias.**

- **Rendimiento y compatibilidad.** Canvas 2D funciona bien en prácticamente cualquier WebView de Android y evita el coste de un motor completo. Para un runner 2.5D hecho con capas, sprites y paralaje es más que suficiente.
- **Sin dependencias.** Nada que actualizar, nada que se rompa, APK más ligero y menos puntos de fallo al empaquetar con Capacitor.
- **Escalabilidad.** Un motor como Phaser o PixiJS ahorra trabajo en algunas cosas, pero impone su estructura. Aquí la arquitectura es propia y modular, y cada sistema puede crecer o sustituirse. Si en una etapa futura el rendimiento de dibujado lo pidiera, la capa de render está aislada y se puede migrar a WebGL (por ejemplo PixiJS) sin tocar la lógica.
- **Interfaz en DOM sobre el canvas.** Texto nítido a cualquier densidad de píxeles, botones táctiles reales y accesibilidad, sin gastar fotogramas del juego en dibujar la UI.

Decisiones técnicas relevantes:

- **Área segura vertical de 720 unidades de ancho (9:16).** El juego se dibuja en unidades lógicas y se escala de forma uniforme. Su alto va de 1280 a 1700 unidades según la pantalla: los teléfonos alargados aprovechan toda la altura; en tablets o ventanas anchas el área queda centrada y el fondo se extiende a los lados, sin barras negras y sin cortar nada. También se respetan las muescas y barras del sistema (`safe-area-inset`).
- **Bucle de paso fijo (60 Hz) con render separado.** La lógica será determinista, lo que facilita la física y la generación procedural futuras, y es independiente de la tasa de refresco de la pantalla.
- **Perfiles de calidad.** Todo coste de render (densidad de píxeles, FPS, detalle) se lee de un perfil central, para añadir optimizaciones sin reescribir sistemas.
- **Contenido como datos.** Personajes y regiones son definiciones validadas, desacopladas de cómo se dibujan. Sustituir el personaje provisional por uno con sprites es registrar un renderer y una definición, sin tocar el resto.

## Estructura de carpetas

```
quasar/
├── www/                          Todo lo que se sirve (y empaquetará Capacitor)
│   ├── index.html
│   ├── css/                      main.css (base), ui.css (interfaz)
│   ├── assets/                   Recursos gráficos y de audio
│   │   ├── manifest.js           Manifiesto de recursos (vacío en la Etapa 00)
│   │   ├── images/  audio/  data/
│   └── src/
│       ├── main.js               Punto de entrada
│       ├── config/               Configuración: nombre/versión, calidad gráfica
│       ├── core/                 Sistema principal: Game, Loop, Viewport, escenas, input, gestos, carga
│       ├── scenes/               Escenas (Boot, Title, Game)
│       ├── gameplay/             Reglas de la carrera: Run, PlayerController, Track, items
│       │   └── segments/         Tramos de pista: definiciones, validador, registro, SegmentSource
│       ├── characters/           Personajes: definiciones, registro, renderers
│       ├── regions/              Regiones: definiciones y registro
│       ├── graphics/             Dibujo: fondo con capas, color, azar determinista
│       │   └── runner/           Dibujo de la carrera: proyección, sprites, escenario, obstáculos, cielo
│       ├── ui/                   Interfaz: gestor, pantallas, componentes, diagnóstico
│       ├── audio/                Audio (Web Audio): buses, volúmenes, desbloqueo
│       └── save/                 Guardado versionado con migraciones
├── index.html                    Versión de un solo archivo para GitHub Pages (generada, no editar)
├── tools/                        serve.mjs, check.mjs (verificador), build-single.mjs, test-gameplay.mjs
├── docs/                         ARCHITECTURE.md, ANDROID.md
├── capacitor.config.json         Preparado para la conversión a Android
├── package.json
├── CHANGELOG.md
└── README.md
```

Más detalle de cada módulo y de cómo ampliarlo en [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Dependencias

**Ninguna** en ejecución ni en desarrollo. Solo se necesita Node.js 18+ para el servidor local y el verificador.
Capacitor se añadirá cuando se aborde la conversión a Android (ver [docs/ANDROID.md](docs/ANDROID.md)).

## Cambiar el nombre

1. `www/src/config/game.config.js` → `name` (nombre visible; el título de la pantalla y de la pestaña salen de aquí).
2. `www/index.html` → `<title>` (solo el texto mostrado antes de que cargue el JS).
3. Más adelante, al crear el APK: `capacitor.config.json` → `appName`.

`id` en `game.config.js` es la clave técnica del guardado local; no hace falta cambiarla al renombrar.

## Versión

**v0.2.0 · Etapa 01 · Primer núcleo jugable.** Consulta [CHANGELOG.md](CHANGELOG.md).

### Ajustar la jugabilidad

Todos los números (velocidad, salto, deslizamiento, carriles, cámara, dificultad, puntuación) están en `www/src/config/gameplay.config.js`. Los tramos de pista se editan como texto en `www/src/gameplay/segments/definitions/` (una fila de 3 caracteres por cada 3 m: `.` vacío, `c` moneda, `l` valla, `j` valla con moneda en el aire, `h` arco, `u` arco con moneda al ras, `x` bloque); el validador rechaza los tramos sin camino posible.

## Hoja de ruta

El desarrollo avanza por etapas, cada una con instrucciones y autorización propias. No se avanza a la siguiente sin autorización.
