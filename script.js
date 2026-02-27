// script.js

let map = null;
let ccaaLayer = null;
let currentMode = 'contexto'; // 'contexto' | 'consecuencias'

function $(id){ return document.getElementById(id); }

function cssVar(name){
  return getComputedStyle(document.body).getPropertyValue(name).trim();
}

function setStatus(msg){
  const el = $('status');
  if (!el) return;
  if (!msg){
    el.classList.remove('is-visible');
    el.textContent = '';
    return;
  }
  el.textContent = msg;
  el.classList.add('is-visible');
}

function setMode(mode){
  currentMode = mode;

  document.body.classList.toggle('theme-light', mode === 'contexto');
  document.body.classList.toggle('theme-dark', mode === 'consecuencias');

  $('btn-contexto')?.classList.toggle('is-active', mode === 'contexto');
  $('btn-consecuencias')?.classList.toggle('is-active', mode === 'consecuencias');

  // Reaplica estilo del GeoJSON para que invierta de verdad
  if (ccaaLayer) ccaaLayer.setStyle(getCcaaStyle());
}

function getCcaaStyle(){
  const fg = cssVar('--fg');
  const bg = cssVar('--bg');
  return {
    color: fg,        // borde (negro en contexto, blanco en consecuencias)
    weight: 1.4,
    fillColor: bg,    // fondo del polígono igual al fondo
    fillOpacity: 0.0  // solo líneas (sube a 0.05 si quieres velo)
  };
}

function getFeatureName(feature){
  // Ajusta si tu GeoJSON usa otra propiedad. Esto cubre varios casos comunes.
  return (
    feature?.properties?.name ??
    feature?.properties?.NAMEUNIT ??
    feature?.properties?.ccaa ??
    feature?.properties?.CCAA ??
    feature?.properties?.NOMBRE ??
    '—'
  );
}

function initMap(){
  map = L.map('map', {
    zoomControl: true,
    attributionControl: true
  }).setView([40.2, -3.7], 6);

  // Importante: SIN tiles. Solo tu capa de CCAA para que “invierta” perfecto.

  // Cargar GeoJSON de CCAA
  setStatus('Cargando mapa (ccaa.geojson)…');
  fetch('./data/ccaa.geojson', { cache: 'no-store' })
    .then(r => {
      if (!r.ok) throw new Error(`No se pudo cargar ./data/ccaa.geojson (HTTP ${r.status})`);
      return r.json();
    })
    .then(geojson => {
      ccaaLayer = L.geoJSON(geojson, {
        style: getCcaaStyle(),
        onEachFeature: (feature, layer) => {
          const name = getFeatureName(feature);

          layer.on('mouseover', () => {
            layer.setStyle({ weight: 2.2 });
          });

          layer.on('mouseout', () => {
            ccaaLayer.setStyle(getCcaaStyle());
          });

          layer.on('click', () => {
            layer.bindPopup(name).openPopup();
          });
        }
      }).addTo(map);

      try {
        map.fitBounds(ccaaLayer.getBounds(), { padding: [12, 12] });
      } catch (_) {
        // si el geojson viene raro, al menos no rompe
      }

      setStatus(null);
    })
    .catch(err => {
      console.error(err);
      setStatus('No se encontró ./data/ccaa.geojson. Sube el GeoJSON de comunidades a /data/ccaa.geojson.');
    });
}

document.addEventListener('DOMContentLoaded', () => {
  // Estado inicial: Contexto (blanco)
  setMode('contexto');

  $('btn-contexto')?.addEventListener('click', () => setMode('contexto'));
  $('btn-consecuencias')?.addEventListener('click', () => setMode('consecuencias'));

  initMap();
});
