# Cambios

## 0.1.0 · Etapa 00 · Fundación

Primera versión: base técnica organizada y ejecutable en navegador. Sin mecánicas de juego.

- Estructura modular: núcleo, escenas, personajes, regiones, gráficos, interfaz, audio, configuración y guardado.
- Lienzo adaptable con área segura de 1280×720 unidades lógicas, sin deformaciones; aviso de giro en vertical.
- Bucle de paso fijo con tope de FPS por perfil de calidad.
- Perfiles de calidad gráfica (Baja/Media/Alta) con guardado.
- Sistema de personajes modular (definiciones + renderers) con personaje provisional.
- Sistema de regiones con fondo de capas, paralaje, iluminación y perspectiva atmosférica; región de prueba.
- Guardado local versionado con migraciones y tolerancia a datos corruptos.
- Audio base (buses, volúmenes, desbloqueo tras el primer gesto), sin sonidos todavía.
- Herramientas: servidor local (`npm start`), verificador (`npm run check`) y generador de versión de un solo archivo (`npm run build:single`, salida en `index.html` de la raíz) para publicar con GitHub Pages sin servidor.
- Documentación inicial y preparación para Capacitor/Android.
