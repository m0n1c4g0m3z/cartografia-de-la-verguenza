let map;
let ccaaLayer;
let currentMode = 'contexto'; // 'contexto' | 'consecuencias'

function setMode(mode) {
  currentMode = mode;

  // Tema general
  document.body.classList.toggle('theme-light', mode === 'contexto');
  document.body.classList.toggle('theme-dark', mode === 'consecuencias');

  // Botones
  document.getElementById('btn-contexto').classList.toggle('is-active', mode === 'contexto');
  document.getElementById('btn-consecuencias').classList.toggle('is-active', mode === 'consecuencias');

  // Re-estilizar capa
  if (ccaaLayer) ccaaLayer.setStyle(getCcaaStyle());
}

function getCcaaStyle() {
  // Contexto: líneas negras sobre blanco
  if (currentMode === 'contexto') {
    return {
      color: '#000000',
      weight: 1.2,
      fillColor: '#ffffff',
      fillOpacity: 0.0, // solo líneas (sube si quieres relleno)
    };
  }

  // Consecuencias: líneas blancas sobre negro
  return {
    color: '#ffffff',
    weight: 1.2,
    fillColor: '#000000',
    fillOpacity: 0.0,
  };
}

function initMap() {
  map = L.map('map', {
    zoomControl: true,
    attributionControl: true
  }).setView([40.2, -3.7], 6);

  // Base muy neutra: puedes dejarla o quitarla.
  // Si quieres “solo líneas” (sin tiles), comenta esto.
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 10,
    minZoom: 5
  }).addTo(map);

  // Cargar CCAA GeoJSON
  fetch('./data/ccaa.geojson', { cache: 'no-store' })
    .then(r => {
      if (!r.ok) throw new Error('No se pudo cargar ccaa.geojson');
      return r.json();
    })
    .then(geojson => {
      ccaaLayer = L.geoJSON(geojson, {
        style: getCcaaStyle(),
        onEachFeature: (feature, layer) => {
          layer.on('click', () => {
            const name =
              feature.properties?.name ||
              feature.properties?.NAMEUNIT ||
              feature.properties?.CCAA ||
              '—';
            layer.bindPopup(name).openPopup();
          });
        }
      }).addTo(map);

      // Encajar a España
      map.fitBounds(ccaaLayer.getBounds(), { padding: [12, 12] });
    })
    .catch(err => console.error(err));
}

document.addEventListener('DOMContentLoaded', () => {
  initMap();

  document.getElementById('btn-contexto').addEventListener('click', () => setMode('contexto'));
  document.getElementById('btn-consecuencias').addEventListener('click', () => setMode('consecuencias'));

  // Estado inicial
  setMode('contexto');
});
