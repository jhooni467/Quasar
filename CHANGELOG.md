# Cambios

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
