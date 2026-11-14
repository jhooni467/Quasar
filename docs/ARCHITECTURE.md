# Arquitectura

Principios: módulos independientes, datos separados de la lógica, servicios accesibles a través de `game`, y nada de lógica concentrada en un único archivo.

## Visión general

```
main.js ─► Game (core/Game.js)
             ├─ bus        EventBus          comunicación sin acoplar módulos
             ├─ save       SaveManager       guardado versionado
             ├─ viewport   Viewport          tamaño, escala y área segura
             ├─ input      Input             puntero y teclado (sin gestos aún)
             ├─ audio      AudioManager      buses y desbloqueo (sin sonidos aún)
             ├─ assets     AssetLoader       carga desde assets/manifest.js
             ├─ characters CharacterRegistry definiciones de personajes
             ├─ regions    RegionRegistry    definiciones de regiones
             ├─ scenes     SceneManager      escena activa
             ├─ ui         UIManager         pantallas en DOM sobre el canvas
             └─ loop       Loop              paso fijo + render
```

Las escenas y la interfaz reciben `game` y toman de él lo que necesitan. Los módulos de contenido (personajes, regiones) no conocen a `Game`.

## Módulos

### `config/`
- `game.config.js`: nombre, versión, resolución de diseño y parámetros del bucle. **Único lugar del nombre visible.**
- `quality.config.js`: perfiles de calidad gráfica. Los sistemas leen `game.quality`; no tienen números propios de coste.

### `core/` (sistema principal)
- **`Game`**: crea y conecta los servicios; arranque, pausa al pasar a segundo plano y cambio de calidad.
- **`Loop`**: lógica con paso fijo de 1/60 s (`update(dt)`) y `render(alpha)` por fotograma; tope de FPS; descarta el retraso acumulado en dispositivos lentos.
- **`Viewport`**: área segura vertical de 720 unidades de ancho (alto entre 1280 y 1700), escala uniforme, densidad de píxeles limitada por calidad, margen de muescas. Emite `resize`.
- **`Scene` / `SceneManager`**: ciclo de vida `enter → update/render → exit` y `resize`.
- **`Registry`**: base genérica de registros con validación.
- **`AssetLoader`**: imágenes, JSON y audio desde el manifiesto, con progreso.
- **`Input`**: posición del puntero en unidades lógicas y teclas; emite `input:*`.
- **`EventBus`**: `on / off / emit`.

### `scenes/`
`BootScene` (precarga) y `TitleScene` (integra región, personaje, UI y ajustes). Se declaran en `scenes/index.js`.

### `characters/`
- `CharacterDefinition.js`: forma de una definición (`id`, `name`, `render`, `skins`, `animations`, `accessories`, `abilities`) y su validación.
- `CharacterRegistry.js`: registro.
- `CharacterRendererRegistry.js`: asocia un `render.type` con un renderer (`draw(ctx, character, x, y, size)`).
- `Character.js`: instancia con estado (animación, apariencia, accesorios) que delega el dibujo.
- `renderers/placeholderRenderer.js` y `definitions/placeholder.js`: personaje provisional, sin diseño definitivo.

### `regions/`
- `RegionDefinition.js`: forma de una región (paleta, luz, estrellas, capas de siluetas) y su validación.
- `RegionRegistry.js` y `definitions/previewNebula.js` (región de prueba técnica, `status: 'preview'`).

### `graphics/`
- `ParallaxBackdrop.js`: dibuja una región en capas (cielo, estrellas, luz, siluetas con paralaje, perspectiva atmosférica, borde de luz y sombra).
- `color.js`, `random.js` (azar determinista por semilla, base de la generación procedural futura).

### `ui/`
Interfaz en DOM sobre el canvas, alineada con el área segura. `UIManager` registra pantallas (`mount/unmount`); `components/` guarda piezas reutilizables; `DebugOverlay` muestra el diagnóstico. Los estilos usan unidades lógicas × `--u`, con mínimos táctiles.

### `audio/`
`AudioManager` sobre Web Audio: buses `music` y `sfx` hacia `master`, volúmenes, desbloqueo tras el primer gesto, registro y reproducción de efectos.

### `save/`
`SaveManager` con esquema versionado (`defaultSave.js`), migraciones (`migrations.js`), mezcla con valores por defecto, tolerancia a datos corruptos y escritura agrupada. El almacenamiento va detrás de un adaptador (`adapters/LocalStorageAdapter.js`), sustituible por Capacitor Preferences.

## Cómo ampliar

**Añadir un personaje.** Crea `characters/definitions/<id>.js` con la forma de `CharacterDefinition` y añádelo a `definitions/index.js`. Si usa un estilo de dibujo nuevo (p. ej. sprites), implementa un renderer con `draw()` y regístralo en `Game._registerContent()` con `registerCharacterRenderer('sprite', …)`.

**Añadir una región.** Crea `regions/definitions/<id>.js` y añádela a `definitions/index.js`. Una región nueva puede ampliar `RegionDefinition` con sus propios campos (obstáculos, música, criaturas) cuando llegue su etapa.

**Añadir una escena.** Crea una clase que extienda `Scene`, regístrala en `scenes/index.js` y cambia a ella con `game.scenes.switchTo('nombre', params)`.

**Añadir una pantalla de UI.** Crea una clase con `mount(container)` y `unmount()`, regístrala en `UIManager` y muéstrala con `game.ui.show('nombre')`.

**Añadir recursos.** Decláralos en `assets/manifest.js`; `BootScene` los precarga. Léelos con `game.assets.getImage(clave)` / `getJson(clave)`; el audio queda registrado en `game.audio`.

**Cambiar el guardado.** Sube `SAVE_VERSION`, actualiza `createDefaultSave()` y añade la función de migración en `migrations.js`.

## Dónde encajarán las mecánicas futuras

| Mecánica | Dónde |
| --- | --- |
| Carriles, saltos, deslizamientos | Nueva escena de juego; la lógica en `update(dt)` de paso fijo; gestos sobre `Input` |
| Generación procedural | Módulo nuevo que use `graphics/random.js` (azar por semilla) y datos de región |
| Obstáculos y coleccionables | Datos en las definiciones de región + módulo de entidades |
| Habilidades y potenciadores | `abilities` de `CharacterDefinition` + módulo propio |
| Misiones y progresión | `progress` del guardado (ya reservado) + módulo propio |
| Personajes desbloqueables | `CharacterRegistry` + `progress` del guardado |
| Música y efectos ambientales | `AudioManager` (buses ya creados) + datos de región |

## Rendimiento

- Sin dependencias; el canvas se limpia con un único relleno por fotograma (`alpha: false`).
- Gradientes cacheados hasta el siguiente `resize`; siluetas con puntos en un `Float32Array` reutilizado; sin asignaciones por fotograma en el dibujado del fondo.
- Densidad de píxeles y FPS limitados por perfil de calidad; el bucle se detiene con la app en segundo plano.
- No se optimiza de forma prematura: los perfiles de calidad son el punto de extensión para futuras opciones gráficas.
