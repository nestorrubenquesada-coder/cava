'use strict';
/* ============================================================================
   Cava — mapa visual de la cava de vinos
   Vanilla JS, sin dependencias. Persistencia en IndexedDB (localStorage solo
   guarda el flag de cambios sin respaldar y la configuración de
   sincronización con GitHub).
   Ver README.md para publicar y respaldar.
   ============================================================================ */

/* ============================================================================
   1. CONSTANTES DE LAYOUT
   Convención: "N×M" = N columnas × M filas. Ajustar acá la estructura física;
   el resto de la app (render y registros de IndexedDB) se deriva de esto.
   Al cambiar el layout, al próximo arranque se crean los huecos nuevos y los
   huecos sobrantes vacíos se eliminan; los sobrantes CON vino se conservan en
   la base (y en los respaldos) pero no se muestran.
   ============================================================================ */
const LAYOUT = {
  tab1: {
    modulos: { cols: 6, filas: 4 },
    slotsPorModulo: { cols: 4, filas: 3 },      // módulos normales (botellas acostadas)
    ultimaFila: { cols: 4, filas: 5 },          // fila 4: módulos altos de abajo (4×5)
    // Módulos de BOTELLAS PARADAS: una sola fila interna de huecos verticales
    // (uno por columna), cada uno del alto del módulo. Toda la fila 3, más
    // estos módulos sueltos de las filas 1 y 2. Coordenadas [fila, columna].
    paradas: [
      [1, 3], [1, 4], [1, 5], [1, 6],
      [2, 1], [2, 2], [2, 3], [2, 4], [2, 5],
      [3, 1], [3, 2], [3, 3], [3, 4], [3, 5], [3, 6],
    ],
    // Módulos INHABILITADOS (ciegos): estructura del mueble sin huecos de vino,
    // como las filas ciegas de la cava secundaria. Fila 4, columnas 1–4.
    ciegos: [
      [4, 1], [4, 2], [4, 3], [4, 4],
    ],
    // Módulos con MINIBAR: sus primeras `minibarCols` columnas internas (todas
    // las filas) son un submódulo gris oscuro sin huecos; las columnas restantes
    // siguen siendo de vino (madera). Coordenadas [fila, columna].
    minibares: [
      [4, 5], [4, 6],
    ],
    minibarCols: 3,
  },
  tab2: {
    modulos: { cols: 4, filas: 2 },
    slotsPorModulo: { cols: 5, filas: 3 },
    columnaFinal: { cols: 5, freezer: 3, filas: 5, paradasAlto: 3, heladera: true }, // módulo alto de la
                                                // columna final (ocupa las filas 2–4) con forma de HELADERA
                                                // (blanca): freezer arriba (3 filas SIN huecos + línea
                                                // divisoria), luego 5 filas acostadas y 1 fila de 5 botellas
                                                // PARADAS abajo. 3s+5s+3s = 11s de alto total.
    filasCiegas: [3, 5],                        // filas 3 y 4 (columnas 1–4): módulos SIN huecos que completan
                                                // el mueble (alturas en huecos; espejan las filas 3 y 4 de la
                                                // tab 1).
    // Módulos de BOTELLAS PARADAS: una sola fila interna de 5 huecos verticales
    // (cinco vinos parados). Coordenadas [fila, columna]; la columna 5 es la
    // fila 1 de la columna final (que si no sería ciega).
    paradas: [
      [1, 2], [1, 3], [1, 4], [1, 5],
      [2, 1], [2, 3],
    ],
  }
};

const VARIETALES = [
  { grupo: 'Tintos', items: ['Malbec', 'Cabernet Sauvignon', 'Cabernet Franc', 'Merlot', 'Syrah', 'Pinot Noir', 'Bonarda', 'Tempranillo', 'Tannat', 'Petit Verdot', 'Sangiovese', 'Nebbiolo', 'Garnacha', 'Carménère', 'Zinfandel', 'Barbera', 'Montepulciano', 'Monastrell', 'Pinotage', 'Touriga Nacional'] },
  { grupo: 'Blancos', items: ['Chardonnay', 'Sauvignon Blanc', 'Torrontés', 'Viognier', 'Chenin Blanc', 'Riesling', 'Semillón', 'Pinot Grigio', 'Gewürztraminer', 'Albariño', 'Verdejo', 'Moscatel', 'Marsanne', 'Roussanne'] },
  { grupo: 'Genéricos', items: ['Rosado', 'Espumante', 'Blend/Corte'] },
];

/* Color por varietal para el hueco ocupado. Agrupados por familia (tintos en
   gama vino/púrpura/tierra, blancos en dorado/verde/ámbar, genéricos aparte)
   pero elegidos para diferenciarse bien entre sí. Ajustable a gusto. */
const VARIETAL_COLOR = {
  // Tintos
  'Malbec': '#783695', 'Cabernet Sauvignon': '#6b172b', 'Cabernet Franc': '#ab432b',
  'Merlot': '#9e284b', 'Syrah': '#3d1836', 'Pinot Noir': '#bf514d', 'Bonarda': '#8f321c',
  'Tempranillo': '#7b2931', 'Tannat': '#472554', 'Petit Verdot': '#312248',
  'Sangiovese': '#bd3f23', 'Nebbiolo': '#a44e24', 'Garnacha': '#cc4527', 'Carménère': '#5b3721',
  'Zinfandel': '#ac1f34', 'Barbera': '#8a204e', 'Montepulciano': '#591f2e', 'Monastrell': '#4b2c4b',
  'Pinotage': '#763b40', 'Touriga Nacional': '#572768',
  // Blancos (texto oscuro por luminancia)
  'Chardonnay': '#e2a32f', 'Sauvignon Blanc': '#7aad45', 'Torrontés': '#eacd47', 'Viognier': '#ea862e',
  'Chenin Blanc': '#b5c243', 'Riesling': '#f1dd53', 'Semillón': '#c4912a', 'Pinot Grigio': '#a3ba80',
  'Gewürztraminer': '#e89258', 'Albariño': '#91cb67', 'Verdejo': '#6aa339', 'Moscatel': '#e8b53c',
  'Marsanne': '#c6a44f', 'Roussanne': '#da8931',
  // Genéricos
  'Rosado': '#e97b9c', 'Espumante': '#d9c261', 'Blend/Corte': '#85557d',
};
const VARIETAL_FALLBACK = '#6a5f52'; // "Otro"/texto libre/desconocido: pizarra cálida

const DB_NAME = 'cava';
const DB_VERSION = 2;
const DIRTY_KEY = 'cava-dirty'; // hay cambios sin respaldar (ver §12)
const GITHUB_KEY = 'cava-github'; // config de sincronización con GitHub (ver §12)
const SYNC_SHA_KEY = 'cava-sync-sha'; // sha del último respaldo remoto sincronizado (ver §12)
const BACKUP_SCHEMA_VERSION = 2; // v2 agrega `colores`; se siguen aceptando respaldos v1
const BACKUP_FILENAME = 'vinos-backup.json'; // nombre fijo: se reemplaza siempre el mismo archivo (ver §12)
const SLOT_ID_RE = /^t([12])-m(\d{2})-(\d{2})-s(\d{2})-(\d{2})$/;

/* ============================================================================
   2. UTILIDADES GENERALES
   ============================================================================ */
const $ = (sel) => document.querySelector(sel);

/** Normaliza texto para búsquedas: minúsculas y sin acentos ("Semillón" ~ "semillon"). */
function norm(s) {
  return String(s == null ? '' : s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/** Luminancia relativa (0..1) de un color #rrggbb, para elegir texto claro/oscuro. */
function hexLum(hex) {
  const n = hex.slice(1);
  const chan = (i) => {
    const c = parseInt(n.substr(i, 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * chan(0) + 0.7152 * chan(2) + 0.0722 * chan(4);
}

/** Color efectivo de un varietal: primero el override guardado por el usuario
    (state.colores), luego la paleta por defecto y, si no, el fallback neutro.
    Cambiar el override repinta TODOS los vinos de ese varietal (§11). */
function effectiveVarietalColor(varietal) {
  return state.colores.get(varietal) || VARIETAL_COLOR[varietal] || VARIETAL_FALLBACK;
}

/** Colores del hueco ocupado (fondo/borde/texto) según el varietal del vino. */
function slotColors(varietal) {
  const bg = effectiveVarietalColor(varietal);
  return {
    bg,
    fg: hexLum(bg) > 0.42 ? '#1c1a17' : '#ffffff',
    border: `color-mix(in srgb, ${bg} 62%, #000)`,
  };
}

/** Sigla por defecto: inicial de cada palabra del nombre (máx. 3), en mayúsculas.
 *  "Don David" → "DD"; "Nicasia Single Vineyard" → "NSV". Editable en el form. */
function defaultSigla(nombre) {
  const words = norm(nombre).trim().split(/\s+/).filter(Boolean);
  return words.map((w) => w.charAt(0)).join('').slice(0, 3).toUpperCase();
}

function newId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
}

function fmtFecha(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || '');
  return m ? `${m[3]}/${m[2]}/${m[1]}` : String(iso || '');
}

function fmtPrecio(n) {
  return '$ ' + Number(n).toLocaleString('es-AR', { maximumFractionDigits: 2 });
}

/* ============================================================================
   3. INDEXEDDB
   Esquema (versión 1):
     - "vinos": keyPath "id" (string UUID). Campos: nombre, bodega,
       varietal y opcionales sigla, anio, precioCompra, fechaCompra.
     - "slots": keyPath "id" (string derivado de la posición física, ver §4).
       Campos: vinoId (id de "vinos") o null si el hueco está vacío.
   Sin índices: el dataset completo (≈460 slots + catálogo) se carga en
   memoria al arrancar y todo filtrado/conteo se hace ahí.
   ============================================================================ */

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('vinos')) db.createObjectStore('vinos', { keyPath: 'id' });
      if (!db.objectStoreNames.contains('slots')) db.createObjectStore('slots', { keyPath: 'id' });
      if (!db.objectStoreNames.contains('colores')) db.createObjectStore('colores', { keyPath: 'varietal' });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('No se pudo abrir IndexedDB'));
    request.onblocked = () => reject(new Error('IndexedDB bloqueada por otra pestaña'));
  });
}

/** Promisifica un IDBRequest. */
function req(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Ejecuta fn(tx) dentro de una transacción y resuelve recién en oncomplete.
 * Es la primitiva de atomicidad de la app: si cualquier operación falla,
 * IndexedDB revierte la transacción entera (clave para importar respaldos
 * o borrar un vino + vaciar sus huecos sin estados a medias).
 */
function withTx(db, storeNames, mode, fn) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeNames, mode);
    let out;
    tx.oncomplete = () => resolve(out);
    tx.onerror = () => reject(tx.error || new Error('Error de transacción'));
    tx.onabort = () => reject(tx.error || new Error('Transacción abortada'));
    try {
      out = fn(tx);
      // Si fn devolvió una promesa y la transacción aborta, evitá un
      // "unhandled rejection" (el reject de arriba ya informa el error).
      if (out && typeof out.catch === 'function') out.catch(() => {});
    } catch (err) {
      try { tx.abort(); } catch (_) { /* ya abortada */ }
      reject(err);
    }
  });
}

/* ============================================================================
   4. SLOTS: IDS Y GENERACIÓN DEL LAYOUT
   Id de slot: "t{tab}-m{fila}-{col}-s{fila}-{col}", coordenadas 1-based con
   dos dígitos (p. ej. "t1-m05-02-s03-04"). El orden lexicográfico coincide
   con el orden físico. El módulo alto de la tab 2 es simplemente el módulo
   (fila 2, columna 5) con filas internas 01–11: solo el render sabe que
   ocupa tres filas de la grilla.
   ============================================================================ */

const pad2 = (n) => String(n).padStart(2, '0');

function makeSlotId(tab, modFila, modCol, slotFila, slotCol) {
  return `t${tab}-m${pad2(modFila)}-${pad2(modCol)}-s${pad2(slotFila)}-${pad2(slotCol)}`;
}

function parseSlotId(id) {
  const m = SLOT_ID_RE.exec(id);
  if (!m) return null;
  return { tab: +m[1], modFila: +m[2], modCol: +m[3], slotFila: +m[4], slotCol: +m[5] };
}

/** ¿El módulo (fila, col) es de botellas paradas en esa tab? (ver LAYOUT.tabN.paradas) */
function esParada(tab, modFila, modCol) {
  const L = tab === 1 ? LAYOUT.tab1 : LAYOUT.tab2;
  return (L.paradas || []).some(([f, c]) => f === modFila && c === modCol);
}

/** ¿El módulo (fila, col) de la tab 1 está inhabilitado (ciego, sin huecos)? */
function esCiegoTab1(modFila, modCol) {
  return LAYOUT.tab1.ciegos.some(([f, c]) => f === modFila && c === modCol);
}

/** ¿El módulo (fila, col) de la tab 1 tiene minibar en sus primeras columnas? */
function esMinibarTab1(modFila, modCol) {
  return (LAYOUT.tab1.minibares || []).some(([f, c]) => f === modFila && c === modCol);
}

function describeSlot(id) {
  const p = parseSlotId(id);
  if (!p) return id;
  const nombreTab = p.tab === 1 ? 'Principal' : 'Secundaria';
  // Módulo alto de la secundaria: la fila extra debajo de sus filas acostadas
  // es la de botellas paradas (ver LAYOUT.tab2.columnaFinal).
  const cf = LAYOUT.tab2.columnaFinal;
  const enParadaFinal = p.tab === 2 && p.modCol === LAYOUT.tab2.modulos.cols + 1 &&
    p.modFila === 2 && cf.paradasAlto && p.slotFila > (cf.freezer || 0) + cf.filas;
  const parado = esParada(p.tab, p.modFila, p.modCol) || enParadaFinal;
  const hueco = parado ? `Botella parada ${p.slotCol}` : `Hueco fila ${p.slotFila}, columna ${p.slotCol}`;
  return `Cava ${nombreTab} · Módulo fila ${p.modFila}, columna ${p.modCol} · ${hueco}`;
}

/**
 * Lista los módulos de una tab según LAYOUT, con su subcuadrícula interna.
 * Tab 1: grilla completa; la última fila usa la subcuadrícula "ultimaFila".
 * Tab 2: grilla de módulos normales + el módulo alto en la columna final.
 */
