# Conversión a Android con Capacitor (preparación)

**Estado:** preparado, **no ejecutado**. En la Etapa 00 no se instala Capacitor ni se genera el proyecto Android; esto queda para la etapa correspondiente.

## Lo que ya está listo

- Todo el juego vive en `www/` (el `webDir` de Capacitor), con `index.html` como entrada.
- `capacitor.config.json` con `appId` (`com.quasar.game`, provisional), `appName` y `webDir`.
- Sin dependencias en tiempo de ejecución ni APIs solo de escritorio.
- Orientación vertical: la app intenta bloquearla (`screen.orientation.lock('portrait')`) y el diseño se centra si no es posible.
- Escalado uniforme sin deformación y respeto de muescas y barras del sistema (`viewport-fit=cover` + `safe-area-inset`).
- Audio con desbloqueo tras el primer gesto, como exige el WebView.
- Guardado detrás de un adaptador, sustituible por Capacitor Preferences.
- Bucle que se detiene al pasar la app a segundo plano.

## Pasos previstos (para cuando se autorice la etapa)

Requisitos: Node.js 18+, Android Studio (con el SDK de Android) y JDK. Comprueba en la [documentación de Capacitor](https://capacitorjs.com/docs/getting-started/environment-setup) las versiones exactas vigentes.

```bash
npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap add android
npx cap sync android
npx cap open android      # abre Android Studio para compilar el APK
```

Después de cada cambio en `www/`: `npx cap sync android`.

## Ajustes previstos en la etapa Android

- Bloquear orientación vertical en `AndroidManifest.xml` (`android:screenOrientation="portrait"`).
- Modo inmersivo (ocultar barras del sistema) y pantalla siempre encendida durante el juego.
- Iconos y pantalla de arranque (splash).
- Definir el `appId` definitivo y el nombre final.
- Sustituir el guardado por Capacitor Preferences si se quiere más robustez.
- Pruebas en dispositivos de gama baja para calibrar los perfiles de calidad.
