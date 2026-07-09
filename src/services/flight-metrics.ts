import * as turf from '@turf/turf';
import type { PolygonCoords, Waypoint } from '@/types/domain';

/** 各ウェイポイントでの撮影停止に要する目安時間（秒） */
const STOP_SECONDS_PER_POINT = 2;

/** 圃場ポリゴンの面積（㎡）。3点未満は0。 */
export function polygonAreaSqm(polygon: PolygonCoords): number {
  if (polygon.length < 3) return 0;
  const ring = [...polygon, polygon[0]];
  return turf.area(turf.polygon([ring]));
}

/** 面積を「1,600 m²（0.16 ha）」形式に整形する。 */
export function formatArea(sqm: number): string {
  const m2 = Math.round(sqm).toLocaleString('en-US');
  const ha = (sqm / 10000).toFixed(2);
  return `${m2} m²（${ha} ha）`;
}

/**
 * 推定飛行時間（秒）＝ 経路の総距離÷速度 ＋ 各点の撮影停止。
 * 実機は加減速・旋回で前後するため、あくまで目安。
 */
export function estimateFlightSeconds(
  waypoints: Waypoint[],
  speedMps: number,
): number {
  if (waypoints.length < 2 || speedMps <= 0) return 0;

  let meters = 0;
  for (let i = 1; i < waypoints.length; i++) {
    const a = waypoints[i - 1];
    const b = waypoints[i];
    meters += turf.distance([a.lon, a.lat], [b.lon, b.lat], {
      units: 'meters',
    });
  }
  return meters / speedMps + waypoints.length * STOP_SECONDS_PER_POINT;
}

/** 秒を「約1分30秒」形式に整形する（1分未満は秒のみ）。 */
export function formatDuration(seconds: number): string {
  const total = Math.round(seconds);
  if (total < 60) return `約${total}秒`;
  const min = Math.floor(total / 60);
  const sec = total % 60;
  return `約${min}分${sec}秒`;
}