function modulesOf(tab) {
  const out = [];
  if (tab === 1) {
    const L = LAYOUT.tab1;
    for (let mf = 1; mf <= L.modulos.filas; mf++) {
      for (let mc = 1; mc <= L.modulos.cols; mc++) {
        // El alto de cada fila lo fija su subcuadrícula normal (la última fila
        // es más alta); los módulos parados y ciegos la heredan para no
        // descuadrar el mueble.
        const inner = (mf === L.modulos.filas) ? L.ultimaFila : L.slotsPorModulo;
        if (esCiegoTab1(mf, mc)) {
          // Inhabilitado: estructura del mueble sin huecos (no genera registros).
          out.push({ tab, modFila: mf, modCol: mc, inner, alto: false, ciego: true });
          continue;
        }
        if (esParada(tab, mf, mc)) {
          // Botellas paradas: una sola fila interna de huecos verticales.
          // altoHuecos = cuántos huecos acostados mide de alto (el render
          // estira esa única fila para que el módulo mida igual que uno normal).
          out.push({
            tab, modFila: mf, modCol: mc,
            inner: { cols: L.slotsPorModulo.cols, filas: 1 },
            alto: false, parado: true, altoHuecos: inner.filas,
          });
          continue;
        }
        // Minibar: submódulo gris oscuro en las primeras columnas; las
        // restantes siguen siendo de vino (ver slotsOfModule y buildTab).
        const minibar = esMinibarTab1(mf, mc) ? { cols: L.minibarCols } : null;
        out.push({ tab, modFila: mf, modCol: mc, inner, alto: false, minibar });
      }
    }
  } else {
    const L = LAYOUT.tab2;
    for (let mf = 1; mf <= L.modulos.filas; mf++) {
      for (let mc = 1; mc <= L.modulos.cols; mc++) {
        if (esParada(tab, mf, mc)) {
          // Botellas paradas: una sola fila interna de 5 huecos verticales,
          // del alto de un módulo normal (slotsPorModulo.filas).
          out.push({
            tab, modFila: mf, modCol: mc,
            inner: { cols: L.slotsPorModulo.cols, filas: 1 },
            alto: false, parado: true, altoHuecos: L.slotsPorModulo.filas,
          });
          continue;
        }
        out.push({ tab, modFila: mf, modCol: mc, inner: L.slotsPorModulo, alto: false });
      }
    }
    // Columna final: la fila 1 es un módulo de botellas paradas (o ciego si no
    // está en la lista) y el módulo alto ocupa las últimas 3 filas (2–4).
    const finalCol = L.modulos.cols + 1;
    if (esParada(tab, 1, finalCol)) {
      out.push({
        tab, modFila: 1, modCol: finalCol,
        inner: { cols: L.slotsPorModulo.cols, filas: 1 },
        alto: false, parado: true, altoHuecos: L.slotsPorModulo.filas,
      });
    } else {
      out.push({
        tab, modFila: 1, modCol: finalCol,
        inner: { cols: L.slotsPorModulo.cols, filas: L.slotsPorModulo.filas }, alto: false, ciego: true,
      });
    }
    out.push({ tab, modFila: 2, modCol: finalCol, inner: L.columnaFinal, alto: true });
    // Filas ciegas: completan el mueble por debajo, sin huecos de vino
    // (solo columnas 1–4: la final ya está cubierta por el módulo alto).
    L.filasCiegas.forEach((filas, i) => {
      for (let mc = 1; mc <= L.modulos.cols; mc++) {
        out.push({
          tab, modFila: L.modulos.filas + 1 + i, modCol: mc,
          inner: { cols: L.slotsPorModulo.cols, filas }, alto: false, ciego: true,
        });
      }
    });
  }
  return out;
}

/**
 * Coordenadas [slotFila, slotCol] de los huecos de un módulo (vacío si es
 * ciego). Un módulo alto con `paradasAlto` agrega, debajo de sus filas
 * acostadas, una fila extra de huecos parados (uno por columna). Fuente única
 * para el render (buildTab) y la reconciliación (forEachExpectedSlot).
 */
function slotsOfModule(mod) {
  const coords = [];
  if (mod.ciego) return coords; // solo estructura visual: sin huecos ni registros
  // Filas superiores reservadas sin huecos (el freezer de la heladera): los
  // huecos arrancan debajo, conservando su número de fila físico.
  const off = mod.inner.freezer || 0;
  for (let sf = 1; sf <= mod.inner.filas; sf++) {
    for (let sc = 1; sc <= mod.inner.cols; sc++) coords.push([sf + off, sc]);
  }
  if (mod.inner.paradasAlto) {
    const sf = off + mod.inner.filas + 1;
    for (let sc = 1; sc <= mod.inner.cols; sc++) coords.push([sf, sc]);
  }
  return coords;
}

/** Recorre todos los huecos esperados según LAYOUT (fuente de verdad de la geometría). */
function forEachExpectedSlot(cb) {
  for (const mod of [...modulesOf(1), ...modulesOf(2)]) {
    for (const [sf, sc] of slotsOfModule(mod)) {
      cb({ ...mod, slotFila: sf, slotCol: sc, id: makeSlotId(mod.tab, mod.modFila, mod.modCol, sf, sc) });
    }
  }
}

function expectedSlotIds() {
  const ids = new Set();
  forEachExpectedSlot((s) => ids.add(s.id));
  return ids;
}

/* ============================================================================
   5. ESTADO EN MEMORIA
   ============================================================================ */
const state = {
  db: null,
  vinos: new Map(),      // id -> vino
  slots: new Map(),      // slotId -> { id, vinoId }
  colores: new Map(),    // varietal -> color hex (override del usuario, ver §11)
  slotEls: new Map(),    // slotId -> { btn, box, sigla, anio } (cache del DOM del mapa)
  currentSlotId: null,   // hueco abierto en el diálogo de posición
  pendingSlotId: null,   // hueco a asignar cuando se crea un vino desde el selector
  editingVinoId: null,   // vino en edición en el formulario (null = alta)
  mapScrollLeft: 0,      // página del carrusel al salir del mapa (se restaura al volver)
  filters: { q: '', bodega: '', origen: '', varietal: '', anio: '' },     // filtros del catálogo (§10)
  sort: 'nombre',                                              // orden del catálogo (§10)
  mapFilters: { q: '', bodega: '', origen: '', varietal: '', anio: '' },  // filtros del MAPA (§8), independientes
};

/* ============================================================================
   6. CAPA DE DATOS
   Patrón de escritura: primero IndexedDB (await), después el estado en
   memoria, después el DOM. Así memoria y disco nunca divergen.
   ============================================================================ */

/**
 * Reconciliación idempotente de slots contra LAYOUT. Corre en cada arranque
 * y cubre: primera carga (crea todo), cambios de LAYOUT y post-importación.
 */
async function reconcileSlots() {
  const expected = expectedSlotIds();
  await withTx(state.db, ['slots', 'vinos'], 'readwrite', (tx) => {
    const store = tx.objectStore('slots');
    return Promise.all([req(store.getAll()), req(tx.objectStore('vinos').getAllKeys())]).then(([existing, vinoKeys]) => {
      const vinoIds = new Set(vinoKeys);
      const have = new Set();
      let huerfanos = 0;
      for (const slot of existing) {
        have.add(slot.id);
        // Auto-sana referencias colgadas: si apunta a un vino que ya no existe
        // (borrado sin limpiar la posición), se vacía. Si no, quedaría apuntando
        // a la nada y rompería el respaldo al exportarse (ver deleteVino).
        if (slot.vinoId != null && !vinoIds.has(slot.vinoId)) {
          store.put({ id: slot.id, vinoId: null });
          slot.vinoId = null;
        }
        if (!expected.has(slot.id)) {
          if (slot.vinoId == null) store.delete(slot.id); // sobrante vacío: limpieza segura
          else huerfanos++;                               // sobrante con vino: se conserva (ver §1)
        }
      }
      for (const id of expected) {
        if (!have.has(id)) store.put({ id, vinoId: null });
      }
      if (huerfanos > 0) {
        console.warn(`Cava: ${huerfanos} hueco(s) con vino quedaron fuera del LAYOUT actual; se conservan en la base y en los respaldos pero no se muestran.`);
      }
    });
  });
}

/** Carga ambos stores a memoria. Los slots fuera del LAYOUT no se cargan (no se renderizan). */
async function loadAll() {
  const expected = expectedSlotIds();
  const [vinos, slots, colores] = await withTx(state.db, ['vinos', 'slots', 'colores'], 'readonly', (tx) =>
    Promise.all([
      req(tx.objectStore('vinos').getAll()),
      req(tx.objectStore('slots').getAll()),
      req(tx.objectStore('colores').getAll()),
    ])
  );
  state.vinos = new Map(vinos.map((v) => [v.id, v]));
  state.slots = new Map(slots.filter((s) => expected.has(s.id)).map((s) => [s.id, s]));
  state.colores = new Map(colores.map((c) => [c.varietal, c.color]));
}

async function saveVino(vino) {
  await withTx(state.db, 'vinos', 'readwrite', (tx) => { tx.objectStore('vinos').put(vino); });
  state.vinos.set(vino.id, vino);
  setDirty(true);
}

/** Guarda el color de un varietal (override). Repinta todos sus vinos vía slotColors. */
async function setVarietalColor(varietal, color) {
  await withTx(state.db, 'colores', 'readwrite', (tx) => { tx.objectStore('colores').put({ varietal, color }); });
  state.colores.set(varietal, color);
  setDirty(true);
}

/** Borra un vino y vacía sus huecos en UNA transacción (todo o nada). */
async function deleteVino(vinoId) {
  const slotIds = [...state.slots.values()].filter((s) => s.vinoId === vinoId).map((s) => s.id);
  await withTx(state.db, ['vinos', 'slots'], 'readwrite', (tx) => {
    tx.objectStore('vinos').delete(vinoId);
    // Vaciar TODAS las posiciones que lo referencian, incluidas las que hayan
    // quedado fuera del layout actual (no están en state.slots). Si no, quedan
    // colgadas apuntando a un vino ya borrado y rompen el respaldo al importar.
    const slots = tx.objectStore('slots');
    return req(slots.getAll()).then((all) => {
      for (const s of all) {
        if (s.vinoId === vinoId) slots.put({ id: s.id, vinoId: null });
      }
    });
  });
  state.vinos.delete(vinoId);
  for (const id of slotIds) {
    state.slots.get(id).vinoId = null;
    updateSlotEl(id);
  }
  setDirty(true);
  return slotIds.length;
}

async function setSlotVino(slotId, vinoId) {
  await withTx(state.db, 'slots', 'readwrite', (tx) => { tx.objectStore('slots').put({ id: slotId, vinoId }); });
  const slot = state.slots.get(slotId);
  if (slot) slot.vinoId = vinoId;
  updateSlotEl(slotId);
  renderVinos(); // refresca los contadores de ocupación del catálogo
  setDirty(true);
}

/** Cuántos huecos ocupa cada vino: Map<vinoId, cantidad>. */
function occupancyMap() {
  const map = new Map();
  for (const slot of state.slots.values()) {
    if (slot.vinoId) map.set(slot.vinoId, (map.get(slot.vinoId) || 0) + 1);
  }
  return map;
}

/* ============================================================================
   7. ROUTER (hash)
   ============================================================================ */
const ROUTES = {
  '#/cava': { view: 'cava' },
  '#/vinos': { view: 'vinos' },
  '#/dashboard': { view: 'dashboard' },
};

function applyRoute() {
  let hash = location.hash;
  if (!ROUTES[hash]) {
    // Cubre también los hashes viejos "#/cava/principal" y "#/cava/secundaria".
    hash = '#/cava';
    history.replaceState(null, '', hash);
  }
  const view = ROUTES[hash].view;
  const enCava = view === 'cava';

  // Un elemento oculto pierde su scroll: guardar la página del carrusel al
  // salir del mapa y restaurarla al volver.
  const mapArea = $('.map-area');
  const viewCava = $('#view-cava');
  if (!viewCava.hidden && !enCava) state.mapScrollLeft = mapArea.scrollLeft;

  viewCava.hidden = !enCava;
  $('#view-vinos').hidden = view !== 'vinos';
  $('#view-dashboard').hidden = view !== 'dashboard';

  // Header: cada vista muestra los botones a las OTRAS dos (se oculta el de la
  // vista actual). Orden en el DOM: dashboard · volver · vinos.
  $('#btn-dashboard').hidden = view === 'dashboard';
  $('#btn-volver').hidden = enCava; // "Volver a la Cava": oculto solo en la cava
  $('#btn-vinos').hidden = view === 'vinos';

  // El dashboard se recalcula al entrar (los datos pudieron cambiar en otra vista).
  if (view === 'dashboard') renderDashboard();

  if (enCava) {
    mapArea.scrollLeft = state.mapScrollLeft;
    // El evento scroll no se dispara si el valor no cambió (p. ej. página 0):
    // resincronizar los chevrones explícitamente.
    syncMapNav();
  }
}

function wireRouter() {
  $('#btn-dashboard').addEventListener('click', () => { location.hash = '#/dashboard'; });
  $('#btn-vinos').addEventListener('click', () => { location.hash = '#/vinos'; });
  $('#btn-volver').addEventListener('click', () => { location.hash = '#/cava'; });
  window.addEventListener('hashchange', applyRoute);
  applyRoute();
}

/* ============================================================================
   7b. DASHBOARD
   Vista de métricas: ocupación, distribución por varietal, por cava y por
   bodega. Todo respeta el switch de orientación (todas / acostadas / paradas).
   Los gráficos se dibujan con SVG inline (sin librerías, a tono con el resto).
   ============================================================================ */
const DASH = { orient: 'todas' };            // 'todas' | 'acostada' | 'parada'
const DASH_TOP_VARIETALES = 3;               // slices de la torta antes de agrupar en "Otros" (top 3 + Otros = leyenda 2×2)
const DASH_TOP_BODEGAS = 6;                  // barras de bodegas
const SVGNS = 'http://www.w3.org/2000/svg';

function el(tag, cls, text) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text != null) n.textContent = text;
  return n;
}
function svgEl(name, attrs) {
  const node = document.createElementNS(SVGNS, name);
  for (const k in attrs) node.setAttribute(k, String(attrs[k]));
  return node;
}

/** Clasifica cada hueco esperado como 'acostada' u 'parada' según el LAYOUT. */
function slotOrientations() {
  const map = new Map();
  forEachExpectedSlot((s) => {
    const off = s.inner.freezer || 0;
    // La fila extra de la heladera (paradasAlto) son botellas paradas; el resto
    // de sus filas y las de los módulos normales son acostadas.
    const paradaAlto = s.inner.paradasAlto && s.slotFila === off + s.inner.filas + 1;
    map.set(s.id, (s.parado || paradaAlto) ? 'parada' : 'acostada');
  });
  return map;
}

