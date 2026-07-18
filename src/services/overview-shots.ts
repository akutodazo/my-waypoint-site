import type {
  CameraSpec,
  FlightParams,
  PolygonCoords,
  Waypoint,
} from '@/types/domain';
import {
  DEFAULT_CAMERA,
  MAX_FLIGHT_HEIGHT_M,
  METERS_PER_DEG_LAT,
} from './flight-constants';

/** 高度を下げて少数枚で収める探索の上限枚数（超える場合は最大高度固定で必要枚数に分割） */
const PREFERRED_MAX_SHOTS = 3;
/** カバレッジ余裕（ヘディング誤差・GPSズレで端が切れるのを防ぐ） */
const MARGIN = 1.05;

export interface OverviewPlan {
  waypoints: Waypoint[];
  /** 自動計算された飛行高度(m)。全点共通 */
  height: number;
  /** 撮影枚数（＝点数） */
  shots: number;
}

/**
 * 全体撮影モード（オルソではなく圃場全体の色確認用）の撮影点を計算する。
 * まず1〜3枚に収まる最小の高度を探し、収まらない大圃場は高度149m固定で
 * 必要枚数（4枚、5枚…）のタイルに自動分割する（エラーにはしない）。
 * - DJIのウェイポイント飛行は最小2点のため、1枚で収まる場合も2点（2枚）にする
 * - カバレッジは撮影方向がbbox長辺に沿う前提の近似（MARGINで余裕を確保）
 * - nullは不正ポリゴン（3点未満）のときのみ
 */
export function generateOverviewShots(
  polygon: PolygonCoords,
  params: FlightParams,
  camera: CameraSpec = DEFAULT_CAMERA,
): OverviewPlan | null {
  if (polygon.length < 3) return null;

  // bboxを実距離(m)に換算（route-generatorと同じ度→m近似）
  const lngs = polygon.map((p) => p[0]);
  const lats = polygon.map((p) => p[1]);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const centerLat = (minLat + maxLat) / 2;
  const metersPerDegLng =
    METERS_PER_DEG_LAT * Math.cos((centerLat * Math.PI) / 180);
  const widthM = (maxLng - minLng) * metersPerDegLng; // 東西
  const heightM = (maxLat - minLat) * METERS_PER_DEG_LAT; // 南北

  // 地上撮影範囲の係数（footprint = 係数 × 高度）
  const wide = camera.sensorWidth / camera.focalLength; // 長辺
  const narrow = camera.sensorHeight / camera.focalLength; // 短辺

  const longSide = Math.max(widthM, heightM);
  const shortSide = Math.min(widthM, heightM);
  const splitAlongLng = widthM >= heightM; // 長辺の向き＝分割方向

  for (let n = 1; n <= PREFERRED_MAX_SHOTS; n++) {
    // 長辺をn分割した1帯が1枚に収まる高度
    const strip = longSide / n;
    const a = Math.max(strip, shortSide);
    const b = Math.min(strip, shortSide);
    const required = MARGIN * Math.max(a / wide, b / narrow);
    if (required > MAX_FLIGHT_HEIGHT_M) continue;
    const flightHeight = Math.ceil(required);

    // 各帯の中心座標
    const centers: [number, number][] = [];
    for (let i = 0; i < n; i++) {
      const t = (i + 0.5) / n;
      if (splitAlongLng) {
        centers.push([minLng + (maxLng - minLng) * t, centerLat]);
      } else {
        centers.push([(minLng + maxLng) / 2, minLat + (maxLat - minLat) * t]);
      }
    }

    // DJIのウェイポイント飛行は最小2点。1枚判定でも中心を挟む2点にする（2枚撮影）
    if (centers.length === 1) {
      const [clng, clat] = centers[0];
      const offM = Math.min(30, Math.max(10, shortSide / 4));
      if (splitAlongLng) {
        const offDeg = offM / METERS_PER_DEG_LAT;
        centers[0] = [clng, clat - offDeg];
        centers.push([clng, clat + offDeg]);
      } else {
        const offDeg = offM / metersPerDegLng;
        centers[0] = [clng - offDeg, clat];
        centers.push([clng + offDeg, clat]);
      }
    }

    return {
      shots: centers.length,
      height: flightHeight,
      waypoints: centers.map(([lon, lat], i) => ({
        index: i,
        lon,
        lat,
        height: flightHeight,
        speed: params.speed,
      })),
    };
  }

  // 3枚で収まらない大圃場: 高度149m固定で必要枚数のタイルに分割（枚数上限なし）
  const tileWide = (wide * MAX_FLIGHT_HEIGHT_M) / MARGIN; // 1枚の実効カバー幅（余裕込み）
  const tileNarrow = (narrow * MAX_FLIGHT_HEIGHT_M) / MARGIN;
  // footprintの長辺をbboxの長辺方向に合わせる
  const cols = splitAlongLng
    ? Math.ceil(widthM / tileWide)
    : Math.ceil(widthM / tileNarrow);
  const rows = splitAlongLng
    ? Math.ceil(heightM / tileNarrow)
    : Math.ceil(heightM / tileWide);

  const centers: [number, number][] = [];
  for (let r = 0; r < rows; r++) {
    const lat = minLat + ((r + 0.5) / rows) * (maxLat - minLat);
    const colIndexes = Array.from({ length: cols }, (_, c) => c);
    if (r % 2 === 1) colIndexes.reverse(); // ジグザグ順で飛行距離を短くする
    for (const c of colIndexes) {
      centers.push([minLng + ((c + 0.5) / cols) * (maxLng - minLng), lat]);
    }
  }

  return {
    shots: centers.length,
    height: MAX_FLIGHT_HEIGHT_M,
    waypoints: centers.map(([lon, lat], i) => ({
      index: i,
      lon,
      lat,
      height: MAX_FLIGHT_HEIGHT_M,
      speed: params.speed,
    })),
  };
}
