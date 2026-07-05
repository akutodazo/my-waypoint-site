function generateRoute(polygonCoords, params, camera = DEFAULT_CAMERA) {
  const { lineSpacing, photoSpacing } = computeSpacing(params, camera);

  // Turfの形に変換（[経度,緯度]の配列。先頭と末尾を閉じる必要あり）
  const ring = [...polygonCoords, polygonCoords[0]];
  let poly = turf.polygon([ring]);

  const angle = params.angle || 0;             // 飛行方向（0=東西）。畝の向きに合わせる
  const pivot = turf.centroid(poly);           // 回転の中心＝重心

  // ① 飛行方向が水平になるようポリゴンを -angle 回転
  const rotated = turf.transformRotate(poly, -angle, { pivot });

  // ② 回転後の外接矩形 [minX, minY, maxX, maxY]（X=経度, Y=緯度）
  const [minX, minY, maxX, maxY] = turf.bbox(rotated);

  // 緯度方向の間隔(m)を「度」に換算（緯度1度≒111320m）
  const stepDeg = lineSpacing / 111320;

  const lines = [];
  let flip = false;
  // ③ 下から上へ lineSpacing ごとに水平線を引く
  for (let y = minY; y <= maxY; y += stepDeg) {
    const scan = turf.lineString([[minX - 0.001, y], [maxX + 0.001, y]]);
    const hits = turf.lineIntersect(scan, rotated).features
                     .map(f => f.geometry.coordinates)
                     .sort((a, b) => a[0] - b[0]); // 経度順に並べる
    if (hits.length < 2) continue;                // 交点が2つ未満＝範囲外

    // ④ 交点をペアにして区間を作る（凸でない形でも入口/出口がペアになる）
    for (let i = 0; i + 1 < hits.length; i += 2) {
      let seg = [hits[i], hits[i + 1]];
      if (flip) seg.reverse();                    // 1本おきに反転＝ジグザグ
      lines.push(seg);
    }
    flip = !flip;
  }

  // ⑤ 区間を順につなぎ、必要なら photoSpacing で中割りする
  let pts = [];
  lines.forEach(seg => {
    pts.push(seg[0]);
    if (photoSpacing > 0) {
      pts.push(...densify(seg[0], seg[1], photoSpacing));
    }
    pts.push(seg[1]);
  });

  // ⑥ 回転を元に戻す（+angle）
  const back = turf.transformRotate(
    turf.lineString(pts), angle, { pivot });

  // ⑦ ウェイポイント列（内部形式）に整える
  return back.geometry.coordinates.map((c, i) => ({
    index: i, lon: c[0], lat: c[1],
    height: params.height, speed: params.speed,
  }));
}

// 2点間を distance(m) ごとに分割した中間点を返す
function densify(a, b, distance) {
  const total = turf.distance(a, b, { units: 'meters' });
  const bearing = turf.bearing(a, b);
  const out = [];
  for (let d = distance; d < total; d += distance) {
    out.push(turf.destination(a, d, bearing, { units: 'meters' })
                 .geometry.coordinates);
  }
  return out;
}