/** Agrega las métricas del dashboard para el switch de orientación activo. */
function dashboardStats() {
  const orient = slotOrientations();
  const stats = {
    total: 0, ocupadas: 0,
    porCava: { 1: { total: 0, ocup: 0 }, 2: { total: 0, ocup: 0 } },
    porVarietal: new Map(),   // varietal -> cantidad de botellas ubicadas
    porBodega: new Map(),     // bodega -> cantidad de botellas ubicadas
    vinos: new Set(),         // vinos distintos ubicados
  };
  for (const slot of state.slots.values()) {
    const o = orient.get(slot.id);
    if (!o) continue;
    if (DASH.orient !== 'todas' && o !== DASH.orient) continue;
    const tab = parseSlotId(slot.id)?.tab;
    stats.total++;
    if (stats.porCava[tab]) stats.porCava[tab].total++;
    if (slot.vinoId) {
      const vino = state.vinos.get(slot.vinoId);
      stats.ocupadas++;
      if (stats.porCava[tab]) stats.porCava[tab].ocup++;
      stats.vinos.add(slot.vinoId);
      const varietal = (vino && vino.varietal) || 'Sin varietal';
      const bodega = (vino && vino.bodega) || 'Sin bodega';
      stats.porVarietal.set(varietal, (stats.porVarietal.get(varietal) || 0) + 1);
      stats.porBodega.set(bodega, (stats.porBodega.get(bodega) || 0) + 1);
    }
  }
  return stats;
}

/** Anillo de progreso de un solo valor (ocupación). */
function ringSVG(pct, { size = 132, thickness = 15 } = {}) {
  const r = (size - thickness) / 2, c = 2 * Math.PI * r, cx = size / 2;
  const p = Math.max(0, Math.min(1, pct / 100));
  const svg = svgEl('svg', { viewBox: `0 0 ${size} ${size}`, class: 'dash-ring', 'aria-hidden': 'true' });
  svg.appendChild(svgEl('circle', { cx, cy: cx, r, fill: 'none', stroke: 'var(--dash-track)', 'stroke-width': thickness }));
  if (p > 0) {
    svg.appendChild(svgEl('circle', {
      cx, cy: cx, r, fill: 'none', stroke: 'var(--primary)', 'stroke-width': thickness, 'stroke-linecap': 'round',
      'stroke-dasharray': `${c * p} ${c}`, transform: `rotate(-90 ${cx} ${cx})`,
    }));
  }
  return svg;
}

/** Torta/donut de varios segmentos. segments: [{ label, value, color }]. */
function donutSVG(segments, { size = 132, thickness = 22 } = {}) {
  const total = segments.reduce((s, x) => s + x.value, 0);
  const r = (size - thickness) / 2, c = 2 * Math.PI * r, cx = size / 2;
  const svg = svgEl('svg', { viewBox: `0 0 ${size} ${size}`, class: 'dash-donut', 'aria-hidden': 'true' });
  if (total === 0) {
    svg.appendChild(svgEl('circle', { cx, cy: cx, r, fill: 'none', stroke: 'var(--dash-track)', 'stroke-width': thickness }));
    return svg;
  }
  let acc = 0;
  for (const seg of segments) {
    if (seg.value <= 0) continue;
    const dash = (seg.value / total) * c;
    svg.appendChild(svgEl('circle', {
      cx, cy: cx, r, fill: 'none', stroke: seg.color, 'stroke-width': thickness,
      'stroke-dasharray': `${dash} ${c - dash}`, 'stroke-dashoffset': -acc,
      transform: `rotate(-90 ${cx} ${cx})`,
    }));
    acc += dash;
  }
  return svg;
}

function dashCard(title, extraClass) {
  const card = el('div', 'dash-card' + (extraClass ? ' ' + extraClass : ''));
  if (title) card.appendChild(el('h3', 'dash-card-title', title));
  return card;
}
function dashEmpty(msg) {
  return el('p', 'dash-empty', msg);
}
/** Una barra horizontal con nombre, valor a la derecha y relleno proporcional. */
function barRow(name, valueText, pct, color) {
  const row = el('div', 'dash-bar-row');
  const head = el('div', 'dash-bar-head');
  head.append(el('span', 'dash-bar-name', name), el('span', 'dash-bar-val', valueText));
  const track = el('div', 'dash-bar-track');
  const fill = el('div', 'dash-bar-fill');
  fill.style.width = `${Math.max(0, Math.min(100, pct))}%`;
  fill.style.background = color;
  track.appendChild(fill);
  row.append(head, track);
  return row;
}

function varietalCard(s) {
  const card = dashCard('Distribución por varietal');
  const entries = [...s.porVarietal.entries()].sort((a, b) => b[1] - a[1]);
  if (entries.length === 0) {
    card.appendChild(dashEmpty('Todavía no hay botellas ubicadas.'));
    return card;
  }
  // La torta se mantiene legible: top-N varietales + un slice "Otros" agrupado.
  const top = entries.slice(0, DASH_TOP_VARIETALES);
  const rest = entries.slice(DASH_TOP_VARIETALES);
  const segments = top.map(([v, n]) => ({ label: v, value: n, color: effectiveVarietalColor(v) }));
  if (rest.length) {
    const otros = rest.reduce((a, [, n]) => a + n, 0);
    segments.push({ label: `Otros (${rest.length})`, value: otros, color: 'var(--dash-otros)' });
  }
  const total = segments.reduce((a, x) => a + x.value, 0);

  const chart = el('div', 'dash-chart-row');
  const donutWrap = el('div', 'dash-donut-wrap');
  donutWrap.appendChild(donutSVG(segments));
  const lbl = el('div', 'dash-ring-label');
  lbl.append(el('span', 'dash-ring-pct', String(total)), el('span', 'dash-ring-sub', total === 1 ? 'botella' : 'botellas'));
  donutWrap.appendChild(lbl);
  chart.appendChild(donutWrap);

  const legend = el('ul', 'dash-legend');
  for (const seg of segments) {
    const li = el('li', 'dash-legend-item');
    const dot = el('span', 'dash-legend-dot');
    dot.style.background = seg.color;
    li.append(dot, el('span', 'dash-legend-name', seg.label),
      el('span', 'dash-legend-val', `${seg.value} · ${Math.round((seg.value / total) * 100)}%`));
    legend.appendChild(li);
  }
  chart.appendChild(legend);
  card.appendChild(chart);
  return card;
}

function cavaCard(s) {
  const card = dashCard('Ocupación por cava');
  const rows = [['Principal', s.porCava[1]], ['Secundaria', s.porCava[2]]].filter(([, d]) => d.total > 0);
  if (rows.length === 0) {
    card.appendChild(dashEmpty('No hay posiciones para este filtro.'));
    return card;
  }
  const list = el('div', 'dash-bars');
  for (const [name, d] of rows) {
    const p = d.total ? Math.round((d.ocup / d.total) * 100) : 0;
    list.appendChild(barRow(name, `${d.ocup}/${d.total} · ${p}%`, p, 'var(--primary)'));
  }
  card.appendChild(list);
  return card;
}

function bodegaCard(s) {
  const card = dashCard('Bodegas con más botellas', 'dash-wide');
  const entries = [...s.porBodega.entries()].sort((a, b) => b[1] - a[1]);
  if (entries.length === 0) {
    card.appendChild(dashEmpty('Todavía no hay botellas ubicadas.'));
    return card;
  }
  const top = entries.slice(0, DASH_TOP_BODEGAS);
  const max = top[0][1];
  const list = el('div', 'dash-bars');
  for (const [name, n] of top) {
    list.appendChild(barRow(name, `${n} ${n === 1 ? 'botella' : 'botellas'}`, (n / max) * 100, 'var(--wood)'));
  }
  card.appendChild(list);
  return card;
}

function renderDashboard() {
  const grid = $('#dash-grid');
  if (!grid) return;
  const s = dashboardStats();
  const pct = s.total ? Math.round((s.ocupadas / s.total) * 100) : 0;
  const libres = s.total - s.ocupadas;
  grid.textContent = '';

  // 1) Ocupación (anillo) — el número que responde "¿cuánta cava me queda?".
  const hero = dashCard('Ocupación', 'dash-card--hero');
  const ringWrap = el('div', 'dash-ring-wrap');
  ringWrap.appendChild(ringSVG(pct));
  const ringLbl = el('div', 'dash-ring-label');
  ringLbl.append(el('span', 'dash-ring-pct', `${pct}%`), el('span', 'dash-ring-sub', 'ocupación'));
  ringWrap.appendChild(ringLbl);
  hero.append(ringWrap, el('p', 'dash-hero-note', `${s.ocupadas} de ${s.total} posiciones ocupadas`));
  grid.appendChild(hero);

  // 2) Números clave.
  const tiles = el('div', 'dash-tiles');
  for (const [label, value] of [
    ['Posiciones', s.total], ['Ocupadas', s.ocupadas], ['Libres', libres], ['Vinos distintos', s.vinos.size],
  ]) {
    const t = el('div', 'dash-tile');
    t.append(el('span', 'dash-tile-label', label), el('span', 'dash-tile-value', String(value)));
    tiles.appendChild(t);
  }
  grid.appendChild(tiles);

  // 3) Composición y desgloses.
  grid.append(varietalCard(s), cavaCard(s), bodegaCard(s));
}

function wireDashboard() {
  const seg = $('#view-dashboard .seg');
  if (!seg) return;
  seg.addEventListener('click', (e) => {
    const btn = e.target.closest('.seg-btn');
    if (!btn || btn.classList.contains('is-active')) return;
    DASH.orient = btn.dataset.orient;
    for (const b of seg.querySelectorAll('.seg-btn')) {
      const on = b === btn;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    }
    renderDashboard();
  });
}

/* ============================================================================
   8. MAPA
   Se construye UNA vez desde LAYOUT; después solo se actualizan huecos
   individuales (updateSlotEl) — nunca se re-renderiza entero.
   ============================================================================ */

function buildMaps() {
  buildTab(1, $('#map-t1'));
  buildTab(2, $('#map-t2'));
}

function buildTab(tab, panelEl) {
  const frag = document.createDocumentFragment();
  for (const mod of modulesOf(tab)) {
    const inner = mod.inner;
    const modEl = document.createElement('div');
    modEl.className = 'mod'
      + (mod.ciego ? ' mod--ciego' : '')
      + (mod.parado ? ' mod--parado' : '')
      + (inner.heladera ? ' mod--heladera' : ''); // columna final con forma de heladera (blanca + freezer)
    // La subcuadrícula interna sale de LAYOUT (única fuente de verdad).
    // Tracks fijos de --slot px: cada hueco es un cuadrado exacto (ver §7 del CSS).
    // En los módulos ciegos los tracks vacíos igual dan el tamaño del módulo.
    // En los de botellas paradas, la única fila interna mide altoHuecos
    // cuadrados: mismo alto exterior que un módulo normal, huecos verticales.
    modEl.style.gridTemplateColumns = `repeat(${inner.cols}, var(--slot))`;
    // Filas internas: los módulos de botellas paradas son una única fila de
    // altoHuecos cuadrados; el resto se arma por bandas: freezer (sin huecos),
    // las filas acostadas de LAYOUT y una banda de parados abajo, según existan.
    if (mod.parado) {
      modEl.style.gridTemplateRows = `calc(${mod.altoHuecos} * var(--slot))`;
    } else {
      const bandas = [];
      if (inner.freezer) bandas.push(`calc(${inner.freezer} * var(--slot))`);
      bandas.push(`repeat(${inner.filas}, var(--slot))`);
      if (inner.paradasAlto) bandas.push(`calc(${inner.paradasAlto} * var(--slot))`);
      modEl.style.gridTemplateRows = bandas.join(' ');
    }
    // Posición explícita en la grilla de módulos; el módulo alto ocupa 3 filas.
    modEl.style.gridColumn = String(mod.modCol);
    modEl.style.gridRow = mod.alto ? `${mod.modFila} / span 3` : String(mod.modFila);

    // Freezer: banda superior sin huecos, con la línea divisoria de la heladera.
    // Ocupa la primera fila del grid para que los huecos arranquen debajo.
    if (inner.freezer) {
      const fz = document.createElement('div');
      fz.className = 'mod-freezer';
      fz.setAttribute('aria-hidden', 'true');
      modEl.appendChild(fz);
    }

    // Minibar: submódulo gris oscuro que cubre las primeras columnas del
    // módulo (todas sus filas) y contiene su propia subcuadrícula de huecos.
    // Los huecos de esas columnas se cuelgan del minibar; la columna de vino
    // de la derecha va directo en la grilla del módulo (madera).
    const minibarCols = mod.minibar ? mod.minibar.cols : 0;
    let mbEl = null;
    if (mod.minibar) {
      mbEl = document.createElement('div');
      mbEl.className = 'mod-minibar';
      mbEl.style.gridColumn = `1 / ${minibarCols + 1}`;
      mbEl.style.gridRow = '1 / -1';
      mbEl.style.gridTemplateColumns = `repeat(${minibarCols}, 1fr)`;
      mbEl.style.gridTemplateRows = `repeat(${mod.inner.filas}, 1fr)`;
      modEl.appendChild(mbEl);
    }

    for (const [sf, sc] of slotsOfModule(mod)) {
      const id = makeSlotId(tab, mod.modFila, mod.modCol, sf, sc);
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'slot';
      btn.dataset.slotId = id;
      const box = document.createElement('span');
      box.className = 'slot-v';
      const sigla = document.createElement('span');
      sigla.className = 'slot-sigla';
      const anio = document.createElement('span');
      anio.className = 'slot-anio';
      box.appendChild(sigla);
      box.appendChild(anio);
      btn.appendChild(box);
      // Los huecos de las columnas del minibar van dentro de su subcuadrícula.
      (mbEl && sc <= minibarCols ? mbEl : modEl).appendChild(btn);
      state.slotEls.set(id, { btn, box, sigla, anio });
    }
    frag.appendChild(modEl);
  }
  panelEl.appendChild(frag);

  // Delegación: un solo listener por panel para todos sus huecos.
  panelEl.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-slot-id]');
    if (btn) openSlotDialog(btn.dataset.slotId);
  });
}

function updateSlotEl(slotId) {
  const els = state.slotEls.get(slotId);
  if (!els) return;
  const slot = state.slots.get(slotId);
  const vino = slot && slot.vinoId ? state.vinos.get(slot.vinoId) : null;
  els.btn.classList.toggle('filled', !!vino);
  // Sigla (editable, máx. 3) o, por defecto, la inicial de cada palabra del nombre.
  els.sigla.textContent = vino ? (vino.sigla || defaultSigla(vino.nombre)) : '';
  els.anio.textContent = vino && vino.anio != null ? String(vino.anio) : '';
  if (vino) {
    const c = slotColors(vino.varietal);
    els.box.style.background = c.bg;
    els.box.style.borderColor = c.border;
    els.box.style.color = c.fg;
  } else {
    els.box.style.background = '';
    els.box.style.borderColor = '';
    els.box.style.color = '';
  }
  els.btn.title = vino ? `${vino.nombre} — ${vino.bodega}${vino.anio != null ? ` (${vino.anio})` : ''}` : '';
  els.btn.setAttribute('aria-label', `${vino ? vino.nombre : 'Hueco vacío'} — ${describeSlot(slotId)}`);
  // El dim del filtro del mapa se re-evalúa acá para que cualquier mutación
  // puntual (asignar, vaciar, borrar, importar) lo mantenga al día gratis.
  els.btn.classList.toggle('slot--dim', slotDimmed(vino));
}

