# QUASAR

> **QUASAR es un nombre provisional.** Se cambia en un solo lugar (ver [Cambiar el nombre](#cambiar-el-nombre)).

Videojuego original de tipo **Runner 2.5D** con estética colorida, llamativa y fantástica. Es un universo compuesto por regiones, criaturas, escenarios y fenómenos propios. El estilo es 2D pero busca transmitir tridimensionalidad con perspectiva, profundidad, iluminación, sombras, escalas y capas ambientales.

Pensado para **teléfonos y tablets Android en horizontal**. Se desarrolla primero en navegador y después se empaqueta como APK con [Capacitor](https://capacitorjs.com/).

## Estado actual: v0.1.0 · Etapa 00 · Fundación

Esta versión es **solo la base técnica**. Aún **no hay mecánicas de juego**.

Lo que existe y funciona:

- Aplicación ejecutable en el navegador (pantalla de arranque y pantalla de título).
- Lienzo que se adapta a cualquier tamaño y relación de aspecto, sin deformar ni cortar la interfaz.
- Aviso para girar el dispositivo cuando está en vertical.
- Región de prueba con fondo en capas (cielo, estrellas, luz, siluetas con paralaje) y personaje provisional, para comprobar que los sistemas trabajan juntos.
- Calidad gráfica seleccionable (Baja / Media / Alta) con guardado, y panel de diagnóstico (FPS, tamaño, escala).
- Sistemas preparados pero vacíos de contenido: personajes modulares, regiones, audio, carga de recursos, guardado versionado.

Lo que **todavía no existe** (llegará en etapas futuras, con autorización): movimiento por carriles, saltos y deslizamientos, generación procedural, obstáculos, coleccionables, habilidades, potenciadores, misiones, progresión, personajes desbloqueables, música y efectos ambientales.

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

> Los módulos ES no se cargan al abrir `index.html` con doble clic (`file://`); hace falta el servidor local. Cualquier otro servidor estático que sirva la carpeta `www/` también funciona.

**Para probar en pantalla de móvil sin móvil:** en Chrome, `F12` → icono de dispositivo → elige un teléfono y ponlo en horizontal. Con el botón **Diagnóstico** de la pantalla de título verás FPS, tamaño y escala.

## Tecnología elegida

**JavaScript moderno (módulos ES) + Canvas 2D + HTML/CSS, sin motor ni framework y sin dependencias.**

- **Rendimiento y compatibilidad.** Canvas 2D funciona bien en prácticamente cualquier WebView de Android y evita el coste de un motor completo. Para un runner 2.5D hecho con capas, sprites y paralaje es más que suficiente.
- **Sin dependencias.** Nada que actualizar, nada que se rompa, APK más ligero y menos puntos de fallo al empaquetar con Capacitor.
- **Escalabilidad.** Un motor como Phaser o PixiJS ahorra trabajo en algunas cosas, pero impone su estructura. Aquí la arquitectura es propia y modular, y cada sistema puede crecer o sustituirse. Si en una etapa futura el rendimiento de dibujado lo pidiera, la capa de render está aislada y se puede migrar a WebGL (por ejemplo PixiJS) sin tocar la lógica.
- **Interfaz en DOM sobre el canvas.** Texto nítido a cualquier densidad de píxeles, botones táctiles reales y accesibilidad, sin gastar fotogramas del juego en dibujar la UI.

Decisiones técnicas relevantes:

- **Área segura de 1280×720 unidades lógicas.** El juego se dibuja en unidades lógicas y se escala de forma uniforme. Todo lo importante vive en el área segura de 16:9, centrada; en pantallas más anchas o más altas el fondo se extiende más allá, sin barras negras y sin cortar nada. También se respetan las muescas y barras del sistema (`safe-area-inset`).
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
│       ├── core/                 Sistema principal: Game, Loop, Viewport, escenas, input, carga
│       ├── scenes/               Escenas (Boot, Title)
│       ├── characters/           Personajes: definiciones, registro, renderers
│       ├── regions/              Regiones: definiciones y registro
│       ├── graphics/             Dibujo: fondo con capas de profundidad, color, azar determinista
│       ├── ui/                   Interfaz: gestor, pantallas, componentes, diagnóstico
│       ├── audio/                Audio (Web Audio): buses, volúmenes, desbloqueo
│       └── save/                 Guardado versionado con migraciones
├── tools/                        serve.mjs (servidor local), check.mjs (verificador)
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

## Versión inicial

**v0.1.0 · Etapa 00 · Fundación.** Consulta [CHANGELOG.md](CHANGELOG.md).

## Hoja de ruta

El desarrollo avanza por etapas, cada una con instrucciones y autorización propias. No se avanza a la siguiente sin autorización.
