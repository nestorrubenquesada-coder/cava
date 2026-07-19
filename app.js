'use strict';
/* ============================================================================
   Cava — mapa visual de la cava de vinos
   Vanilla JS, sin dependencias. Persistencia en IndexedDB (localStorage solo
   para la preferencia de tema y el flag de cambios sin respaldar).
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
    slotsPorModulo: { cols: 4, filas: 3 },      // filas 1–3
    ultimaFila: { cols: 4, filas: 5 },          // fila 4 (los 6 módulos de abajo)
  },
  tab2: {
    modulos: { cols: 4, filas: 2 },
    slotsPorModulo: { cols: 5, filas: 3 },
    columnaFinal: { cols: 5, filas: 6 },        // módulo alto que ocupa las 2 filas (dos módulos normales apilados)
  }
};

const VARIETALES = [
  { grupo: 'Tintas', items: ['Malbec', 'Cabernet Sauvignon', 'Cabernet Franc', 'Merlot', 'Syrah', 'Pinot Noir', 'Bonarda', 'Tempranillo', 'Tannat', 'Petit Verdot', 'Sangiovese', 'Nebbiolo', 'Garnacha', 'Carménère', 'Zinfandel', 'Barbera', 'Montepulciano', 'Monastrell', 'Pinotage', 'Touriga Nacional'] },
  { grupo: 'Blancas', items: ['Chardonnay', 'Sauvignon Blanc', 'Torrontés', 'Viognier', 'Chenin Blanc', 'Riesling', 'Semillón', 'Pinot Grigio', 'Gewürztraminer', 'Albariño', 'Verdejo', 'Moscatel', 'Marsanne', 'Roussanne'] },
  { grupo: 'Genéricos', items: ['Rosado', 'Espumante', 'Blend/Corte'] },
];
const OTRO_VALUE = '__otro__'; // valor del <option> "Otro (texto libre)"

const DB_NAME = 'cava';
const DB_VERSION = 1;
const THEME_KEY = 'cava-theme';
const DIRTY_KEY = 'cava-dirty'; // hay cambios sin respaldar (ver §12)
const BACKUP_SCHEMA_VERSION = 1;
const SLOT_ID_RE = /^t([12])-m(\d{2})-(\d{2})-s(\d{2})-(\d{2})$/;

/* ============================================================================
   2. UTILIDADES GENERALES
   ============================================================================ */
const $ = (sel) => document.querySelector(sel);

/** Normaliza texto para búsquedas: minúsculas y sin acentos ("Semillón" ~ "semillon"). */
function norm(s) {
  return String(s == null ? '' : s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
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
     - "vinos": keyPath "id" (string UUID). Campos: nombre, bodega, anio,
       varietal y opcionales precioCompra, fechaCompra.
     - "slots": keyPath "id" (string derivado de la posición física, ver §4).
       Campos: vinoId (id de "vinos") o null si el hueco está vacío.
   Sin índices: el dataset completo (≈490 slots + catálogo) se carga en
   memoria al arrancar y todo filtrado/conteo se hace ahí.
   ============================================================================ */

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('vinos')) db.createObjectStore('vinos', { keyPath: 'id' });
      if (!db.objectStoreNames.contains('slots')) db.createObjectStore('slots', { keyPath: 'id' });
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
   (fila 1, columna 5) con filas internas 01–06: solo el render sabe que
   ocupa dos filas de la grilla.
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

function describeSlot(id) {
  const p = parseSlotId(id);
  if (!p) return id;
  const nombreTab = p.tab === 1 ? 'Principal' : 'Secundaria';
  return `Cava ${nombreTab} · Módulo fila ${p.modFila}, columna ${p.modCol} · Hueco fila ${p.slotFila}, columna ${p.slotCol}`;
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
        const inner = (mf === L.modulos.filas) ? L.ultimaFila : L.slotsPorModulo;
        out.push({ tab, modFila: mf, modCol: mc, inner, alto: false });
      }
    }
  } else {
    const L = LAYOUT.tab2;
    for (let mf = 1; mf <= L.modulos.filas; mf++) {
      for (let mc = 1; mc <= L.modulos.cols; mc++) {
        out.push({ tab, modFila: mf, modCol: mc, inner: L.slotsPorModulo, alto: false });
      }
    }
    // Módulo alto de la columna final: ocupa todo el alto de la grilla.
    out.push({ tab, modFila: 1, modCol: L.modulos.cols + 1, inner: L.columnaFinal, alto: true });
  }
  return out;
}