function refreshAllSlotEls() {
  for (const id of state.slotEls.keys()) updateSlotEl(id);
}

/* Filtro del mapa: state.mapFilters atenúa (.slot--dim) SOLO los huecos
   OCUPADOS cuyo vino no coincide. Los vacíos quedan intactos (color y
   clickeables) para poder ubicar un vino aunque haya una búsqueda activa.
   updateSlotEl consulta slotDimmed() en cada actualización puntual, así
   toda mutación re-aplica el filtro sin pasos extra. */
function filtersActive(f) {
  return !!(f.q.trim() || f.bodega || f.origen || f.varietal || f.anio);
}

function isMapFilterActive() {
  return filtersActive(state.mapFilters);
}

function slotDimmed(vino) {
  return isMapFilterActive() && !!vino && !vinoMatchesFilters(vino, state.mapFilters);
}

function applyMapFilter() {
  for (const [id, els] of state.slotEls) {
    const slot = state.slots.get(id);
    const vino = slot && slot.vinoId ? state.vinos.get(slot.vinoId) : null;
    els.btn.classList.toggle('slot--dim', slotDimmed(vino));
  }
  updateMapClearBtn();
}

/** Muestra el botón "Limpiar filtros" de cada pantalla solo si hay filtro activo. */
function updateMapClearBtn() {
  const btn = $('#mf-clear');
  if (btn) btn.hidden = !filtersActive(state.mapFilters);
}
function updateVinoClearBtn() {
  const btn = $('#f-clear');
  if (btn) btn.hidden = !filtersActive(state.filters);
}

/** Resetea todos los filtros de una pantalla (buscador + selects) y repinta. */
function clearMapFilters() {
  state.mapFilters = { q: '', bodega: '', origen: '', varietal: '', anio: '' };
  for (const sel of ['#mf-q', '#mf-bodega', '#mf-origen', '#mf-varietal', '#mf-anio']) $(sel).value = '';
  applyMapFilter();
}
function clearVinoFilters() {
  state.filters = { q: '', bodega: '', origen: '', varietal: '', anio: '' };
  for (const sel of ['#f-q', '#f-bodega', '#f-origen', '#f-varietal', '#f-anio']) $(sel).value = '';
  renderVinos();
}

function wireMapFilters() {
  $('#mf-q').addEventListener('input', (e) => { state.mapFilters.q = e.target.value; applyMapFilter(); });
  $('#mf-bodega').addEventListener('change', (e) => { state.mapFilters.bodega = e.target.value; applyMapFilter(); });
  $('#mf-origen').addEventListener('change', (e) => { state.mapFilters.origen = e.target.value; applyMapFilter(); });
  $('#mf-varietal').addEventListener('change', (e) => { state.mapFilters.varietal = e.target.value; applyMapFilter(); });
  $('#mf-anio').addEventListener('change', (e) => { state.mapFilters.anio = e.target.value; applyMapFilter(); });
  $('#mf-clear').addEventListener('click', clearMapFilters);
  // Al cruzar el breakpoint mobile/desktop, recalcular las etiquetas "todos"
  // (cortas en mobile, largas en desktop) reconstruyendo ambos grupos de selects.
  window.matchMedia(MOBILE_MQ).addEventListener('change', () => {
    populateFilterOptions();
    populateMapFilterOptions();
  });
}

/* Carrusel: chevrones laterales para pasar de sección (el swipe táctil lo da
   el scroll solo; qué chevron se ve se sincroniza con el scroll). En modo
   ancho cada panel mide exactamente una página, pero en modo paneo (§12 del
   CSS, iPhone) los paneles son más anchos que el viewport: por eso se pagina
   por el offset real del segundo panel y no por múltiplos de clientWidth.
   El apagado usa la clase .is-off (visibility) y no el atributo hidden:
   display:none colapsaría el carril y la tabla saltaría de lugar. */
let syncMapNav = () => {}; // la reasigna wireMapNav; applyRoute (§7) la llama al volver

function wireMapNav() {
  const area = $('.map-area');
  const panel2 = area.children[1];
  const prev = $('#map-prev');
  const next = $('#map-next');

  const go = (dir) => area.scrollTo({ left: dir > 0 ? panel2.offsetLeft : 0, behavior: 'smooth' });
  prev.addEventListener('click', () => go(-1));
  next.addEventListener('click', () => go(1));

  syncMapNav = () => {
    if (area.clientWidth === 0) return; // vista oculta: no decidir con todo en 0
    // "En la segunda" = el centro del viewport ya cruzó al segundo panel.
    const enSegunda = area.scrollLeft + area.clientWidth / 2 >= panel2.offsetLeft;
    prev.classList.toggle('is-off', !enSegunda);
    next.classList.toggle('is-off', enSegunda);
  };
  area.addEventListener('scroll', syncMapNav, { passive: true });
  window.addEventListener('resize', syncMapNav); // rotar el dispositivo mueve el umbral
  syncMapNav();
}

/* ============================================================================
   9. DIÁLOGO DE POSICIÓN + SELECTOR BUSCABLE
   ============================================================================ */

/** Pinta la ficha del vino que ocupa el hueco actual. false si está vacío.
    Separado de openSlotDialog para poder repintarlo cuando se edita el vino
    desde el formulario que se abre ENCIMA de este diálogo. */
function renderSlotWine() {
  const slot = state.slots.get(state.currentSlotId);
  const vino = slot && slot.vinoId ? state.vinos.get(slot.vinoId) : null;
  if (!vino) return false;
  $('#slot-wine').hidden = false;
  $('#slot-picker').hidden = true;
  $('#slot-wine-nombre').textContent = vino.nombre;
  $('#slot-wine-meta').textContent = vinoMeta(vino);
  const extra = [];
  if (vino.precioCompra != null) extra.push(fmtPrecio(vino.precioCompra));
  if (vino.fechaCompra) extra.push(`Comprado el ${fmtFecha(vino.fechaCompra)}`);
  $('#slot-wine-extra').textContent = extra.join(' · ');
  $('#slot-wine-extra').hidden = extra.length === 0;
  return true;
}

function openSlotDialog(slotId) {
  state.currentSlotId = slotId;
  $('#slot-pos').textContent = describeSlot(slotId);

  if (!renderSlotWine()) {
    $('#slot-wine').hidden = true;
    showPicker();
  }
  openDialog($('#dlg-slot'));
}

function showPicker() {
  $('#slot-picker').hidden = false;
  $('#picker-search').value = '';
  renderPicker('');
}

function renderPicker(query) {
  const listEl = $('#picker-results');
  listEl.textContent = '';
  const q = norm(query);
  const MAX = 50;

  const matches = [...state.vinos.values()]
    .filter((v) => !q || norm(v.nombre).includes(q) || norm(v.bodega).includes(q))
    .sort((a, b) => norm(a.nombre).localeCompare(norm(b.nombre)));

  const frag = document.createDocumentFragment();
  for (const vino of matches.slice(0, MAX)) {
    // Fila partida: el bloque grande asigna el vino al hueco, el botón chico
    // lo abre para editar (mismo par que las filas del catálogo).
    const li = document.createElement('li');
    li.className = 'picker-row';
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'picker-pick';
    btn.dataset.vinoId = vino.id;
    const name = document.createElement('span');
    name.className = 'picker-name';
    name.textContent = vino.nombre;
    const sub = document.createElement('span');
    sub.className = 'picker-sub';
    sub.textContent = vinoMeta(vino);
    btn.append(name, sub);

    const btnEdit = document.createElement('button');
    btnEdit.type = 'button';
    btnEdit.className = 'btn btn--sm picker-edit';
    btnEdit.dataset.action = 'edit';
    btnEdit.dataset.vinoId = vino.id;
    btnEdit.textContent = 'Editar';
    btnEdit.setAttribute('aria-label', `Editar ${vino.nombre}`);

    li.append(btn, btnEdit);
    frag.appendChild(li);
  }

  if (matches.length > MAX) {
    const li = document.createElement('li');
    const note = document.createElement('p');
    note.className = 'picker-note';
    note.textContent = `…y ${matches.length - MAX} más. Refiná la búsqueda.`;
    li.appendChild(note);
    frag.appendChild(li);
  }

  // Acceso directo para crear el vino si no existe (queda asignado al hueco).
  const liCreate = document.createElement('li');
  const btnCreate = document.createElement('button');
  btnCreate.type = 'button';
  btnCreate.dataset.action = 'create';
  const createLabel = document.createElement('span');
  createLabel.className = 'picker-create';
  createLabel.textContent = query.trim() ? `＋ Crear ${query.trim()}` : '＋ Crear vino nuevo';
  btnCreate.appendChild(createLabel);
  liCreate.appendChild(btnCreate);
  frag.appendChild(liCreate);

  listEl.appendChild(frag);
}

function wireSlotDialog() {
  $('#picker-search').addEventListener('input', (e) => renderPicker(e.target.value));

  $('#picker-results').addEventListener('click', async (e) => {
    const btn = e.target.closest('button');
    if (!btn || !state.currentSlotId) return;

    if (btn.dataset.action === 'create') {
      // Crear el vino desde el selector: recordamos el hueco para asignarlo al guardar.
      state.pendingSlotId = state.currentSlotId;
      const query = $('#picker-search').value.trim();
      $('#dlg-slot').close();
      openVinoForm(null, { nombre: query });
      return;
    }

    // Editar: el formulario se apila ENCIMA del selector (a diferencia de
    // crear, que lo reemplaza) para volver a la lista y poder elegir.
    if (btn.dataset.action === 'edit') {
      const vino = state.vinos.get(btn.dataset.vinoId);
      if (vino) openVinoForm(vino);
      return;
    }

    if (btn.dataset.vinoId) {
      const vino = state.vinos.get(btn.dataset.vinoId);
      try {
        await setSlotVino(state.currentSlotId, btn.dataset.vinoId);
        $('#dlg-slot').close();
        if (vino) toast(`${vino.nombre} ubicado`);
      } catch (err) {
        console.error(err);
        toast('No se pudo guardar la posición. Intentá de nuevo.', { error: true });
      }
    }
  });

  $('#btn-slot-change').addEventListener('click', showPicker);

  $('#btn-slot-edit').addEventListener('click', () => {
    const slot = state.slots.get(state.currentSlotId);
    const vino = slot && slot.vinoId ? state.vinos.get(slot.vinoId) : null;
    if (vino) openVinoForm(vino); // se apila sobre este diálogo
  });

  // El formulario de vino se abre encima de este diálogo, así que al cerrarse
  // hay que repintar lo que quedó debajo con los datos nuevos.
  $('#dlg-vino').addEventListener('close', () => {
    const dlg = $('#dlg-slot');
    if (!dlg.open) return;
    if (!$('#slot-picker').hidden) renderPicker($('#picker-search').value);
    else if (!renderSlotWine()) dlg.close();
  });

  $('#btn-slot-empty').addEventListener('click', async () => {
    if (!state.currentSlotId) return;
    try {
      await setSlotVino(state.currentSlotId, null);
      $('#dlg-slot').close();
      toast('Posición vaciada');
    } catch (err) {
      console.error(err);
      toast('No se pudo vaciar la posición. Intentá de nuevo.', { error: true });
    }
  });
}

/* ============================================================================
   10. VISTA VINOS (catálogo)
   ============================================================================ */

/** ¿El vino cumple los filtros f ({q, bodega, varietal, anio})? Lo usan el catálogo
    (state.filters) y el filtro del mapa (state.mapFilters). */
function vinoMatchesFilters(vino, f) {
  if (f.q) {
    const q = norm(f.q);
    if (!norm(vino.nombre).includes(q) && !norm(vino.bodega).includes(q)) return false;
  }
  if (f.bodega && vino.bodega !== f.bodega) return false;
  if (f.origen && vino.origen !== f.origen) return false;
  if (f.varietal && vino.varietal !== f.varietal) return false;
  if (f.anio && String(vino.anio) !== f.anio) return false;
  return true;
}

/** Valores únicos presentes en el catálogo, para los selects de filtro. */
function collectFilterValues() {
  const vinos = [...state.vinos.values()];
  return {
    bodegas: collectBodegas(),
    origenes: collectOrigenes(),
    varietales: [...new Set(vinos.map((v) => v.varietal))].sort((a, b) => norm(a).localeCompare(norm(b))),
    anios: [...new Set(vinos.map((v) => v.anio).filter((a) => a != null))].sort((a, b) => b - a),
  };
}

/** Bodegas únicas ya cargadas, para sugerir en el combobox del formulario. */
function collectBodegas() {
  return [...new Set([...state.vinos.values()].map((v) => v.bodega).filter(Boolean))]
    .sort((a, b) => norm(a).localeCompare(norm(b)));
}

/** Orígenes únicos ya cargados (campo opcional), para el combobox y el filtro. */
function collectOrigenes() {
  return [...new Set([...state.vinos.values()].map((v) => v.origen).filter(Boolean))]
    .sort((a, b) => norm(a).localeCompare(norm(b)));
}

/* Etiqueta "todos" de cada filtro: corta en mobile (el ancho de 1/3 de renglón
   no da para el texto largo y se trunca ambiguo) y completa en desktop. Se
   recalcula al cruzar el breakpoint (ver el listener en wireMapFilters). */
const MOBILE_MQ = '(max-width: 700px)';
const FILTER_ALL_LABEL = {
  bodega: ['Todas las bodegas', 'Bodega'],
  origen: ['Todos los orígenes', 'Origen'],
  varietal: ['Todos los varietales', 'Varietal'],
  anio: ['Todos los años', 'Año'],
};
function filterAllLabel(key) {
  return FILTER_ALL_LABEL[key][window.matchMedia(MOBILE_MQ).matches ? 1 : 0];
}

/** Rellena los selects de filtro del catálogo con los valores presentes. */
function populateFilterOptions() {
  const { bodegas, origenes, varietales, anios } = collectFilterValues();
  rebuildSelect($('#f-bodega'), filterAllLabel('bodega'), bodegas.map((b) => [b, b]), state.filters.bodega);
  rebuildSelect($('#f-origen'), filterAllLabel('origen'), origenes.map((o) => [o, o]), state.filters.origen);
  rebuildSelect($('#f-varietal'), filterAllLabel('varietal'), varietales.map((v) => [v, v]), state.filters.varietal);
  rebuildSelect($('#f-anio'), filterAllLabel('anio'), anios.map((a) => [String(a), String(a)]), state.filters.anio);
}

