# Cambios

## 0.2.0 · Etapa 01 · Primer núcleo jugable

Primera partida jugable: runner vertical 2.5D de tres carriles.

- **Jugabilidad** (`gameplay/`): carriles con transición suave, salto, deslizamiento temporizado, caída rápida, buffer de entrada, colisiones básicas, velocidad progresiva, monedas provisionales y puntuación. Todo ajustable en `config/gameplay.config.js`. Sin habilidades ni potenciadores.
- **Gestos** (`core/Gestures.js`): deslizar ← → ↑ ↓ con respuesta inmediata, seguimiento por dedo, un gesto por trazo y bloqueo del desplazamiento, zoom, doble toque y menú contextual de la página. Teclado equivalente (flechas, WASD, Espacio).
- **Pista por tramos** (`gameplay/segments/`): 17 tramos hechos a mano en 3 dificultades, como datos validados (incluye comprobación de que existe camino posible). `SegmentSource` es la interfaz para añadir generación procedural más adelante (aún no implementada).
- **Escena 2.5D** (`graphics/runner/`): proyección en perspectiva con cámara detrás del personaje, cielo con planeta, colinas con paralaje, pista con bordillos y líneas de carril, bruma de horizonte, decorado determinista a distintas escalas y profundidades, partículas, viñeta y grano pictórico. Colored lineart (contornos de color, sin negro puro).
- **Región jugable de prueba** `dusk-meadow` con sección `run` (colores de suelo, pista, decorado y obstáculos como datos).
- **Personaje provisional** vista trasera con animaciones correr / saltar / deslizarse / golpe; sustituible registrando otro renderer.
- **Interfaz**: botón Jugar, HUD (distancia, monedas, puntos), pausa (Esc / P / automática al salir de la app) y pantalla de fin de partida con reintentar.
- **Calidad**: los perfiles añaden distancia de dibujado, cantidad de decorado, resolución de sprites, grano y partículas. El diagnóstico muestra el tiempo de dibujado.
- **Herramientas**: `npm test` (lógica de juego con bot: 25 partidas sin choque, colisiones, física del salto). El empaquetador de un solo archivo sigue sin dependencias.
- Versión de un solo archivo (`index.html` en la raíz) regenerada; funciona también abriéndola directamente.

## 0.1.1 · Etapa 00 · Corrección 00.1

Composición **vertical (Portrait)**.

- Área segura de 720 unidades de ancho (9:16) y alto entre 1280 y 1700 según la pantalla.
- Se elimina el aviso de «gira tu dispositivo» y se intenta bloquear la orientación en vertical.
- Pantalla de título reorganizada en columna; panel de diagnóstico más compacto.
- La versión de un solo archivo se genera ahora en `index.html` (raíz) para GitHub Pages.

## 0.1.0 · Etapa 00 · Fundación

Primera versión: base técnica organizada y ejecutable en navegador. Sin mecánicas de juego.

- Estructura modular: núcleo, escenas, personajes, regiones, gráficos, interfaz, audio, configuración y guardado.
- Lienzo adaptable con área segura de 1280×720 unidades lógicas, sin deformaciones; aviso de giro en vertical (reemplazado en 0.1.1 por la composición vertical).
- Bucle de paso fijo con tope de FPS por perfil de calidad.
- Perfiles de calidad gráfica (Baja/Media/Alta) con guardado.
- Sistema de personajes modular (definiciones + renderers) con personaje provisional.
- Sistema de regiones con fondo de capas, paralaje, iluminación y perspectiva atmosférica; región de prueba.
- Guardado local versionado con migraciones y tolerancia a datos corruptos.
- Audio base (buses, volúmenes, desbloqueo tras el primer gesto), sin sonidos todavía.
- Herramientas: servidor local (`npm start`), verificador (`npm run check`) y generador de versión de un solo archivo (`npm run build:single`, salida en `index.html` de la raíz) para publicar con GitHub Pages sin servidor.
- Documentación inicial y preparación para Capacitor/Android.
