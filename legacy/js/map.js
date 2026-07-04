// 地図を id="map" の箱の中に作る。setView([緯度, 経度], ズーム)で初期位置
const map = L.map('map').setView([41.84, 140.76], 16); // 例: 函館付近

// 航空写真タイル（衛星画像）を貼る。農地は航空写真の方が見やすい
L.tileLayer(
  'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  { attribution: 'Esri', maxZoom: 19 }
).addTo(map);

// 描いた図形を保管する層
const drawnItems = new L.FeatureGroup();
map.addLayer(drawnItems);

// 描画コントロール（左上に出るツールバー）
const drawControl = new L.Control.Draw({
  draw: {
    polygon: true,    // 多角形だけ使う
    polyline: false,
    rectangle: true,  // 長方形も便利なので許可
    circle: false,
    marker: false,
    circlemarker: false,
  },
  edit: { featureGroup: drawnItems }  // 描いた後で修正できるように
});
map.addControl(drawControl);

let routeLayer = null;
let _drawnPolygonCoords = null;

map.on('draw:created', (e) => {
  drawnItems.clearLayers();
  drawnItems.addLayer(e.layer);
  _drawnPolygonCoords = e.layer.getLatLngs()[0].map(ll => [ll.lng, ll.lat]);
});

function getDrawPolygon() {
  if (!_drawnPolygonCoords) {
    alert('先に圃場を描いてください');
    return null;
  }
  return _drawnPolygonCoords;
}

function drawRouteOnMap(waypoints) {
  if (routeLayer) map.removeLayer(routeLayer);

  const latlngs = waypoints.map(w => [w.lat, w.lon]);
  routeLayer = L.polyline(latlngs, { color: 'blue' }).addTo(map);

  waypoints.forEach((w, i) => {
    L.circleMarker([w.lat, w.lon], { radius: 4 })
      .bindTooltip(String(i)).addTo(routeLayer);
  });
}