/** Ídem para los selects del mapa (§8). Si el valor elegido desapareció del
    catálogo, rebuildSelect resetea el select a '': se re-lee el valor real
    para que el filtro no quede "zombi", y se re-aplica el atenuado. */
function populateMapFilterOptions() {
  const { bodegas, origenes, varietales, anios } = collectFilterValues();
  rebuildSelect($('#mf-bodega'), filterAllLabel('bodega'), bodegas.map((b) => [b, b]), state.mapFilters.bodega);
  rebuildSelect($('#mf-origen'), filterAllLabel('origen'), origenes.map((o) => [o, o]), state.mapFilters.origen);
  rebuildSelect($('#mf-varietal'), filterAllLabel('varietal'), varietales.map((v) => [v, v]), state.mapFilters.varietal);
  rebuildSelect($('#mf-anio'), filterAllLabel('anio'), anios.map((a) => [String(a), String(a)]), state.mapFilters.anio);
  state.mapFilters.bodega = $('#mf-bodega').value;
  state.mapFilters.origen = $('#mf-origen').value;
  state.mapFilters.varietal = $('#mf-varietal').value;
  state.mapFilters.anio = $('#mf-anio').value;
  applyMapFilter();
}

function rebuildSelect(selectEl, allLabel, pairs, current) {
  selectEl.textContent = '';
  const optAll = document.createElement('option');
  optAll.value = '';
  optAll.textContent = allLabel;
  selectEl.appendChild(optAll);
  for (const [value, label] of pairs) {
    const opt = document.createElement('option');
    opt.value = value;
    opt.textContent = label;
    selectEl.appendChild(opt);
  }
  selectEl.value = pairs.some(([v]) => v === current) ? current : '';
}

/** "bodega · año · varietal" para fichas y listas; omite el año si el vino no tiene. */
function vinoMeta(vino) {
  return [vino.bodega, vino.anio, vino.varietal].filter((p) => p != null && p !== '').join(' · ');
}

/* Orden del catálogo (§10). Habilita/deshabilita las opciones de precio según
   haya algún precio cargado; si el orden actual quedó sin datos, cae a nombre. */
function updateSortOptions() {
  const sel = $('#v-sort');
  if (!sel) return;
  const anyPrice = [...state.vinos.values()].some((v) => v.precioCompra != null);
  for (const val of ['precio-desc', 'precio-asc']) {
    const opt = sel.querySelector(`option[value="${val}"]`);
    if (opt) opt.disabled = !anyPrice;
  }
  if (!anyPrice && (state.sort === 'precio-desc' || state.sort === 'precio-asc')) state.sort = 'nombre';
  if (sel.value !== state.sort) sel.value = state.sort;
}

/** Comparador según state.sort. occ = Map<id, cantidad en cava>. Desempates y
    vinos sin dato (año/precio) caen al final, ordenados por nombre. */
function vinoSortCmp(occ) {
  const byName = (a, b) => norm(a.nombre).localeCompare(norm(b.nombre));
  switch (state.sort) {
    case 'cava-desc': return (a, b) => (occ.get(b.id) || 0) - (occ.get(a.id) || 0) || byName(a, b);
    case 'cava-asc': return (a, b) => (occ.get(a.id) || 0) - (occ.get(b.id) || 0) || byName(a, b);
    case 'anio': return (a, b) => (b.anio ?? -Infinity) - (a.anio ?? -Infinity) || byName(a, b);
    case 'varietal': return (a, b) => norm(a.varietal).localeCompare(norm(b.varietal)) || byName(a, b);
    case 'precio-desc': return (a, b) => (b.precioCompra ?? -Infinity) - (a.precioCompra ?? -Infinity) || byName(a, b);
    case 'precio-asc': return (a, b) => (a.precioCompra ?? Infinity) - (b.precioCompra ?? Infinity) || byName(a, b);
    default: return (a, b) => byName(a, b) || (a.anio || 0) - (b.anio || 0);
  }
}

function renderVinos() {
  updateVinoClearBtn();
  updateSortOptions();
  const listEl = $('#vino-list');
  const emptyEl = $('#vinos-empty');
  const occ = occupancyMap();

  const rows = [...state.vinos.values()]
    .filter((v) => vinoMatchesFilters(v, state.filters))
    .sort(vinoSortCmp(occ));

  listEl.textContent = '';

  if (rows.length === 0) {
    listEl.hidden = true;
    emptyEl.hidden = false;
    emptyEl.textContent = state.vinos.size === 0
      ? 'Todavía no cargaste vinos. Empezá con el botón Agregar vino.'
      : 'Sin resultados para los filtros elegidos.';
    return;
  }
  listEl.hidden = false;
  emptyEl.hidden = true;

  const frag = document.createDocumentFragment();
  for (const vino of rows) {
    const row = document.createElement('div');
    row.className = 'vino-row';

    const info = document.createElement('div');
    info.className = 'vino-info';

    const title = document.createElement('div');
    title.className = 'vino-title';
    const name = document.createElement('span');
    name.textContent = vino.nombre;
    title.appendChild(name);

    const count = occ.get(vino.id) || 0;
    const badge = document.createElement('span');
    badge.className = count > 0 ? 'badge badge--on' : 'badge';
    badge.textContent = count > 0 ? `En cava: ${count}` : 'Sin ubicar';
    title.appendChild(badge);

    const meta = document.createElement('div');
    meta.className = 'vino-meta';
    const parts = [vino.bodega, vino.anio, vino.varietal].filter((p) => p != null && p !== '');
    if (vino.precioCompra != null) parts.push(fmtPrecio(vino.precioCompra));
    if (vino.fechaCompra) parts.push(fmtFecha(vino.fechaCompra));
    meta.textContent = parts.join(' · ');

    info.append(title, meta);

    const actions = document.createElement('div');
    actions.className = 'vino-actions';
    const btnEdit = document.createElement('button');
    btnEdit.type = 'button';
    btnEdit.className = 'btn btn--sm';
    btnEdit.dataset.action = 'edit';
    btnEdit.dataset.id = vino.id;
    btnEdit.textContent = 'Editar';
    const btnDelete = document.createElement('button');
    btnDelete.type = 'button';
    btnDelete.className = 'btn btn--sm btn--danger';
    btnDelete.dataset.action = 'delete';
    btnDelete.dataset.id = vino.id;
    btnDelete.textContent = 'Borrar';
    actions.append(btnEdit, btnDelete);

    row.append(info, actions);
    frag.appendChild(row);
  }
  listEl.appendChild(frag);
}

function wireVinosView() {
  $('#f-q').addEventListener('input', (e) => { state.filters.q = e.target.value; renderVinos(); });
  $('#f-bodega').addEventListener('change', (e) => { state.filters.bodega = e.target.value; renderVinos(); });
  $('#f-origen').addEventListener('change', (e) => { state.filters.origen = e.target.value; renderVinos(); });
  $('#f-varietal').addEventListener('change', (e) => { state.filters.varietal = e.target.value; renderVinos(); });
  $('#f-anio').addEventListener('change', (e) => { state.filters.anio = e.target.value; renderVinos(); });
  $('#f-clear').addEventListener('click', clearVinoFilters);
  $('#v-sort').addEventListener('change', (e) => { state.sort = e.target.value; renderVinos(); });

  $('#btn-add-vino').addEventListener('click', () => {
    state.pendingSlotId = null;
    openVinoForm(null);
  });

  $('#vino-list').addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const vino = state.vinos.get(btn.dataset.id);
    if (!vino) return;

    if (btn.dataset.action === 'edit') {
      state.pendingSlotId = null;
      openVinoForm(vino);
    } else if (btn.dataset.action === 'delete') {
      const count = occupancyMap().get(vino.id) || 0;
      const ok = await confirmDialog({
        title: `¿Borrar ${vino.nombre}?`,
        body: 'Sale del catálogo y no se puede deshacer.',
        // En singular no va el número: «La posición que ocupa…», no «Las 1
        // posición…». Cambian el artículo, el verbo y el adjetivo, así que
        // son dos frases enteras, no un sufijo condicional.
        detail: count === 1
          ? 'La posición que ocupa en el mapa queda vacía.'
          : count > 1
            ? `Las ${count} posiciones que ocupa en el mapa quedan vacías.`
            : '',
        confirmLabel: 'Borrar',
        danger: true,
      });
      if (!ok) return;
      try {
        await deleteVino(vino.id);
        populateFilterOptions();
        populateMapFilterOptions();
        renderVinos();
        toast(count > 0
          ? `${vino.nombre} borrado · ${count} posición${count === 1 ? '' : 'es'} vaciada${count === 1 ? '' : 's'}`
          : `${vino.nombre} borrado`);
      } catch (err) {
        console.error(err);
        toast('No se pudo borrar el vino. Intentá de nuevo.', { error: true });
      }
    }
  });
}

/* ============================================================================
   11. FORMULARIO DE VINO (alta / edición)
   ============================================================================ */

/** Varietales para sugerir en el combobox: los predefinidos más los que ya
    aparezcan en el catálogo (texto libre cargado antes), sin repetir. */
function collectVarietales() {
  const set = new Set(VARIETALES.flatMap(({ items }) => items));
  for (const v of state.vinos.values()) if (v.varietal) set.add(v.varietal);
  return [...set].sort((a, b) => norm(a).localeCompare(norm(b)));
}

/** Refleja en el selector de color el color actual del varietal tipeado. */
function syncVarietalColor() {
  $('#v-varietal-color').value = effectiveVarietalColor($('#v-varietal').value.trim());
}

/* Combobox: autocompletado propio para inputs de texto libre (bodega, varietal).
   Reemplaza al <datalist> nativo, que el navegador pinta pobre e inconsistente.
   El input sigue siendo texto libre; el panel solo sugiere. getItems() se relee
   en cada apertura (la lista crece con el catálogo); renderOption(valor, fila)
   decora cada opción (al varietal le pone su color). El panel vive dentro del
   <dialog> para quedar por encima, se ancla absoluto al campo (position:relative)
   y abre hacia arriba si abajo no entra, así nunca lo recorta el cuerpo. */
function createCombobox(input, { getItems, renderOption } = {}) {
  const dlgBody = input.closest('.dlg-body');
  const panel = document.createElement('div');
  panel.className = 'combo-panel';
  panel.id = `${input.id}-combo`;
  panel.setAttribute('role', 'listbox');
  panel.hidden = true;
  input.after(panel);
  input.setAttribute('role', 'combobox');
  input.setAttribute('aria-autocomplete', 'list');
  input.setAttribute('aria-controls', panel.id);
  input.setAttribute('aria-expanded', 'false');

  let opts = [];        // valores visibles ahora
  let active = -1;       // opción resaltada
  let suppress = false;  // ignora el 'input' que dispara select()
  let blurTimer = 0;
  const isOpen = () => !panel.hidden;

  // Panel fixed: se ancla al input contra la VENTANA (no contra el cuerpo del
  // diálogo), así flota por encima del modal sin que lo recorte y abre hacia
  // abajo por defecto. Solo abre hacia arriba si abajo no entra (input muy al
  // pie, típico con el teclado abierto).
  function place() {
    const ir = input.getBoundingClientRect();
    const vh = window.innerHeight;
    const below = vh - ir.bottom - 8;
    const above = ir.top - 8;
    const up = below < 160 && above > below;
    const maxH = Math.max(120, Math.min(320, up ? above : below));
    panel.style.left = `${ir.left}px`;
    panel.style.width = `${ir.width}px`;
    panel.style.maxHeight = `${maxH}px`;
    if (up) {
      panel.style.top = 'auto';
      panel.style.bottom = `${vh - ir.top + 4}px`;
    } else {
      panel.style.bottom = 'auto';
      panel.style.top = `${ir.bottom + 4}px`;
    }
  }

  function show() {
    if (panel.hidden) { panel.hidden = false; input.setAttribute('aria-expanded', 'true'); }
    place();
  }
  function close() {
    if (!panel.hidden) { panel.hidden = true; input.setAttribute('aria-expanded', 'false'); }
    setActive(-1);
  }

  function setActive(i) {
    const rows = panel.querySelectorAll('.combo-opt');
    if (active >= 0 && rows[active]) rows[active].classList.remove('is-active');
    active = i;
    if (active >= 0 && rows[active]) {
      rows[active].classList.add('is-active');
      rows[active].scrollIntoView({ block: 'nearest' });
      input.setAttribute('aria-activedescendant', rows[active].id);
    } else {
      input.removeAttribute('aria-activedescendant');
    }
  }

  function select(value) {
    suppress = true;
    input.value = value;
    input.dispatchEvent(new Event('input', { bubbles: true })); // dispara syncVarietalColor, etc.
    suppress = false;
    close();
  }

  function render(query) {
    const q = norm(query);
    opts = getItems().filter((v) => !q || norm(v).includes(q));
    panel.textContent = '';
    if (!opts.length) {
      if (!query.trim()) { close(); return; } // lista vacía y sin texto: nada que mostrar
      const hint = document.createElement('div');
      hint.className = 'combo-hint';
      hint.append('Se guardará como nuevo: ');
      const b = document.createElement('b');
      b.textContent = query.trim();
      hint.appendChild(b);
      panel.appendChild(hint);
      active = -1;
      show();
      return;
    }
    opts.forEach((value, i) => {
      const row = document.createElement('div');
      row.className = 'combo-opt';
      row.id = `${panel.id}-opt-${i}`;
      row.setAttribute('role', 'option');
      if (renderOption) {
        renderOption(value, row);
      } else {
        const label = document.createElement('span');
        label.className = 'combo-opt-label';
        label.textContent = value;
        row.appendChild(label);
      }
      row.addEventListener('mousemove', () => { if (active !== i) setActive(i); });
      row.addEventListener('click', () => select(value));
      panel.appendChild(row);
    });
    show();
    setActive(query.trim() ? 0 : -1); // con texto, resalta el primero para Enter; sin texto, nada
  }

  input.addEventListener('focus', () => { clearTimeout(blurTimer); render(''); });
  input.addEventListener('click', () => { if (!isOpen()) render(''); });
  input.addEventListener('input', () => { if (!suppress) render(input.value); });
  input.addEventListener('blur', () => { blurTimer = setTimeout(close, 150); }); // margen para el click en una opción
  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen()) render('');
      else setActive(Math.min(active + 1, opts.length - 1));
    } else if (e.key === 'ArrowUp') {
      if (!isOpen()) return;
      e.preventDefault();
      setActive(Math.max(active - 1, 0));
    } else if (e.key === 'Enter') {
      if (isOpen() && active >= 0 && opts[active] != null) { e.preventDefault(); select(opts[active]); }
      else if (isOpen()) { e.preventDefault(); close(); } // cierra el panel sin enviar el formulario
    } else if (e.key === 'Escape') {
      if (isOpen()) { e.preventDefault(); e.stopPropagation(); close(); } // 1er Esc cierra el panel, no el diálogo
    } else if (e.key === 'Tab') {
      close();
    }
  });

  // Interactuar con el panel no debe robarle el foco al input (si no, blur lo cierra antes del click).
  panel.addEventListener('mousedown', (e) => e.preventDefault());
  // Reposicionar mientras está abierto: el input se mueve con el scroll del
  // cuerpo, el resize de la ventana o el teclado (visualViewport en iOS).
  const onReflow = () => { if (isOpen()) place(); };
  window.addEventListener('resize', onReflow);
  window.visualViewport?.addEventListener('resize', onReflow);
  window.visualViewport?.addEventListener('scroll', onReflow);
  if (dlgBody) dlgBody.addEventListener('scroll', onReflow, { passive: true });
  input.closest('dialog')?.addEventListener('close', () => { clearTimeout(blurTimer); close(); });
}

