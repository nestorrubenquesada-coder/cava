# Cava

Mapa visual de una cava física de vinos, pensada para usarse en un iPad en horizontal. Cada hueco del mapa es una posición real de la estantería y puede tener una botella elegida del catálogo de vinos. Las dos secciones de la cava se ven lado a lado en un carrusel horizontal: se pasa de una a otra con swipe (o scroll horizontal) o con la flecha flotante del borde de la pantalla.

100% estática: HTML/CSS/JS vanilla, sin backend, sin build, sin dependencias. Los datos viven en IndexedDB del navegador (localStorage solo guarda la preferencia de tema y el flag de cambios sin respaldar). Funciona offline y se instala como PWA.

## Archivos

| Archivo | Qué es |
|---|---|
| `index.html` / `styles.css` / `app.js` | La app completa |
| `sw.js` | Service worker (cache offline) |
| `manifest.webmanifest` | Manifiesto PWA |
| `icons/` | Íconos (los PNG se regeneran con `tools/make-icons.sh`) |

## Publicar en GitHub Pages

1. Subí el repo a GitHub (`git push`).
2. En el repo: **Settings → Pages → Build and deployment**: Source = *Deploy from a branch*, Branch = `main`, carpeta `/ (root)`. Guardá.
3. En un par de minutos la app queda en `https://<tu-usuario>.github.io/<repo>/`.

Todas las rutas de la app son relativas, así que funciona en cualquier subruta sin tocar nada.

### Al publicar cambios

Subí la versión del cache en la **primera línea de `sw.js`** (`cava-v1` → `cava-v2`, etc.) en cada deploy. Sin ese cambio, los navegadores que ya tienen la app cacheada siguen viendo la versión vieja.

## Probar en local

```sh
python3 -m http.server
# → http://localhost:8000
```

No sirve abrir `index.html` con doble click (`file://`): el service worker necesita `http://localhost` o HTTPS.

## Instalar como PWA en el iPad

1. Abrí la URL de GitHub Pages en **Safari**.
2. Botón **Compartir** → **Añadir a pantalla de inicio**.
3. Abrila desde el ícono nuevo: pantalla completa, funciona sin conexión.

> ⚠️ **La app instalada tiene su propia base de datos, separada de Safari.** Lo que cargues en Safari no aparece en la app instalada (ni al revés). Instalá primero y cargá los datos ahí — o migrá con *Guardar cambios* en Safari (aparece cuando hay cambios sin respaldar) e *Importar respaldo* en la app instalada.

Otras notas de iOS:

- En Safari sin instalar, iOS puede borrar los datos de sitios que no visitás por 7 días. Instalada como PWA no aplica, pero exportar respaldos seguido es la red de seguridad.
- iOS ignora la orientación declarada en el manifiesto; la app está pensada para horizontal pero funciona en vertical.
- El modo offline arranca a partir de la **segunda** visita (la primera instala el service worker).

## Respaldos (iCloud Drive)

Los datos vivos están en IndexedDB del navegador; el JSON es solo el respaldo, y la única forma de volver a meterlo en la app es *Importar respaldo*.

- **Guardar cambios**: aparece en el header (en verde) solo cuando hay cambios sin respaldar. Exporta un JSON con todo (catálogo + posiciones) y desaparece hasta el próximo cambio. El archivo se llama siempre **`vinos-backup.json`** (sin fecha): en el iPad, la hoja de compartir → *Guardar en Archivos* → misma carpeta de iCloud Drive ofrece **Reemplazar**, así queda un único archivo y no se acumulan copias. (Contracara: no hay historial de respaldos anteriores. En descarga clásica de escritorio, el navegador puede renombrar a `vinos-backup (1).json` si ya existe.)
- **Importar respaldo**: elegí un JSON exportado antes. Valida el formato, pide confirmación y **reemplaza por completo** los datos actuales. Si el archivo es inválido, no toca nada.

## Ajustar la estructura de la cava

La geometría vive en la constante `LAYOUT` al inicio de `app.js` (convención: `N×M` = N columnas × M filas). Al cambiarla, en el próximo arranque:

- se crean los huecos nuevos (vacíos);
- los huecos que quedaron fuera del layout y estaban **vacíos** se eliminan;
- los que quedaron fuera pero **tenían vino** se conservan en la base y en los respaldos (por las dudas), aunque no se muestran en el mapa.
