let waypoints = null;

document.getElementById('generate').addEventListener('click', () => {
    const polygon = getDrawPolygon();
    if (!polygon) return;
    const params = {
        height: Number(document.getElementById('height').value),
        speed:  Number(document.getElementById('speed').value),
        front:  Number(document.getElementById('front').value) / 100,
        side:   Number(document.getElementById('side').value) / 100,
    };
    waypoints = generateRoute(polygon, params);  // route.js が用意
    drawRouteOnMap(waypoints);                    // 確認のため地図に線を描く
});

document.getElementById('download').addEventListener('click', async () => {
  if (!waypoints) { alert('先にルートを生成してください'); return; }
  const blob = await buildKmz(waypoints);       // kmz.js が用意
  saveBlob(blob, 'route.kmz');
});