const ANIO_MIN = 1950;

/**
 * Opciones del año: del que viene hacia atrás hasta ANIO_MIN, más nuevo
 * primero (es lo que más se carga; para los viejos el select tiene
 * type-ahead). El año que viene entra porque las cosechas se etiquetan
 * adelantadas.
 * `extra` fuerza un año fuera de rango — un respaldo viejo, o una joya de
 * 1890 — para que editar ese vino no le cambie el año en silencio.
 */
function buildAnioSelect(extra) {
  const select = $('#v-anio');
  select.textContent = '';
  // Año es opcional: la primera opción "Sin año" es válida y seleccionable.
  const sinAnio = document.createElement('option');
  sinAnio.value = '';
  sinAnio.textContent = 'Sin año';
  select.appendChild(sinAnio);

  const anios = [];
  for (let a = new Date().getFullYear() + 1; a >= ANIO_MIN; a--) anios.push(a);
  if (Number.isInteger(extra) && !anios.includes(extra)) {
    anios.push(extra);
    anios.sort((a, b) => b - a);
  }
  for (const a of anios) {
    const opt = document.createElement('option');
    opt.value = String(a);
    opt.textContent = String(a);
    select.appendChild(opt);
  }
}

/** El placeholder de la sigla muestra la inicial que se usará si se deja vacía. */
function syncSiglaPlaceholder() {
  const auto = defaultSigla($('#v-nombre').value);
  $('#v-sigla').placeholder = auto || 'Inicial del nombre';
}

/** Marca el campo de fecha cuando tiene valor: sin esto no hay forma en CSS
    de distinguir el «dd/mm/yyyy» vacío (un placeholder) de una fecha real. */
function syncFechaVacia() {
  const el = $('#v-fecha');
  el.classList.toggle('has-value', !!el.value);
}

/** Abre el formulario. vino=null → alta (prefill opcional, p. ej. desde el selector). */
function openVinoForm(vino, prefill) {
  state.editingVinoId = vino ? vino.id : null;
  $('#vino-form-title').textContent = vino ? 'Editar vino' : 'Nuevo vino';

  const form = $('#form-vino');
  form.reset();
  $('#v-nombre').value = vino ? vino.nombre : (prefill && prefill.nombre) || '';
  $('#v-sigla').value = vino ? (vino.sigla || '') : '';
  syncSiglaPlaceholder();
  $('#v-bodega').value = vino ? vino.bodega : '';
  $('#v-origen').value = vino ? (vino.origen || '') : '';
  // Se reconstruye en cada apertura para no acumular los años fuera de rango
  // que hayan entrado por `extra` al editar otros vinos.
  buildAnioSelect(vino ? vino.anio : null);
  $('#v-anio').value = vino && vino.anio != null ? String(vino.anio) : '';
  $('#v-precio').value = vino && vino.precioCompra != null ? vino.precioCompra : '';
  $('#v-fecha').value = (vino && vino.fechaCompra) || '';
  syncFechaVacia();

  $('#v-varietal').value = vino ? vino.varietal : '';
  syncVarietalColor(); // el color arranca en el del varietal (o el fallback si es nuevo)

  openDialog($('#dlg-vino'));
}

function wireVinoForm() {
  // Al elegir/tipear un varietal, el selector de color muestra el color de ese
  // varietal para que se vea (y se pueda cambiar) antes de guardar.
  $('#v-varietal').addEventListener('input', syncVarietalColor);
  $('#v-nombre').addEventListener('input', syncSiglaPlaceholder);

  // Autocompletado propio (reemplaza al <datalist> nativo). El de varietal
  // muestra el color de cada uno; ambos leen la lista fresca en cada apertura.
  createCombobox($('#v-bodega'), { getItems: collectBodegas });
  createCombobox($('#v-origen'), { getItems: collectOrigenes });
  createCombobox($('#v-varietal'), {
    getItems: collectVarietales,
    renderOption: (value, row) => {
      const dot = document.createElement('span');
      dot.className = 'combo-dot';
      dot.style.background = effectiveVarietalColor(value);
      const label = document.createElement('span');
      label.className = 'combo-opt-label';
      label.textContent = value;
      row.append(dot, label);
    },
  });

  // La sigla se guarda en mayúsculas (ver el submit); esto lo hace también
  // sobre el valor tipeado, para que no dependa de guardar. Se preserva el
  // caret: asignar .value lo manda al final y se nota al corregir el medio.
  $('#v-sigla').addEventListener('input', (e) => {
    const up = e.target.value.toUpperCase();
    if (up === e.target.value) return;
    const pos = e.target.selectionStart;
    e.target.value = up;
    e.target.setSelectionRange(pos, pos);
  });

  $('#v-fecha').addEventListener('input', syncFechaVacia);

  $('#form-vino').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    if (!form.reportValidity()) return;

    const varietal = $('#v-varietal').value.trim();
    const anioRaw = $('#v-anio').value;
    const anio = anioRaw === '' ? null : parseInt(anioRaw, 10);
    if (!varietal || (anioRaw !== '' && !Number.isInteger(anio))) return;

    const esAlta = !state.editingVinoId; // capturado antes de cerrar el diálogo
    const vino = {
      id: state.editingVinoId || newId(),
      nombre: $('#v-nombre').value.trim(),
      bodega: $('#v-bodega').value.trim(),
      varietal,
    };
    if (!vino.nombre || !vino.bodega) return;
    if (anio != null) vino.anio = anio; // año es opcional
    const origen = $('#v-origen').value.trim();
    if (origen) vino.origen = origen; // origen es opcional
    const sigla = $('#v-sigla').value.trim().slice(0, 3).toUpperCase();
    if (sigla) vino.sigla = sigla; // vacío → el hueco cae a la inicial del nombre
    const precio = $('#v-precio').value;
    if (precio !== '' && !Number.isNaN(parseFloat(precio))) vino.precioCompra = parseFloat(precio);
    const fecha = $('#v-fecha').value;
    if (fecha) vino.fechaCompra = fecha;

    const assignTo = state.pendingSlotId; // capturado antes de cerrar (close lo resetea)
    // El color elegido se guarda como override del varietal y repinta TODOS sus
    // vinos (ver slotColors). Solo si cambió respecto del color efectivo actual.
    const color = ($('#v-varietal-color').value || '').toLowerCase();
    const guardarColor = /^#[0-9a-f]{6}$/.test(color) && color !== effectiveVarietalColor(varietal).toLowerCase();
    try {
      await saveVino(vino);
      if (guardarColor) await setVarietalColor(varietal, color);
      if (assignTo) {
        await setSlotVino(assignTo, vino.id);
        state.pendingSlotId = null;
      }
      populateFilterOptions();
      populateMapFilterOptions();
      renderVinos();
      refreshAllSlotEls(); // por si cambió la bodega (inicial) de un vino ya ubicado
      $('#dlg-vino').close();
      toast(assignTo ? `${vino.nombre} creado y ubicado`
        : esAlta ? `${vino.nombre} agregado al catálogo`
        : `${vino.nombre} actualizado`);
    } catch (err) {
      console.error(err);
      toast('No se pudo guardar el vino. Intentá de nuevo.', { error: true });
    }
  });

  // Si el formulario se cierra sin guardar, se descarta la asignación pendiente.
  $('#dlg-vino').addEventListener('close', () => { state.pendingSlotId = null; });
}

/* ============================================================================
   12. RESPALDO: SINCRONIZACIÓN CON GITHUB + EXPORTAR / IMPORTAR JSON
   Formato del respaldo:
   { app: "cava", schemaVersion: 2, exportedAt: ISO, vinos: [...], slots: [...],
     colores: [{ varietal, color }] }  // colores: override por varietal (v2);
   los respaldos v1 (sin `colores`) se siguen aceptando.

   Con la sincronización configurada (⚙: repo/rama/archivo/token, guardado en
   localStorage bajo GITHUB_KEY), "Guardar cambios" SUBE el respaldo al repo
   vía la API de Contents, sobreescribiendo siempre el mismo archivo (el
   historial de commits del repo es el historial de respaldos), y «Restaurar
   desde GitHub» lo baja. Sin configurar, quedan los flujos a archivo local:
   hoja de compartir (iPad) o descarga clásica, con nombre BACKUP_FILENAME.

   Sincronización al abrir (syncFromGithub): SYNC_SHA_KEY guarda el sha del
   último respaldo remoto que ESTE dispositivo vio. Al arrancar, si el sha
   remoto cambió (otro dispositivo subió una versión más nueva), se carga
   automáticamente; si además acá hay cambios sin subir, se pregunta cuál
   conservar. El mismo sha protege "Guardar cambios": si el remoto avanzó
   sin que este dispositivo lo viera, avisa antes de pisarlo.

   Importar/restaurar reemplaza TODO el contenido en una sola transacción:
   si algo falla, IndexedDB revierte también los clear() y no se pierde nada.

   "Cambios sin respaldar": cada mutación (vino o posición) marca un flag
   persistente en localStorage; mientras esté activo, aparece en el header
   el botón verde "Guardar cambios". Respaldar (a GitHub o a archivo) o
   importar un respaldo lo limpia.
   ============================================================================ */

function isDirty() {
  try { return localStorage.getItem(DIRTY_KEY) === '1'; } catch (_) { return false; }
}

function setDirty(dirty) {
  try {
    if (dirty) localStorage.setItem(DIRTY_KEY, '1');
    else localStorage.removeItem(DIRTY_KEY);
  } catch (_) { /* modo privado: el botón solo refleja la sesión actual */ }
  updateSaveBtn();
}

function updateSaveBtn() {
  $('#btn-export').hidden = !isDirty();
}

/* --- Sincronización con GitHub (API de Contents) --- */

function getGithubConfig() {
  try {
    const cfg = JSON.parse(localStorage.getItem(GITHUB_KEY) || 'null');
    if (cfg && typeof cfg === 'object' && cfg.repo && cfg.token) {
      return {
        repo: cfg.repo,
        branch: cfg.branch || 'main',
        path: cfg.path || BACKUP_FILENAME,
        token: cfg.token,
      };
    }
  } catch (_) { /* modo privado o JSON corrupto: sin sincronización */ }
  return null;
}

function setGithubConfig(cfg) {
  try {
    if (cfg) localStorage.setItem(GITHUB_KEY, JSON.stringify(cfg));
    else localStorage.removeItem(GITHUB_KEY);
    return true;
  } catch (_) { return false; }
}

/* Sha del último respaldo remoto visto por ESTE dispositivo (ver comentario §12). */
function getSyncSha() {
  try { return localStorage.getItem(SYNC_SHA_KEY); } catch (_) { return null; }
}

function setSyncSha(sha) {
  try {
    if (sha) localStorage.setItem(SYNC_SHA_KEY, sha);
    else localStorage.removeItem(SYNC_SHA_KEY);
  } catch (_) { /* modo privado: a lo sumo se re-pregunta al abrir */ }
}

/** btoa/atob solo manejan latin-1: pasar por bytes UTF-8 (acentos: "Semillón"). */
function b64EncodeUtf8(str) {
  const bytes = new TextEncoder().encode(str);
  let bin = '';
  const CHUNK = 0x8000; // String.fromCharCode revienta con arrays muy largos
  for (let i = 0; i < bytes.length; i += CHUNK) {
    bin += String.fromCharCode.apply(null, bytes.subarray(i, i + CHUNK));
  }
  return btoa(bin);
}

