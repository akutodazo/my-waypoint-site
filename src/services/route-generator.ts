import * as turf from '@turf/turf';
import type {
  CameraSpec,
  FlightParams,
  PolygonCoords,
  Waypoint,
} from '@/types/domain';
import { DEFAULT_CAMERA, METERS_PER_DEG_LAT } from './flight-constants';

export function computeSpacing(params: FlightParams, camera: CameraSpec) {
  const wg = (camera.sensorWidth / camera.focalLength) * params.height;
  const hg = (camera.sensorHeight / camera.focalLength) * params.height;
  return {
    lineSpacing: wg * (1 - params.side), // 隣の飛行線との距離(m)
    photoSpacing: hg * (1 - params.front), // 1本の線上で写真を撮る間隔(m)
  };
}

export function generateRoute(
  polygonCoords: PolygonCoords,
  params: FlightParams,
  camera: CameraSpec = DEFAULT_CAMERA,
): Waypoint[] {
  const { lineSpacing, photoSpacing } = computeSpacing(params, camera);

  // Turfの形に変換（先頭と末尾を閉じる必要あり）
  const ring = [...polygonCoords, polygonCoords[0]];
  const poly = turf.polygon([ring]);

  const angle = params.angle ?? 0; // 飛行方向（0=東西）。畝の向きに合わせる
  const pivot = turf.centroid(poly); // 回転の中心＝重心

  // ① 飛行方向が水平になるようポリゴンを -angle 回転
  const rotated = turf.transformRotate(poly, -angle, { pivot });

  // ② 回転後の外接矩形 [minX, minY, maxX, maxY]
  const [minX, minY, maxX, maxY] = turf.bbox(rotated);

  // 緯度方向の間隔(m)を「度」に換算
  const stepDeg = lineSpacing / METERS_PER_DEG_LAT;

  const lines: [number, number][][] = [];
  let flip = false;
  // ③ 下から上へ lineSpacing ごとに水平線を引く
  for (let y = minY; y <= maxY; y += stepDeg) {
    const scan = turf.lineString([
      [minX - 0.001, y],
      [maxX + 0.001, y],
    ]);
    const hits = turf
      .lineIntersect(scan, rotated)
      .features.map((f) => f.geometry.coordinates as [number, number])
      .sort((a, b) => a[0] - b[0]);
    if (hits.length < 2) continue;

    // ④ 交点をペアにして区間を作り、1本おきに反転＝ジグザグ
    for (let i = 0; i + 1 < hits.length; i += 2) {
      const seg = flip ? [hits[i + 1], hits[i]] : [hits[i], hits[i + 1]];
      lines.push(seg);
    }
    flip = !flip;
  }

  // ⑤ 区間を順につなぎ、photoSpacing で中割りする
  const pts: [number, number][] = [];
  for (const seg of lines) {
    pts.push(seg[0]);
    if (photoSpacing > 0) pts.push(...densify(seg[0], seg[1], photoSpacing));
    pts.push(seg[1]);
  }

  // ⑥ 回転を元に戻す
  const back = turf.transformRotate(turf.lineString(pts), angle, { pivot });

  // ⑦ ウェイポイント列（内部形式）に整える
  return (back.geometry.coordinates as [number, number][]).map((c, i) => ({
    index: i,
    lon: c[0],
    lat: c[1],
    height: params.height,
    speed: params.speed,
  }));
}

// 2点間を distance(m) ごとに分割した中間点を返す
function densify(
  a: [number, number],
  b: [number, number],
  distance: number,
): [number, number][] {
  const total = turf.distance(a, b, { units: 'meters' });
  const bearing = turf.bearing(a, b);
  const out: [number, number][] = [];
  for (let d = distance; d < total; d += distance) {
    out.push(
      turf.destination(a, d, bearing, { units: 'meters' }).geometry
        .coordinates as [number, number],
    );
  }
  return out;
}
