/**
 * Contact page map — Hong Kong official vector basemap from the
 * CSDI / Lands Department "Vector Map API" + "Vector Map Label API".
 *
 * Approach: MapLibre GL JS cannot consume the LandsD style JSON directly
 * (its source URL, glyphs path and tile template are relative / ArcGIS
 * flavoured), so we fetch the basemap + label style JSONs, rewrite them
 * to absolute URLs, merge them into one MapLibre style, and render.
 * Label language follows the site language toggle (tc / en).
 *
 * API docs: https://portal.csdi.gov.hk/csdi-webpage/apidoc/VectorMapAPI
 * Attribution (required by LandsD terms) renders in the attribution
 * control at the bottom-right corner of the map.
 */

/** @type {string} LandsD Vector Map API root (WGS84 tiles) */
const CSDI_VT_BASE = 'https://mapapi.geodata.gov.hk/gs/api/v1.0.0/vt';

/**
 * Official acknowledgement required by the LandsD API terms of use.
 * Shown by the MapLibre attribution control (bottom-right by default).
 * @type {string}
 */
const LANDSD_ATTRIBUTION =
  '<a href="https://api.portal.hkmapservice.gov.hk/disclaimer" target="_blank" rel="noopener">&copy; Map information from Lands Department 地圖資料來源：地政總署</a>';

/** @type {import('maplibre-gl').Map | null} live map instance, null before init */
let contactMap = null;

/** @type {string | null} language requested before the map finished init */
let pendingLabelLang = null;

/**
 * Maps the site language to a LandsD label language code.
 * @param {'en' | 'zh-Hant'} lang - site language
 * @returns {'en' | 'tc'} LandsD label language
 */
function toLabelLang(lang) {
  return lang === 'en' ? 'en' : 'tc';
}

/**
 * Builds the LandsD style + tile URLs for one resource.
 * @param {string} path - e.g. 'basemap/WGS84' or 'label/hk/tc/WGS84'
 * @returns {{ styleUrl: string, tilesUrl: string, fontsUrl: string }}
 */
function csdiUrls(path) {
  const root = `${CSDI_VT_BASE}/${path}`;
  return {
    styleUrl: `${root}/resources/styles/root.json`,
    tilesUrl: `${root}/tile/{z}/{y}/{x}.pbf`,
    fontsUrl: `${root}/resources/fonts/{fontstack}/{range}.pbf`,
  };
}

/**
 * Rewrites one LandsD style JSON for MapLibre: absolute glyphs and an
 * explicit vector source (the shipped source URL is a relative ArcGIS
 * TileJSON endpoint MapLibre cannot parse).
 * @param {object} style - parsed LandsD style JSON (mutated)
 * @param {string} path - resource path, see csdiUrls()
 * @param {string} sourceId - source id to use in the merged style
 * @returns {object} the same style object, MapLibre-ready
 */
function adaptCsdiStyle(style, path, sourceId) {
  const urls = csdiUrls(path);
  style.glyphs = urls.fontsUrl;
  style.sources = {
    [sourceId]: {
      type: 'vector',
      tiles: [urls.tilesUrl],
      minzoom: 10,
      maxzoom: 15,
      attribution: LANDSD_ATTRIBUTION,
    },
  };
  style.layers.forEach((layer) => {
    layer.source = sourceId;
  });
  return style;
}

/**
 * Fetches and merges the LandsD basemap + label styles for a language.
 * @param {'en' | 'tc'} labelLang - place-name label language
 * @returns {Promise<object>} merged MapLibre style object
 */
async function buildCsdiStyle(labelLang) {
  const [basemap, labels] = await Promise.all([
    fetch(csdiUrls('basemap/WGS84').styleUrl).then((res) => {
      if (!res.ok) throw new Error(`Basemap style HTTP ${res.status}`);
      return res.json();
    }),
    fetch(csdiUrls(`label/hk/${labelLang}/WGS84`).styleUrl).then((res) => {
      if (!res.ok) throw new Error(`Label style HTTP ${res.status}`);
      return res.json();
    }),
  ]);
  const base = adaptCsdiStyle(basemap, 'basemap/WGS84', 'basemap');
  const label = adaptCsdiStyle(labels, `label/hk/${labelLang}/WGS84`, 'labels');
  return {
    ...base,
    sources: { ...base.sources, ...label.sources },
    layers: [...base.layers, ...label.layers],
  };
}

/**
 * Shows a translated fallback message when the map cannot load.
 * @param {'en' | 'zh-Hant'} lang
 * @returns {void}
 */
function showMapFallback(lang) {
  const el = document.getElementById('contact-map');
  if (!el) return;
  el.classList.add('map-fallback');
  el.textContent = window.MapNoteSite
    ? window.MapNoteSite.t('contact.mapError', lang)
    : 'Map unavailable.';
}

/**
 * Initialises the contact map if its container exists on the page.
 * Input: #contact-map element + window.MapNoteSiteConfig.contact.map.
 * Output: void (renders the map, or a fallback message on failure).
 * @returns {Promise<void>}
 */
async function initContactMap() {
  const container = document.getElementById('contact-map');
  if (!container) return;

  const lang = window.MapNoteSite ? window.MapNoteSite.getLang() : 'zh-Hant';
  const mapCfg = (window.MapNoteSiteConfig.contact && window.MapNoteSiteConfig.contact.map) || {};

  if (typeof maplibregl === 'undefined') {
    console.warn('[MapNoteHK map] MapLibre GL failed to load');
    showMapFallback(lang);
    return;
  }

  try {
    const style = await buildCsdiStyle(toLabelLang(lang));
    contactMap = new maplibregl.Map({
      container,
      style,
      center: mapCfg.center || [114.1694, 22.3193],
      zoom: mapCfg.zoom || 10.5,
      minZoom: 10,
      maxZoom: 16,
      /* Page-scroll friendly: zoom needs Ctrl/two-finger, drag still works */
      cooperativeGestures: true,
      /* LandsD acknowledgement pinned to the bottom-right corner */
      attributionControl: { compact: false },
    });
    contactMap.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
  } catch (err) {
    console.warn('[MapNoteHK map] init failed', err);
    showMapFallback(lang);
  }
}

/**
 * Rebuilds the map style so place-name labels match the site language.
 * Called by site.js applyI18n() on every language change; if the map is
 * not ready yet the request is replayed once init completes.
 * Input: site language. Output: void.
 * @param {'en' | 'zh-Hant'} lang
 * @returns {void}
 */
function MapNoteMapSetLang(lang) {
  if (!document.getElementById('contact-map')) return;
  if (!contactMap) {
    pendingLabelLang = lang;
    return;
  }
  buildCsdiStyle(toLabelLang(lang))
    .then((style) => contactMap && contactMap.setStyle(style, { diff: true }))
    .catch((err) => console.warn('[MapNoteHK map] label switch failed', err));
}

document.addEventListener('DOMContentLoaded', () => {
  initContactMap().then(() => {
    if (pendingLabelLang) {
      const lang = pendingLabelLang;
      pendingLabelLang = null;
      MapNoteMapSetLang(lang);
    }
  });
});