/** Recorre todos los huecos esperados según LAYOUT (fuente de verdad de la geometría). */
function forEachExpectedSlot(cb) {
  for (const mod of [...modulesOf(1), ...modulesOf(2)]) {
    for (let sf = 1; sf <= mod.inner.filas; sf++) {
      for (let sc = 1; sc <= mod.inner.cols; sc++) {
        cb({ ...mod, slotFila: sf, slotCol: sc, id: makeSlotId(mod.tab, mod.modFila, mod.modCol, sf, sc) });
      }
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
  slotEls: new Map(),    // slotId -> { btn, label } (cache del DOM del mapa)
  currentSlotId: null,   // hueco abierto en el diálogo de posición
  pendingSlotId: null,   // hueco a asignar cuando se crea un vino desde el selector
  editingVinoId: null,   // vino en edición en el formulario (null = alta)
  mapScrollLeft: 0,      // página del carrusel al salir del mapa (se restaura al volver)
  filters: { q: '', varietal: '', anio: '' },
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
  await withTx(state.db, 'slots', 'readwrite', (tx) => {
    const store = tx.objectStore('slots');
    return req(store.getAll()).then((existing) => {
      const have = new Set();
      let huerfanos = 0;
      for (const slot of existing) {
        have.add(slot.id);
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
  const [vinos, slots] = await withTx(state.db, ['vinos', 'slots'], 'readonly', (tx) =>
    Promise.all([req(tx.objectStore('vinos').getAll()), req(tx.objectStore('slots').getAll())])
  );
  state.vinos = new Map(vinos.map((v) => [v.id, v]));
  state.slots = new Map(slots.filter((s) => expected.has(s.id)).map((s) => [s.id, s]));
}

async function saveVino(vino) {
  await withTx(state.db, 'vinos', 'readwrite', (tx) => { tx.objectStore('vinos').put(vino); });
  state.vinos.set(vino.id, vino);
  setDirty(true);
}

/** Borra un vino y vacía sus huecos en UNA transacción (todo o nada). */
async function deleteVino(vinoId) {
  const slotIds = [...state.slots.values()].filter((s) => s.vinoId === vinoId).map((s) => s.id);
  await withTx(state.db, ['vinos', 'slots'], 'readwrite', (tx) => {
    tx.objectStore('vinos').delete(vinoId);
    const slots = tx.objectStore('slots');
    for (const id of slotIds) slots.put({ id, vinoId: null });
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
};

function applyRoute() {
  let hash = location.hash;
  if (!ROUTES[hash]) {
    // Cubre también los hashes viejos "#/cava/principal" y "#/cava/secundaria".
    hash = '#/cava';
    history.replaceState(null, '', hash);
  }
  const enCava = ROUTES[hash].view === 'cava';

  // Un elemento oculto pierde su scroll: guardar la página del carrusel al
  // salir del mapa y restaurarla al volver.
  const mapArea = $('.map-area');
  const viewCava = $('#view-cava');
  if (!viewCava.hidden && !enCava) state.mapScrollLeft = mapArea.scrollLeft;

  viewCava.hidden = !enCava;
  $('#view-vinos').hidden = enCava;

  // Header único: "Catálogo de Vinos" en el mapa; "Volver" en el catálogo.
  $('#btn-vinos').hidden = !enCava;
  $('#btn-volver').hidden = enCava;

  if (enCava) mapArea.scrollLeft = state.mapScrollLeft;
}

function wireRouter() {
  $('#btn-vinos').addEventListener('click', () => { location.hash = '#/vinos'; });
  $('#btn-volver').addEventListener('click', () => { location.hash = '#/cava'; });
  window.addEventListener('hashchange', applyRoute);
  applyRoute();
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
    const modEl = document.createElement('div');
    modEl.className = 'mod';
    // La subcuadrícula interna sale de LAYOUT (única fuente de verdad).
    // Tracks fijos de --slot px: cada hueco es un cuadrado exacto (ver §7 del CSS).
    modEl.style.gridTemplateColumns = `repeat(${mod.inner.cols}, var(--slot))`;
    modEl.style.gridTemplateRows = `repeat(${mod.inner.filas}, var(--slot))`;
    // Posición explícita en la grilla de módulos; el módulo alto ocupa las 2 filas.
    modEl.style.gridColumn = String(mod.modCol);
    modEl.style.gridRow = mod.alto ? `${mod.modFila} / span 2` : String(mod.modFila);

    for (let sf = 1; sf <= mod.inner.filas; sf++) {
      for (let sc = 1; sc <= mod.inner.cols; sc++) {
        const id = makeSlotId(tab, mod.modFila, mod.modCol, sf, sc);
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'slot';
        btn.dataset.slotId = id;
        const label = document.createElement('span');
        label.className = 'slot-v';
        btn.appendChild(label);
        modEl.appendChild(btn);
        state.slotEls.set(id, { btn, label });
      }
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
  els.label.textContent = vino ? norm(vino.bodega).charAt(0).toUpperCase() : '';
  els.btn.title = vino ? `${vino.nombre} — ${vino.bodega} (${vino.anio})` : '';
  els.btn.setAttribute('aria-label', `${vino ? vino.nombre : 'Hueco vacío'} — ${describeSlot(slotId)}`);
}

function refreshAllSlotEls() {
  for (const id of state.slotEls.keys()) updateSlotEl(id);
}

/* Carrusel: flechas para pasar de sección (el swipe táctil lo da scroll-snap
   solo; acá solo se pagina con las flechas y se alterna cuál se muestra). */
function wireMapPager() {
  const area = $('.map-area');
  const prev = $('#map-prev');
  const next = $('#map-next');

  const page = () => Math.round(area.scrollLeft / area.clientWidth);
  const go = (dir) => area.scrollTo({ left: (page() + dir) * area.clientWidth, behavior: 'smooth' });
  prev.addEventListener('click', () => go(-1));
  next.addEventListener('click', () => go(1));

  const update = () => {
    const enSegunda = area.scrollLeft > area.clientWidth / 2;
    prev.hidden = !enSegunda;
    next.hidden = enSegunda;
  };
  area.addEventListener('scroll', update, { passive: true });
  update();
}

/* ============================================================================
   9. DIÁLOGO DE POSICIÓN + SELECTOR BUSCABLE
   ============================================================================ */

function openSlotDialog(slotId) {
  state.currentSlotId = slotId;
  $('#slot-pos').textContent = describeSlot(slotId);

  const slot = state.slots.get(slotId);
  const vino = slot && slot.vinoId ? state.vinos.get(slot.vinoId) : null;

  if (vino) {
    $('#slot-wine').hidden = false;
    $('#slot-picker').hidden = true;
    $('#slot-wine-nombre').textContent = vino.nombre;
    $('#slot-wine-meta').textContent = `${vino.bodega} · ${vino.anio} · ${vino.varietal}`;
    const extra = [];
    if (vino.precioCompra != null) extra.push(fmtPrecio(vino.precioCompra));
    if (vino.fechaCompra) extra.push(`Comprado el ${fmtFecha(vino.fechaCompra)}`);
    $('#slot-wine-extra').textContent = extra.join(' · ');
    $('#slot-wine-extra').hidden = extra.length === 0;
  } else {
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
    const li = document.createElement('li');
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.dataset.vinoId = vino.id;
    const name = document.createElement('span');
    name.className = 'picker-name';
    name.textContent = vino.nombre;
    const sub = document.createElement('span');
    sub.className = 'picker-sub';
    sub.textContent = `${vino.bodega} · ${vino.anio} · ${vino.varietal}`;
    btn.append(name, sub);
    li.appendChild(btn);
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
  createLabel.textContent = query.trim() ? `＋ Crear «${query.trim()}»` : '＋ Crear vino nuevo';
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

    if (btn.dataset.vinoId) {
      const vino = state.vinos.get(btn.dataset.vinoId);
      try {
        await setSlotVino(state.currentSlotId, btn.dataset.vinoId);
        $('#dlg-slot').close();
        if (vino) toast(`Asignado: ${vino.nombre}`);
      } catch (err) {
        console.error(err);
        toast('No se pudo guardar la posición. Intentá de nuevo.', { error: true });
      }
    }
  });

  $('#btn-slot-change').addEventListener('click', showPicker);

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

function vinoMatchesFilters(vino) {
  const f = state.filters;
  if (f.q) {
    const q = norm(f.q);
    if (!norm(vino.nombre).includes(q) && !norm(vino.bodega).includes(q)) return false;
  }
  if (f.varietal && vino.varietal !== f.varietal) return false;
  if (f.anio && String(vino.anio) !== f.anio) return false;
  return true;
}

/** Rellena los selects de filtro con los valores presentes en el catálogo. */
function populateFilterOptions() {
  const varietales = [...new Set([...state.vinos.values()].map((v) => v.varietal))]
    .sort((a, b) => norm(a).localeCompare(norm(b)));
  const anios = [...new Set([...state.vinos.values()].map((v) => v.anio))].sort((a, b) => b - a);

  rebuildSelect($('#f-varietal'), 'Todos los varietales', varietales.map((v) => [v, v]), state.filters.varietal);
  rebuildSelect($('#f-anio'), 'Todos los años', anios.map((a) => [String(a), String(a)]), state.filters.anio);
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

function renderVinos() {
  const listEl = $('#vino-list');
  const emptyEl = $('#vinos-empty');
  const occ = occupancyMap();

  const rows = [...state.vinos.values()]
    .filter(vinoMatchesFilters)
    .sort((a, b) => norm(a.nombre).localeCompare(norm(b.nombre)) || a.anio - b.anio);

  listEl.textContent = '';

  if (rows.length === 0) {
    listEl.hidden = true;
    emptyEl.hidden = false;
    emptyEl.textContent = state.vinos.size === 0
      ? 'Todavía no cargaste vinos. Empezá con «Agregar vino».'
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
    const parts = [vino.bodega, String(vino.anio), vino.varietal];
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
  $('#f-varietal').addEventListener('change', (e) => { state.filters.varietal = e.target.value; renderVinos(); });
  $('#f-anio').addEventListener('change', (e) => { state.filters.anio = e.target.value; renderVinos(); });

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
      const msg = count > 0
        ? `«${vino.nombre}» está en ${count} posición${count === 1 ? '' : 'es'} del mapa; se vaciarán. ¿Borrar el vino del catálogo?`
        : `¿Borrar «${vino.nombre}» del catálogo?`;
      const ok = await confirmDialog(msg, { confirmLabel: 'Borrar', danger: true });
      if (!ok) return;
      try {
        await deleteVino(vino.id);
        populateFilterOptions();
        renderVinos();
        toast('Vino borrado');
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

function buildVarietalSelect() {
  const select = $('#v-varietal');
  select.textContent = '';
  const placeholder = document.createElement('option');
  placeholder.value = '';
  placeholder.textContent = 'Elegí un varietal…';
  placeholder.disabled = true;
  placeholder.selected = true;
  select.appendChild(placeholder);
  for (const { grupo, items } of VARIETALES) {
    const og = document.createElement('optgroup');
    og.label = grupo;
    for (const item of items) {
      const opt = document.createElement('option');
      opt.value = item;
      opt.textContent = item;
      og.appendChild(opt);
    }
    select.appendChild(og);
  }
  const otro = document.createElement('option');
  otro.value = OTRO_VALUE;
  otro.textContent = 'Otro (texto libre)';
  select.appendChild(otro);
}

function isKnownVarietal(v) {
  return VARIETALES.some(({ items }) => items.includes(v));
}

function syncVarietalOtro() {
  const isOtro = $('#v-varietal').value === OTRO_VALUE;
  $('#field-varietal-otro').hidden = !isOtro;
  const input = $('#v-varietal-otro');
  input.disabled = !isOtro;
  input.required = isOtro;
}

/** Abre el formulario. vino=null → alta (prefill opcional, p. ej. desde el selector). */
function openVinoForm(vino, prefill) {
  state.editingVinoId = vino ? vino.id : null;
  $('#vino-form-title').textContent = vino ? 'Editar vino' : 'Nuevo vino';

  const form = $('#form-vino');
  form.reset();
  $('#v-nombre').value = vino ? vino.nombre : (prefill && prefill.nombre) || '';
  $('#v-bodega').value = vino ? vino.bodega : '';
  $('#v-anio').value = vino ? vino.anio : '';
  $('#v-precio').value = vino && vino.precioCompra != null ? vino.precioCompra : '';
  $('#v-fecha').value = (vino && vino.fechaCompra) || '';

  const select = $('#v-varietal');
  if (vino) {
    if (isKnownVarietal(vino.varietal)) {
      select.value = vino.varietal;
    } else {
      select.value = OTRO_VALUE;
      $('#v-varietal-otro').value = vino.varietal;
    }
  } else {
    select.value = '';
  }
  syncVarietalOtro();
  if (vino && !isKnownVarietal(vino.varietal)) $('#v-varietal-otro').value = vino.varietal;

  openDialog($('#dlg-vino'));
}

function wireVinoForm() {
  buildVarietalSelect();
  $('#v-varietal').addEventListener('change', syncVarietalOtro);

  $('#form-vino').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    if (!form.reportValidity()) return;

    const selectVal = $('#v-varietal').value;
    const varietal = selectVal === OTRO_VALUE ? $('#v-varietal-otro').value.trim() : selectVal;
    const anio = parseInt($('#v-anio').value, 10);
    if (!varietal || !Number.isInteger(anio)) return;

    const vino = {
      id: state.editingVinoId || newId(),
      nombre: $('#v-nombre').value.trim(),
      bodega: $('#v-bodega').value.trim(),
      anio,
      varietal,
    };
    if (!vino.nombre || !vino.bodega) return;
    const precio = $('#v-precio').value;
    if (precio !== '' && !Number.isNaN(parseFloat(precio))) vino.precioCompra = parseFloat(precio);
    const fecha = $('#v-fecha').value;
    if (fecha) vino.fechaCompra = fecha;

    const assignTo = state.pendingSlotId; // capturado antes de cerrar (close lo resetea)
    try {
      await saveVino(vino);
      if (assignTo) {
        await setSlotVino(assignTo, vino.id);
        state.pendingSlotId = null;
      }
      populateFilterOptions();
      renderVinos();
      refreshAllSlotEls(); // por si cambió la bodega (inicial) de un vino ya ubicado
      $('#dlg-vino').close();
      toast(assignTo ? `«${vino.nombre}» creado y asignado` : 'Vino guardado');
    } catch (err) {
      console.error(err);
      toast('No se pudo guardar el vino. Intentá de nuevo.', { error: true });
    }
  });

  // Si el formulario se cierra sin guardar, se descarta la asignación pendiente.
  $('#dlg-vino').addEventListener('close', () => { state.pendingSlotId = null; });
}

/* ============================================================================
   12. RESPALDO: EXPORTAR / IMPORTAR JSON
   Formato del archivo:
   { app: "cava", schemaVersion: 1, exportedAt: ISO, vinos: [...], slots: [...] }
   Importar reemplaza TODO el contenido en una sola transacción: si algo
   falla, IndexedDB revierte también los clear() y no se pierde nada.

   "Cambios sin respaldar": cada mutación (vino o posición) marca un flag
   persistente en localStorage; mientras esté activo, aparece en el header
   el botón verde "Guardar cambios" (que exporta el respaldo). Sin cambios
   pendientes no hay botón. Exportar (o importar un respaldo, que deja los
   datos iguales a un archivo guardado) lo limpia.
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

async function exportBackup() {
  const [vinos, slots] = await withTx(state.db, ['vinos', 'slots'], 'readonly', (tx) =>
    Promise.all([req(tx.objectStore('vinos').getAll()), req(tx.objectStore('slots').getAll())])
  );
  const envelope = {
    app: 'cava',
    schemaVersion: BACKUP_SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    vinos,
    slots,
  };
  const json = JSON.stringify(envelope, null, 2);
  const d = new Date();
  const filename = `vinos-backup-${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}.json`;

  // En iPad, la hoja de compartir ofrece "Guardar en Archivos" (iCloud Drive)
  // y funciona también instalada como PWA, donde la descarga por <a> es frágil.
  if ('ontouchend' in document && navigator.canShare) {
    try {
      const file = new File([json], filename, { type: 'application/json' });
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: filename });
        setDirty(false);
        toast('Respaldo exportado');
        return;
      }
    } catch (err) {
      if (err && err.name === 'AbortError') return; // el usuario canceló la hoja de compartir
      // Cualquier otro error: caemos a la descarga clásica.
    }
  }

  const url = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
  setDirty(false);
  toast('Respaldo exportado');
}

/** Valida el archivo de respaldo. Devuelve un mensaje de error o null si es válido. */
function validateBackup(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return 'El archivo no tiene el formato de un respaldo de Cava.';
  if (data.app !== undefined && data.app !== 'cava') return 'El archivo no es un respaldo de esta app.';
  if (data.schemaVersion !== BACKUP_SCHEMA_VERSION) return 'Versión de respaldo no soportada.';
  if (!Array.isArray(data.vinos)) return 'El respaldo no tiene la lista de vinos.';
  if (!Array.isArray(data.slots)) return 'El respaldo no tiene la lista de posiciones.';

  const vinoIds = new Set();
  for (let i = 0; i < data.vinos.length; i++) {
    const v = data.vinos[i];
    const donde = `vino #${i + 1}`;
    if (!v || typeof v !== 'object') return `Respaldo inválido: ${donde} no es un objeto.`;
    if (typeof v.id !== 'string' || !v.id) return `Respaldo inválido: ${donde} no tiene id.`;
    if (vinoIds.has(v.id)) return `Respaldo inválido: id de vino repetido (${v.id}).`;
    vinoIds.add(v.id);
    for (const campo of ['nombre', 'bodega', 'varietal']) {
      if (typeof v[campo] !== 'string' || !v[campo].trim()) return `Respaldo inválido: ${donde} no tiene ${campo}.`;
    }
    if (!Number.isInteger(v.anio)) return `Respaldo inválido: ${donde} tiene un año inválido.`;
    if (v.precioCompra != null && typeof v.precioCompra !== 'number') return `Respaldo inválido: ${donde} tiene un precio inválido.`;
    if (v.fechaCompra != null && typeof v.fechaCompra !== 'string') return `Respaldo inválido: ${donde} tiene una fecha inválida.`;
  }

  const slotIds = new Set();
  for (let i = 0; i < data.slots.length; i++) {
    const s = data.slots[i];
    const donde = `posición #${i + 1}`;
    if (!s || typeof s !== 'object') return `Respaldo inválido: ${donde} no es un objeto.`;
    if (typeof s.id !== 'string' || !SLOT_ID_RE.test(s.id)) return `Respaldo inválido: ${donde} tiene un id no reconocido.`;
    if (slotIds.has(s.id)) return `Respaldo inválido: id de posición repetido (${s.id}).`;
    slotIds.add(s.id);
    if (s.vinoId != null && !vinoIds.has(s.vinoId)) return `Respaldo inválido: ${donde} referencia un vino inexistente.`;
  }
  return null;
}

async function importBackup(file) {
  let data;
  try {
    data = JSON.parse(await file.text());
  } catch (err) {
    toast('El archivo no es un JSON válido. No se modificó nada.', { error: true });
    return;
  }

  const error = validateBackup(data);
  if (error) {
    toast(`${error} No se modificó nada.`, { error: true });
    return;
  }

  const ok = await confirmDialog(
    `Se importarán ${data.vinos.length} vino${data.vinos.length === 1 ? '' : 's'} y ${data.slots.length} posiciones. Esto sobrescribe tu cava actual por completo. ¿Seguro?`,
    { confirmLabel: 'Importar y sobrescribir', danger: true }
  );
  if (!ok) return;

  try {
    // Reemplazo atómico: clear + puts en una sola transacción.
    await withTx(state.db, ['vinos', 'slots'], 'readwrite', (tx) => {
      const vinosStore = tx.objectStore('vinos');
      const slotsStore = tx.objectStore('slots');
      vinosStore.clear();
      slotsStore.clear();
      for (const v of data.vinos) {
        const vino = { id: v.id, nombre: v.nombre, bodega: v.bodega, anio: v.anio, varietal: v.varietal };
        if (v.precioCompra != null) vino.precioCompra = v.precioCompra;
        if (v.fechaCompra != null) vino.fechaCompra = v.fechaCompra;
        vinosStore.put(vino);
      }
      for (const s of data.slots) {
        slotsStore.put({ id: s.id, vinoId: s.vinoId == null ? null : s.vinoId });
      }
    });
    // El respaldo puede ser anterior a un cambio de LAYOUT: reconciliar de nuevo.
    await reconcileSlots();
    await loadAll();
    refreshAllSlotEls();
    populateFilterOptions();
    renderVinos();
    setDirty(false); // los datos quedan iguales a un archivo ya guardado
    toast('Respaldo importado');
  } catch (err) {
    console.error(err);
    toast('No se pudo importar el respaldo. Tus datos anteriores quedaron intactos.', { error: true });
  }
}

function wireBackup() {
  updateSaveBtn(); // refleja el flag persistido de la sesión anterior

  $('#btn-export').addEventListener('click', () => {
    exportBackup().catch((err) => {
      console.error(err);
      toast('No se pudo exportar el respaldo.', { error: true });
    });
  });

  const fileInput = $('#file-import');
  $('#btn-import').addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', async () => {
    const file = fileInput.files && fileInput.files[0];
    try {
      if (file) await importBackup(file);
    } finally {
      fileInput.value = ''; // permite re-elegir el mismo archivo
    }
  });
}

/* ============================================================================
   13. TEMA
   ============================================================================ */
const THEME_ORDER = ['auto', 'light', 'dark'];
const THEME_LABEL = { auto: 'Tema: automático', light: 'Tema: claro', dark: 'Tema: oscuro' };

function currentTheme() {
  const t = document.documentElement.dataset.theme;
  return THEME_ORDER.includes(t) ? t : 'auto';
}

function applyTheme(pref) {
  document.documentElement.dataset.theme = pref;
  try { localStorage.setItem(THEME_KEY, pref); } catch (_) { /* modo privado */ }

  for (const t of THEME_ORDER) $(`#theme-icon-${t}`).hidden = t !== pref;
  const btn = $('#btn-theme');
  btn.setAttribute('aria-label', THEME_LABEL[pref]);
  btn.title = THEME_LABEL[pref];

  // Color de la barra del navegador: en "auto" mandan las media queries de
  // los <meta>; con tema forzado, ambos apuntan al color forzado.
  const light = $('#meta-tc-light');
  const dark = $('#meta-tc-dark');
  if (pref === 'auto') {
    light.content = '#ffffff';
    dark.content = '#0d1117';
  } else {
    light.content = dark.content = (pref === 'dark' ? '#0d1117' : '#ffffff');
  }
}

function wireTheme() {
  applyTheme(currentTheme());
  $('#btn-theme').addEventListener('click', () => {
    const next = THEME_ORDER[(THEME_ORDER.indexOf(currentTheme()) + 1) % THEME_ORDER.length];
    applyTheme(next);
  });
}

/* ============================================================================
   14. DIÁLOGOS GENÉRICOS + TOAST
   ============================================================================ */

function openDialog(dlg) {
  dlg.showModal();
  document.body.classList.add('dialog-open');
}

function wireDialogs() {
  document.querySelectorAll('dialog').forEach((dlg) => {
    // Tap en el backdrop cierra (el contenido está envuelto en .dlg-body,
    // así que un click directo sobre <dialog> solo puede ser el backdrop).
    dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
    dlg.addEventListener('close', () => {
      if (!document.querySelector('dialog[open]')) document.body.classList.remove('dialog-open');
    });
  });
  document.querySelectorAll('[data-close]').forEach((btn) => {
    btn.addEventListener('click', () => btn.closest('dialog').close());
  });
}

/** Confirmación basada en promesas (reemplaza a confirm()). */
function confirmDialog(message, opts) {
  const { confirmLabel = 'Aceptar', danger = false } = opts || {};
  const dlg = $('#dlg-confirm');
  return new Promise((resolve) => {
    $('#confirm-msg').textContent = message;
    const okBtn = $('#confirm-ok');
    okBtn.textContent = confirmLabel;
    okBtn.className = danger ? 'btn btn--danger-solid' : 'btn btn--primary';
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

let toastTimer = null;
function toast(message, opts) {
  const { error = false } = opts || {};
  const el = $('#toast');
  el.textContent = message;
  el.classList.toggle('err', error);
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), error ? 4200 : 2600);
}

/* ============================================================================
   15. ARRANQUE
   ============================================================================ */
(async function init() {
  wireTheme();
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
  wireMapPager();
  wireSlotDialog();
  wireVinosView();
  wireVinoForm();
  wireBackup();
  populateFilterOptions();
  renderVinos();

  wireRouter();

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
