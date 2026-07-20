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

> ⚠️ **La app instalada tiene su propia base de datos, separada de Safari.** Lo que cargues en Safari no aparece en la app instalada (ni al revés). Con la sincronización con GitHub configurada en ambas (ver «Respaldos»), migrar es *Guardar cambios* en una y *⚙ → Restaurar desde GitHub* en la otra.

Otras notas de iOS:

- En Safari sin instalar, iOS puede borrar los datos de sitios que no visitás por 7 días. Instalada como PWA no aplica, pero exportar respaldos seguido es la red de seguridad.
- El manifiesto no fuerza orientación (`"orientation": "any"`): la app está pensada para horizontal pero funciona en vertical, y en el teléfono se usa así. Forzar `landscape` solo tendría efecto en Android instalada — iOS lo ignora de todas formas.
- El modo offline arranca a partir de la **segunda** visita (la primera instala el service worker).

## Respaldos (sincronización con GitHub)

Los datos vivos están en IndexedDB del navegador; el respaldo es un JSON que, con la sincronización configurada, vive como **un único archivo en un repo de GitHub**: «Guardar cambios» lo sobreescribe vía la API (un commit por guardado, sin descargas) y «Restaurar desde GitHub» lo trae de vuelta. Funciona igual en Chrome, Safari y el iPad, y el historial de commits del repo es el historial de respaldos.

### Configurar (una vez por dispositivo)

1. Creá un repo **privado** para los datos (p. ej. `cava-datos`). Privado porque el respaldo incluye tus vinos y precios; y aparte del repo de la app, porque este es público y cada guardado dispararía un redeploy de Pages.
2. Creá un token *fine-grained*: GitHub → **Settings → Developer settings → Fine-grained personal access tokens**. Acceso **solo** a ese repo, permiso **Contents: Read and write**, expiración larga.
3. En la app: botón **⚙** → repositorio (`usuario/cava-datos`), rama (`main`), archivo (`vinos-backup.json`) y el token → **Probar conexión** → **Guardar**.
4. Repetí el paso 3 en cada contexto que uses: Safari del iPad, la PWA instalada y Chrome de la compu tienen almacenamiento separado (el token queda solo en ese dispositivo; no lo commitees a ningún lado).

### Uso

- **Al abrir la app**: chequea GitHub en segundo plano y, si otro dispositivo subió una versión más nueva, **la carga sola** (toast «Datos actualizados desde GitHub»). Si además este dispositivo tiene cambios sin subir, pregunta cuál conservar. Sin conexión no pasa nada: la app sigue con los datos locales.
- **Guardar cambios**: aparece en el header (en verde) solo cuando hay cambios sin respaldar; sube el respaldo y desaparece hasta el próximo cambio. Si el remoto avanzó sin que este dispositivo lo viera, avisa antes de pisarlo. Si falla (sin red, token vencido), avisa y el botón se queda.
- **⚙ → Restaurar desde GitHub**: fuerza la bajada manual del respaldo (valida, pide confirmación y **reemplaza por completo** los datos locales). Con la sincronización al abrir casi nunca hace falta.
- **⚙ → Exportar/Importar archivo**: fallback manual a JSON local (`vinos-backup.json`), útil sin conexión o sin configurar la sincronización. Sin configurar, «Guardar cambios» usa este flujo (hoja de compartir en iPad, descarga en escritorio).

## Ajustar la estructura de la cava

La geometría vive en la constante `LAYOUT` al inicio de `app.js` (convención: `N×M` = N columnas × M filas). Al cambiarla, en el próximo arranque:

- se crean los huecos nuevos (vacíos);
- los huecos que quedaron fuera del layout y estaban **vacíos** se eliminan;
- los que quedaron fuera pero **tenían vino** se conservan en la base y en los respaldos (por las dudas), aunque no se muestran en el mapa.
