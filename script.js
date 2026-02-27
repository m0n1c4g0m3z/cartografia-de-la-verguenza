// script.js

let map = null;
let ccaaLayer = null;

function $(id){ return document.getElementById(id); }

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

function cssVar(name){
  return getComputedStyle(document.body).getPropertyValue(name).trim();
}

/* ESTILO EXACTO SEGÚN TU DISEÑO:
   - Contexto: fondo blanco; polígonos + bordes en negro
   - Consecuencias: fondo negro; polígonos + bordes en blanco
*/
function getCcaaStyle(){
  const fg = cssVar('--fg'); // color de “todo lo demás”
  return {
    color: fg,        // borde
    weight: 1.5,
    fillColor: fg,    // relleno (negro en contexto, blanco en consecuencias)
    fillOpacity: 1.0  // sólido
  };
}

function setMode(mode){ // 'contexto' | 'consecuencias'
  document.body.classList.toggle('mode-contexto', mode === 'contexto');
  document.body.classList.toggle('mode-consecuencias', mode === 'consecuencias');

  $('btn-contexto')?.classList.toggle('is-active', mode === 'contexto');
  $('btn-consecuencias')?.classList.toggle('is-active', mode === 'consecuencias');

  // Reaplica estilos al cambiar de modo (inversión real)
  if (ccaaLayer) ccaaLayer.setStyle(getCcaaStyle());
}

function getFeatureName(feature){
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
    zoomControl: false,
    attributionControl: false
  });

  // Sin tiles: el “canvas” del mapa es el fondo del tema
  // y las CCAA son la figura (negra o blanca).

  setStatus('Cargando comunidades (data/ccaa.geojson)…');

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
          layer.on('click', () => layer.bindPopup(name).openPopup());
        }
      }).addTo(map);

      map.fitBounds(ccaaLayer.getBounds(), { padding: [10, 10] });

      setStatus(null);
    })
    .catch(err => {
      console.error(err);
      setStatus('Falta el archivo: ./data/ccaa.geojson');
    });
}

document.addEventListener('DOMContentLoaded', () => {
  // Estado inicial: Contexto
  setMode('contexto');

  $('btn-contexto')?.addEventListener('click', () => setMode('contexto'));
  $('btn-consecuencias')?.addEventListener('click', () => setMode('consecuencias'));

  initMap();
});
