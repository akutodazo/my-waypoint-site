import type {
  CameraSpec,
  FlightParams,
  PolygonCoords,
  Waypoint,
} from '@/types/domain';
import { DEFAULT_CAMERA } from './route-generator';

/** 航空法の150m未満制限を踏まえた自動計算高度の上限 */
const MAX_HEIGHT_M = 149;
/** 全体撮影モードの最大撮影枚数 */
const MAX_SHOTS = 3;
/** カバレッジ余裕（ヘディング誤差・GPSズレで端が切れるのを防ぐ） */
const MARGIN = 1.05;
const METERS_PER_DEG_LAT = 111320;

export interface OverviewPlan {
  waypoints: Waypoint[];
  /** 自動計算された飛行高度(m)。全点共通 */
  height: number;
  /** 撮影枚数（＝点数） */
  shots: number;
}

/**
 * 全体撮影モード（オルソではなく圃場全体の色確認用）の撮影点を計算する。
 * 指定範囲のbboxが1〜3枚に収まる最小の高度を求め、各撮影帯の中心に点を置く。
 * - DJIのウェイポイント飛行は最小2点のため、1枚で収まる場合も2点（2枚）にする
 * - 高度上限149m・3枚でも収まらない場合はnull（呼び出し側でエラー案内）
 * - カバレッジは撮影方向がbbox長辺に沿う前提の近似（MARGINで余裕を確保）
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

  for (let n = 1; n <= MAX_SHOTS; n++) {
    // 長辺をn分割した1帯が1枚に収まる高度
    const strip = longSide / n;
    const a = Math.max(strip, shortSide);
    const b = Math.min(strip, shortSide);
    const required = MARGIN * Math.max(a / wide, b / narrow);
    if (required > MAX_HEIGHT_M) continue;
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
  return null;
}