function b64DecodeUtf8(b64) {
  const bin = atob(b64.replace(/\s/g, '')); // la API mete saltos de línea en el base64
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

/** Request al endpoint de Contents del archivo de respaldo configurado. */
function ghContents(cfg, method, body) {
  const url = `https://api.github.com/repos/${cfg.repo}/contents/${cfg.path}`
    + (method === 'GET' ? `?ref=${encodeURIComponent(cfg.branch)}` : '');
  return fetch(url, {
    method,
    headers: {
      'Authorization': `Bearer ${cfg.token}`,
      'Accept': 'application/vnd.github+json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
}

function ghErrorMsg(status) {
  if (status === 401) return 'Token inválido o vencido.';
  if (status === 403) return 'El token no tiene permiso sobre ese repositorio.';
  if (status === 404) return 'No se encontró el repositorio o el archivo (¿nombre mal escrito o el token no tiene acceso?).';
  return `GitHub respondió ${status}.`;
}

/** GET del archivo de respaldo: { sha, body }; ambos null si no existe aún. */
async function ghGetBackupMeta(cfg) {
  const res = await ghContents(cfg, 'GET');
  if (res.status === 404) return { sha: null, body: null };
  if (!res.ok) throw new Error(ghErrorMsg(res.status));
  const body = await res.json();
  return { sha: body.sha, body };
}

/** PUT del respaldo sobre el MISMO archivo del repo. Devuelve el sha nuevo. */
async function ghPutBackup(cfg, json, sha) {
  const put = (s) => ghContents(cfg, 'PUT', {
    message: `Respaldo de cava — ${new Date().toLocaleString('es-AR')}`,
    content: b64EncodeUtf8(json),
    branch: cfg.branch,
    ...(s ? { sha: s } : {}),
  });

  let res = await put(sha);
  if (res.status === 409 || res.status === 422) {
    // Otro dispositivo guardó justo en el medio (sha viejo): reintentar UNA vez.
    res = await put((await ghGetBackupMeta(cfg)).sha);
  }
  if (!res.ok) throw new Error(ghErrorMsg(res.status));
  const out = await res.json();
  return out.content ? out.content.sha : null;
}

/* --- Resumen del contenido, para los mensajes ---
   Ojo: `slots` es TODA la grilla (reconcileSlots crea un registro por cada
   hueco del LAYOUT, cientos), así que lo que se cuenta son los ocupados. */

/* Tolera basura a propósito: la sincronización al abrir arma el diálogo de
   conflicto ANTES de que importData valide el respaldo remoto. */
function contarBackup(vinos, slots) {
  const vs = Array.isArray(vinos) ? vinos : [];
  const ss = Array.isArray(slots) ? slots : [];
  return { vinos: vs.length, ubicadas: ss.reduce((n, s) => n + (s && s.vinoId ? 1 : 0), 0) };
}

function contarActual() {
  let ubicadas = 0;
  for (const s of state.slots.values()) if (s.vinoId) ubicadas++;
  return { vinos: state.vinos.size, ubicadas };
}

function resumen(c) {
  const v = `${c.vinos} vino${c.vinos === 1 ? '' : 's'}`;
  const b = `${c.ubicadas} botella${c.ubicadas === 1 ? '' : 's'} ubicada${c.ubicadas === 1 ? '' : 's'}`;
  return `${v}, ${b}`;
}

const horaCorta = (d = new Date()) =>
  d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });

/* --- Exportar --- */

async function buildBackupJson() {
  const [vinos, slots, colores] = await withTx(state.db, ['vinos', 'slots', 'colores'], 'readonly', (tx) =>
    Promise.all([
      req(tx.objectStore('vinos').getAll()),
      req(tx.objectStore('slots').getAll()),
      req(tx.objectStore('colores').getAll()),
    ])
  );
  // Saneo defensivo: una posición que apunte a un vino ausente se exporta vacía,
  // así el respaldo nunca lleva referencias colgadas (que rompen el import).
  const vinoIds = new Set(vinos.map((v) => v.id));
  const slotsLimpios = slots.map((s) => ({ id: s.id, vinoId: s.vinoId != null && vinoIds.has(s.vinoId) ? s.vinoId : null }));
  const envelope = {
    app: 'cava',
    schemaVersion: BACKUP_SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    vinos,
    slots: slotsLimpios,
    colores,
  };
  return JSON.stringify(envelope, null, 2);
}

/** "Guardar cambios": a GitHub si está configurado; si no, a archivo local. */
async function exportBackup() {
  const json = await buildBackupJson();

  const cfg = getGithubConfig();
  if (cfg) {
    // navigator.onLine solo es confiable en negativo (true no garantiza nada),
    // de ahí el === false. Evita 30 segundos de fetch colgado para terminar
    // en un TypeError genérico.
    if (navigator.onLine === false) {
      toast('Estás sin conexión. Los cambios quedan guardados en este dispositivo — subilos cuando vuelva internet.');
      return;
    }
    const task = beginTask('Subiendo el respaldo a GitHub…');
    try {
      const { sha } = await ghGetBackupMeta(cfg);
      // El remoto avanzó desde la última vez que este dispositivo lo vio
      // (otro dispositivo guardó y acá no se recargó): avisar antes de pisar.
      if (sha && getSyncSha() && sha !== getSyncSha()) {
        const ok = await confirmDialog({
          title: 'Hay un respaldo más nuevo en GitHub',
          body: 'Otro dispositivo lo subió después de la última vez que este se sincronizó.',
          detail: 'Si seguís, se reemplaza por lo que tenés acá — la versión anterior queda solo en el historial del repositorio.',
          confirmLabel: 'Subir lo de este dispositivo',
          cancelLabel: 'Dejarlo como está',
          danger: true,
        });
        if (!ok) {
          task.cancel('No se subió nada — en GitHub queda el respaldo del otro dispositivo.');
          return;
        }
      }
      setSyncSha(await ghPutBackup(cfg, json, sha));
      setDirty(false);
      task.done(`Guardado en GitHub · ${resumen(contarActual())} · ${horaCorta()}`);
    } catch (err) {
      console.error(err);
      // "Tus cambios siguen acá": sin eso, un guardado fallido se lee como
      // pérdida de datos (y no lo es — el flag dirty queda puesto).
      const msg = err instanceof TypeError
        ? 'No se pudo subir a GitHub — revisá tu conexión. Tus cambios siguen guardados en este dispositivo.'
        : `No se pudo subir a GitHub. ${err.message || ''} Tus cambios siguen acá.`;
      task.fail(msg.replace(/\s+/g, ' ').trim());
    }
    return; // configurado: nunca caer a descargas (justo lo que se quiere evitar)
  }

  exportToFile(json);
}

/** Exporta a archivo local (fallback sin sincronización, o manual desde ⚙). */
async function exportToFile(json) {
  // En iPad, la hoja de compartir ofrece "Guardar en Archivos" (iCloud Drive)
  // y funciona también instalada como PWA, donde la descarga por <a> es frágil.
  if ('ontouchend' in document && navigator.canShare) {
    try {
      const file = new File([json], BACKUP_FILENAME, { type: 'application/json' });
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: BACKUP_FILENAME });
        setDirty(false);
        toast(`Respaldo guardado · ${resumen(contarActual())}`);
        return;
      }
    } catch (err) {
      if (err && err.name === 'AbortError') {
        // Canceló la hoja de compartir: sin aviso parece que se guardó.
        toast('Exportación cancelada — los cambios siguen sin respaldar.');
        return;
      }
      // Cualquier otro error: caemos a la descarga clásica.
    }
  }

  const url = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = BACKUP_FILENAME;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
  setDirty(false);
  // Nombrar el archivo: en iPad la hoja de compartir y una descarga silenciosa
  // terminan en lugares completamente distintos.
  toast(`Descargado ${BACKUP_FILENAME} · ${resumen(contarActual())}`);
}

/** Valida el archivo de respaldo. Devuelve un mensaje de error o null si es válido. */
function validateBackup(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return 'El archivo no tiene el formato de un respaldo de Cava.';
  if (data.app !== undefined && data.app !== 'cava') return 'El archivo no es un respaldo de esta app.';
  if (data.schemaVersion !== 1 && data.schemaVersion !== 2) return 'Ese respaldo es de otra versión de Cava.';
  if (!Array.isArray(data.vinos)) return 'El respaldo no tiene la lista de vinos.';
  if (!Array.isArray(data.slots)) return 'El respaldo no tiene la lista de posiciones.';
  if (data.colores !== undefined && !Array.isArray(data.colores)) return 'El respaldo tiene los colores en un formato inválido.';

  const vinoIds = new Set();
  for (let i = 0; i < data.vinos.length; i++) {
    const v = data.vinos[i];
    const donde = `vino #${i + 1}`;
    if (!v || typeof v !== 'object') return `El respaldo está dañado: no se entiende el ${donde}.`;
    if (typeof v.id !== 'string' || !v.id) return `Respaldo inválido: ${donde} no tiene id.`;
    if (vinoIds.has(v.id)) return `Respaldo inválido: id de vino repetido (${v.id}).`;
    vinoIds.add(v.id);
    for (const campo of ['nombre', 'bodega', 'varietal']) {
      if (typeof v[campo] !== 'string' || !v[campo].trim()) return `Respaldo inválido: ${donde} no tiene ${campo}.`;
    }
    if (v.anio != null && !Number.isInteger(v.anio)) return `Respaldo inválido: ${donde} tiene un año inválido.`; // año opcional
    if (v.precioCompra != null && typeof v.precioCompra !== 'number') return `Respaldo inválido: ${donde} tiene un precio inválido.`;
    if (v.fechaCompra != null && typeof v.fechaCompra !== 'string') return `Respaldo inválido: ${donde} tiene una fecha inválida.`;
    if (v.origen != null && typeof v.origen !== 'string') return `Respaldo inválido: ${donde} tiene un origen inválido.`;
    if (v.sigla != null && typeof v.sigla !== 'string') return `Respaldo inválido: ${donde} tiene una sigla inválida.`;
  }

  const slotIds = new Set();
  for (let i = 0; i < data.slots.length; i++) {
    const s = data.slots[i];
    const donde = `posición #${i + 1}`;
    if (!s || typeof s !== 'object') return `El respaldo está dañado: no se entiende la ${donde}.`;
    if (typeof s.id !== 'string' || !SLOT_ID_RE.test(s.id)) return `El respaldo está dañado: la ${donde} no corresponde a esta cava.`;
    if (slotIds.has(s.id)) return `Respaldo inválido: id de posición repetido (${s.id}).`;
    slotIds.add(s.id);
    // Una referencia colgada (posición → vino borrado) NO invalida el respaldo:
    // se importa como posición vacía (ver importData). Antes cortaba todo acá.
  }

  if (Array.isArray(data.colores)) {
    for (let i = 0; i < data.colores.length; i++) {
      const c = data.colores[i];
      const donde = `color #${i + 1}`;
      if (!c || typeof c !== 'object') return `El respaldo está dañado: no se entiende el ${donde}.`;
      if (typeof c.varietal !== 'string' || !c.varietal.trim()) return `Respaldo inválido: ${donde} no tiene varietal.`;
      if (typeof c.color !== 'string' || !/^#[0-9a-fA-F]{6}$/.test(c.color)) return `Respaldo inválido: ${donde} tiene un color inválido.`;
    }
  }
  return null;
}

/** Valida y reemplaza TODO el contenido (común a archivo y GitHub).
    Con origen 'github-auto' (sincronización al abrir) no pide confirmación:
    o no hacía falta, o el llamador ya la pidió. Devuelve true si importó. */
async function importData(data, origen) {
  const error = validateBackup(data);
  if (error) {
    if (origen === 'github-auto') {
      // Ignorarlo en silencio sería peor: el usuario creería que la
      // sincronización anda cuando hace semanas que no.
      console.warn('Cava: respaldo remoto inválido, se ignora:', error);
      toast('El respaldo de GitHub tiene un problema y no se cargó. Seguís con los datos de este dispositivo.', { error: true });
    } else {
      toast(`${error} No se cambió nada.`, { error: true });
    }
    return false;
  }

  if (origen !== 'github-auto') {
    // Entrante vs. actual: es lo que frena el clásico "importé sin querer un
    // respaldo de hace seis meses".
    const ok = await confirmDialog({
      title: '¿Importar este respaldo?',
      body: `Trae ${resumen(contarBackup(data.vinos, data.slots))}.`,
      detail: `Reemplaza por completo lo que tenés ahora: ${resumen(contarActual())}.`,
      confirmLabel: 'Importar y reemplazar',
      danger: true,
    });
    if (!ok) return false;
  }

  try {
    // Reemplazo atómico: clear + puts en una sola transacción.
    await withTx(state.db, ['vinos', 'slots', 'colores'], 'readwrite', (tx) => {
      const vinosStore = tx.objectStore('vinos');
      const slotsStore = tx.objectStore('slots');
      const coloresStore = tx.objectStore('colores');
      vinosStore.clear();
      slotsStore.clear();
      coloresStore.clear(); // el respaldo es un snapshot completo: si es v1 (sin colores), quedan vacíos
      for (const v of data.vinos) {
        const vino = { id: v.id, nombre: v.nombre, bodega: v.bodega, varietal: v.varietal };
        if (v.sigla != null) vino.sigla = v.sigla; // sigla editable (opcional)
        if (v.origen != null) vino.origen = v.origen; // origen opcional
        if (v.anio != null) vino.anio = v.anio; // año opcional
        if (v.precioCompra != null) vino.precioCompra = v.precioCompra;
        if (v.fechaCompra != null) vino.fechaCompra = v.fechaCompra;
        vinosStore.put(vino);
      }
      const vinoIdSet = new Set(data.vinos.map((v) => v.id));
      for (const s of data.slots) {
        // Referencia colgada (a un vino que no está en el respaldo): entra vacía
        // en vez de romper la importación entera.
        const vinoId = s.vinoId != null && vinoIdSet.has(s.vinoId) ? s.vinoId : null;
        slotsStore.put({ id: s.id, vinoId });
      }
      for (const c of (data.colores || [])) {
        coloresStore.put({ varietal: c.varietal, color: c.color });
      }
    });
    // El respaldo puede ser anterior a un cambio de LAYOUT: reconciliar de nuevo.
    await reconcileSlots();
    await loadAll();
    refreshAllSlotEls();
    populateFilterOptions();
    populateMapFilterOptions();
    renderVinos();
    setDirty(false); // los datos quedan iguales a un respaldo ya guardado
    const c = resumen(contarActual());
    toast(origen === 'archivo' ? `Respaldo importado · ${c}`
      : origen === 'github' ? `Restaurado desde GitHub · ${c}`
      : `Actualizado desde GitHub · ${c}`);
    return true;
  } catch (err) {
    console.error(err);
    toast('No se pudo importar el respaldo. Tus datos anteriores quedaron intactos.', { error: true });
    return false;
  }
}

async function importBackup(file) {
  let data;
  try {
    data = JSON.parse(await file.text());
  } catch (err) {
    toast('Ese archivo no es un respaldo de Cava — no se cambió nada.', { error: true });
    return;
  }
  const ok = await importData(data, 'archivo');
  // Lo importado de un archivo no está en GitHub: queda pendiente de subir.
  if (ok && getGithubConfig()) setDirty(true);
}

async function restoreFromGithub() {
  const cfg = getGithubConfig();
  if (!cfg) {
    toast('Primero configurá la sincronización con GitHub.', { error: true });
    return;
  }
  // importData avisa el resultado real y en el camino se queda con la ranura
  // del toast, así que el done() de acá se descarta solo (ver beginTask).
  const task = beginTask('Bajando el respaldo de GitHub…');
  try {
    const { sha, body } = await ghGetBackupMeta(cfg);
    if (!body) {
      task.fail(`Todavía no hay ningún respaldo en ${cfg.repo}. Guardá una vez desde acá para crearlo.`);
      return;
    }
    const data = JSON.parse(b64DecodeUtf8(body.content));
    if (await importData(data, 'github')) setSyncSha(sha);
    else task.cancel(null);
  } catch (err) {
    console.error(err);
    const msg = err instanceof TypeError
      ? 'No se pudo conectar con GitHub. Revisá tu conexión.'
      : `No se pudo leer el respaldo. ${err.message || ''}`;
    task.fail(msg.trim());
  }
}

/**
 * Sincronización al abrir la app: si otro dispositivo subió un respaldo más
 * nuevo (sha remoto ≠ último sha visto acá), se carga automáticamente; con
 * cambios locales sin subir, se pregunta cuál conservar. Sin config o sin
 * conexión no hace nada: la app sigue con los datos locales.
 */
async function syncFromGithub() {
  const cfg = getGithubConfig();
  if (!cfg) return;
  let meta;
  try {
    meta = await ghGetBackupMeta(cfg);
  } catch (err) {
    // Sin conexión: silencioso. Error de la API (token vencido, etc.): avisar.
    // Con contexto: esto salta al abrir la app, y un «Token inválido o
    // vencido.» pelado no dice de dónde salió.
    if (!(err instanceof TypeError)) {
      toast(`No se pudo revisar el respaldo en GitHub. ${err.message}`, { error: true });
    }
    return;
  }
  if (!meta.body || meta.sha === getSyncSha()) return; // sin respaldo remoto, o ya al día

  let data;
  try {
    data = JSON.parse(b64DecodeUtf8(meta.body.content));
  } catch (_) {
    console.warn('Cava: el respaldo remoto no es un JSON válido; se ignora.');
    toast('El respaldo que hay en GitHub está dañado y no se pudo leer. Seguís con los datos de este dispositivo.', { error: true });
    return;
  }

  if (isDirty()) {
    // Los dos labels SON la decisión: antes esto era un párrafo corrido que
    // terminaba explicando entre paréntesis qué hacía el botón Cancelar.
    const ok = await confirmDialog({
      title: 'Dos versiones distintas',
      body: 'En GitHub hay un respaldo más nuevo, y en este dispositivo hay cambios que todavía no subiste.',
      detail: `La de GitHub trae ${resumen(contarBackup(data.vinos, data.slots))}. Acá tenés ${resumen(contarActual())}.`,
      confirmLabel: 'Traer la de GitHub',
      cancelLabel: 'Conservar lo de acá',
      danger: true,
    });
    if (!ok) {
      toast('Seguís con los datos de este dispositivo. Subilos con el botón Guardar cambios cuando quieras.');
      return;
    }
  }
  if (await importData(data, 'github-auto')) setSyncSha(meta.sha);
}

function wireBackup() {
  updateSaveBtn(); // refleja el flag persistido de la sesión anterior

  // withBusy: el disabled mientras sube es lo que evita que un doble toque
  // haga dos commits en el repo.
  $('#btn-export').addEventListener('click', (e) => {
    withBusy(e.currentTarget, () => exportBackup().catch((err) => {
      console.error(err);
      toast('No se pudo exportar el respaldo.', { error: true });
    }));
  });

  // ⚙ Configuración: sincronización con GitHub + respaldo manual.
  const dlg = $('#dlg-config');

  $('#btn-config').addEventListener('click', () => {
    // Prefill con lo guardado (el token incluido: es local a este dispositivo).
    const cfg = getGithubConfig();
    $('#gh-repo').value = cfg ? cfg.repo : '';
    $('#gh-branch').value = cfg ? cfg.branch : 'main';
    $('#gh-path').value = cfg ? cfg.path : BACKUP_FILENAME;
    $('#gh-token').value = cfg ? cfg.token : '';
    openDialog(dlg);
  });

  $('#form-config').addEventListener('submit', (e) => {
    e.preventDefault();
    const repo = $('#gh-repo').value.trim();
    const token = $('#gh-token').value.trim();
    if (!repo && !token) {
      setGithubConfig(null); // vaciar los dos campos clave = desactivar
      dlg.close();
      toast('Sincronización desactivada — el botón Guardar cambios vuelve a exportar un archivo.');
      return;
    }
    if (!repo || !token) {
      toast('Completá repositorio y token (o vaciá los dos para desactivar).', { error: true });
      return;
    }
    if (!/^[^/\s]+\/[^/\s]+$/.test(repo)) {
      toast('El repositorio va como usuario/repo — por ejemplo, santi/cava-datos', { error: true });
      return;
    }
    const cfg = {
      repo,
      branch: $('#gh-branch').value.trim() || 'main',
      path: $('#gh-path').value.trim() || BACKUP_FILENAME,
      token,
    };
    if (!setGithubConfig(cfg)) {
      toast('No se pudo guardar la configuración (¿navegación privada?).', { error: true });
      return;
    }
    dlg.close();
    toast(`Sincronización lista con ${cfg.repo}`);
  });

  $('#btn-gh-test').addEventListener('click', (e) => {
    const repo = $('#gh-repo').value.trim();
    const token = $('#gh-token').value.trim();
    if (!repo || !token) {
      toast('Completá repositorio y token.', { error: true });
      return;
    }
    // El botón queda a la vista mientras prueba: alcanza con el spinner,
    // el resultado lo cuenta el toast.
    withBusy(e.currentTarget, async () => {
      try {
        const res = await fetch(`https://api.github.com/repos/${repo}`, {
          headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/vnd.github+json' },
        });
        if (res.ok) toast(`Todo bien: el token ve ${repo}`);
        else toast(ghErrorMsg(res.status), { error: true });
      } catch (_) {
        toast('No se pudo conectar con GitHub. Revisá tu conexión.', { error: true });
      }
    });
  });

  $('#btn-gh-restore').addEventListener('click', () => {
    dlg.close(); // el botón desaparece con el diálogo: el aviso va por el toast
    restoreFromGithub();
  });

  $('#btn-file-export').addEventListener('click', () => {
    dlg.close();
    buildBackupJson().then(exportToFile).catch((err) => {
      console.error(err);
      toast('No se pudo exportar el respaldo.', { error: true });
    });
  });

  const fileInput = $('#file-import');
  $('#btn-file-import').addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', async () => {
    const file = fileInput.files && fileInput.files[0];
    dlg.close();
    try {
      if (file) await importBackup(file);
    } finally {
      fileInput.value = ''; // permite re-elegir el mismo archivo
    }
  });
}

/* ============================================================================
   13. DIÁLOGOS GENÉRICOS + TOAST
   ============================================================================ */

/* --- Teclado en pantalla ---------------------------------------------------
   En iOS el teclado NO achica el viewport de layout: window.innerHeight,
   100dvh y los position:fixed no se enteran, así que un diálogo centrado
   queda tapado (por eso antes iban anclados arriba con margin-top: 7dvh).
   Lo único que sí lo refleja es visualViewport. Publicamos la diferencia en
   --kb y el CSS §9 la descuenta del inset de abajo y del max-height: el
   diálogo se recentra y se encoge sobre el teclado, y el cuerpo scrollea. */
const vv = window.visualViewport;

function syncKeyboardInset() {
  if (!vv) return;
  const kb = window.innerHeight - vv.height - vv.offsetTop;
  // Umbral de ruido: la barra de accesorios y el rebote del scroll dan
  // diferencias de pocas decenas de px que no son el teclado.
  document.documentElement.style.setProperty('--kb', (kb > 80 ? Math.round(kb) : 0) + 'px');
  // iOS a veces desplaza el viewport visual para "meter" el input a la vista;
  // como el body no scrollea, eso solo deja una franja vacía arriba.
  if (window.scrollY !== 0) window.scrollTo(0, 0);
}

/** Deja el campo enfocado a la vista dentro del scroller del diálogo. */
function keepFocusVisible(block) {
  const el = document.activeElement;
  if (!el || !el.closest || !el.closest('dialog[open]')) return;
  // rAF: esperamos a que el navegador aplique el nuevo --kb (y por lo tanto
  // el nuevo alto del diálogo) antes de medir.
  requestAnimationFrame(() => el.scrollIntoView({ block, behavior: 'auto' }));
}

function onViewportChange() {
  syncKeyboardInset();
  keepFocusVisible('center'); // el teclado se acaba de mover: recentrar
}

/* Foco al cerrar: el navegador lo deja en <body>. Solo lo devolvemos a
   botones — dárselo de vuelta a un input reabre el teclado en iOS (pasa al
   volver del alta de vino abierta desde #picker-search). */
const focusReturn = new WeakMap();

function openDialog(dlg) {
  hideToast(); // si no, un toast pendiente queda atrapado detrás del ::backdrop
  const prev = document.activeElement;
  if (prev && prev.tagName === 'BUTTON') focusReturn.set(dlg, prev);
  dlg.showModal();
  document.body.classList.add('dialog-open');
  if (vv) {
    // addEventListener deduplica por (tipo, referencia): con diálogos
    // apilados (confirmación sobre configuración) no se registra dos veces.
    vv.addEventListener('resize', onViewportChange);
    vv.addEventListener('scroll', onViewportChange);
  }
}

function wireDialogs() {
  document.querySelectorAll('dialog').forEach((dlg) => {
    // Tap en el backdrop cierra (el contenido está envuelto en .dlg-body,
    // así que un click directo sobre <dialog> solo puede ser el backdrop).
    dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
    dlg.addEventListener('close', () => {
      const back = focusReturn.get(dlg);
      focusReturn.delete(dlg);
      // isConnected: borrar un vino rehace la fila, el botón viejo ya no existe.
      if (back && back.isConnected) back.focus({ preventScroll: true });
      if (document.querySelector('dialog[open]')) return; // quedan apilados
      document.body.classList.remove('dialog-open');
      if (vv) {
        vv.removeEventListener('resize', onViewportChange);
        vv.removeEventListener('scroll', onViewportChange);
      }
      document.documentElement.style.setProperty('--kb', '0px');
    });
  });
  document.querySelectorAll('[data-close]').forEach((btn) => {
    btn.addEventListener('click', () => btn.closest('dialog').close());
  });
  // Cambiar de campo con el teclado ya abierto no dispara resize: 'nearest'
  // lo trae a la vista con el mínimo movimiento (sin saltos al tabular).
  document.addEventListener('focusin', (e) => {
    if (e.target.closest && e.target.closest('dialog[open]')) keepFocusVisible('nearest');
  });
  $('#toast-err').addEventListener('click', hideToast);
}

/**
 * Confirmación basada en promesas (reemplaza a confirm()).
 * { title, body, detail, confirmLabel, cancelLabel, danger }
 * El título es la pregunta, el cuerpo el motivo y el detalle la
 * consecuencia. Lo que hace Cancelar va en SU label, no en el texto.
 */
function confirmDialog(opts) {
  const { title, body, detail = '', confirmLabel = 'Aceptar',
          cancelLabel = 'Cancelar', danger = false } = opts;
  const dlg = $('#dlg-confirm');
  return new Promise((resolve) => {
    $('#confirm-title').textContent = title;
    $('#confirm-msg').textContent = body;
    const det = $('#confirm-detail');
    det.textContent = detail;
    det.hidden = !detail;
    const okBtn = $('#confirm-ok');
    okBtn.textContent = confirmLabel;
    okBtn.className = danger ? 'btn btn--danger-solid' : 'btn btn--primary';
    $('#confirm-cancel').textContent = cancelLabel;
    const onClose = () => {
      dlg.removeEventListener('close', onClose);
      resolve(dlg.returnValue === 'ok');
    };
    dlg.addEventListener('close', onClose);
    okBtn.onclick = () => dlg.close('ok');
    $('#confirm-cancel').onclick = () => dlg.close('');
    dlg.returnValue = '';
    openDialog(dlg);
  });
}

/* --- Toast: UNA sola ranura -------------------------------------------------
   Una acción larga la reserva y después se reemplaza en el mismo lugar por
   el resultado; nadie apila ni encola (no hay ningún camino que produzca dos
   mensajes seguidos, y una pila de avisos sobre el mapa sería peor). */
let toastTimer = null;
let toastTask = 0; // dueño actual de la ranura (ver beginTask)

function showToast(message, opts) {
  const { error = false, sticky = false } = opts || {};
  const el = $(error ? '#toast-err' : '#toast');
  const otro = $(error ? '#toast' : '#toast-err');
  otro.classList.remove('show');
  // Un <dialog> abierto con showModal() vive en el "top layer" del navegador,
  // por encima de cualquier z-index. Para que el toast se lea sobre el modal
  // (p. ej. "Probar conexión"), se cuelga del diálogo abierto —así comparte ese
  // top layer— y vuelve al body cuando no hay ninguno. Sigue position:fixed, así
  // que su lugar en pantalla no cambia.
  const host = document.querySelector('dialog[open]') || document.body;
  if (el.parentNode !== host) host.appendChild(el);
  el.textContent = message;
  el.classList.add('show');
  clearTimeout(toastTimer);
  if (!sticky) toastTimer = setTimeout(hideToast, error ? 5000 : 2600);
}

function hideToast() {
  clearTimeout(toastTimer);
  $('#toast').classList.remove('show');
  $('#toast-err').classList.remove('show');
}

/** API de siempre: toast('…') / toast('…', { error: true }). */
function toast(message, opts) { toastTask++; showToast(message, opts); }

/**
 * Acción larga (red). El "…" aparece recién a los 400ms — las corridas
 * rápidas no parpadean — y después se reemplaza en el mismo lugar:
 *   const t = beginTask('Subiendo el respaldo a GitHub…');
 *   t.done('Guardado en GitHub · …')   t.fail('No se pudo…')   t.cancel('…')
 * Si en el medio alguien más llamó a toast() (p. ej. importData ya avisó el
 * resultado real), la tarea perdió la ranura y sus mensajes se descartan.
 */
function beginTask(pendingMsg) {
  const id = ++toastTask;
  const timer = setTimeout(() => {
    if (id === toastTask) showToast(pendingMsg, { sticky: true });
  }, 400);
  const end = (msg, opts) => {
    clearTimeout(timer);
    if (id !== toastTask) return;
    if (msg) showToast(msg, opts); else hideToast();
  };
  return { done: (m) => end(m), fail: (m) => end(m, { error: true }), cancel: (m) => end(m) };
}

/** Corre una acción async con el botón bloqueado y un spinner. El disabled
    es lo que evita que un doble toque suba el respaldo dos veces. */
async function withBusy(btn, fn) {
  if (btn.disabled) return;
  btn.disabled = true;
  btn.setAttribute('aria-busy', 'true');
  btn.classList.add('is-busy');
  try {
    return await fn();
  } finally {
    btn.classList.remove('is-busy');
    btn.removeAttribute('aria-busy');
    btn.disabled = false;
  }
}

/* ============================================================================
   14. ARRANQUE
   ============================================================================ */
(async function init() {
  wireDialogs();

  try {
    state.db = await openDB();
    await reconcileSlots(); // primera carga: crea todos los huecos vacíos
    await loadAll();
  } catch (err) {
    console.error(err);
    toast('No se pudo abrir la base de datos local. La app no puede funcionar sin IndexedDB.', { error: true });
    return;
  }

  buildMaps();
  refreshAllSlotEls();
  wireMapNav();
  wireMapFilters();
  wireSlotDialog();
  wireVinosView();
  wireVinoForm();
  wireDashboard();
  wireBackup();
  populateFilterOptions();
  populateMapFilterOptions();
  renderVinos();

  wireRouter();

  // Sincronización al abrir: si otro dispositivo subió un respaldo más nuevo,
  // se carga acá (con pregunta solo si hay cambios locales sin subir). Corre
  // en segundo plano: la app ya está usable con los datos locales.
  syncFromGithub().catch((err) => console.error(err));

  // Pedir persistencia de almacenamiento (reduce el riesgo de que Safari
  // desaloje IndexedDB). Best-effort: si falla, no pasa nada.
  if (navigator.storage && navigator.storage.persist) {
    navigator.storage.persist().catch(() => {});
  }

  // Service worker para offline/PWA. Nunca debe romper la app (p. ej. file://).
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch((err) => {
      console.warn('Service worker no registrado:', err);
    });
  }
})();
