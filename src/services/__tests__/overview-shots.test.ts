import { generateOverviewShots } from '../overview-shots';
import type { FlightParams, PolygonCoords } from '@/types/domain';

const params: FlightParams = {
  height: 20, // 全体撮影モードでは無視される（高度は自動計算）
  speed: 5,
  front: 0,
  side: 0,
  gimbalPitch: -90,
};

/** 函館付近に一辺sizeMの正方形圃場を作る */
function squarePolygon(sizeM: number): PolygonCoords {
  const latDeg = sizeM / 111320;
  const lngDeg = sizeM / (111320 * Math.cos((41.84 * Math.PI) / 180));
  return [
    [140.76, 41.84],
    [140.76 + lngDeg, 41.84],
    [140.76 + lngDeg, 41.84 + latDeg],
    [140.76, 41.84 + latDeg],
  ];
}

describe('generateOverviewShots', () => {
  test('100m四方: 1枚で収まるがDJI最小2点のため2点になり、高度は約93〜98m', () => {
    const plan = generateOverviewShots(squarePolygon(100), params);
    expect(plan).not.toBeNull();
    expect(plan!.shots).toBe(2);
    expect(plan!.waypoints).toHaveLength(2);
    expect(plan!.height).toBeGreaterThanOrEqual(93);
    expect(plan!.height).toBeLessThanOrEqual(98);
  });

  test('全点が同一の自動計算高度を持ち、149m以下', () => {
    const plan = generateOverviewShots(squarePolygon(100), params);
    for (const w of plan!.waypoints) {
      expect(w.height).toBe(plan!.height);
      expect(w.height).toBeLessThanOrEqual(149);
    }
  });

  test('全点が圃場のbbox内に収まる', () => {
    const polygon = squarePolygon(100);
    const plan = generateOverviewShots(polygon, params);
    const lngs = polygon.map((p) => p[0]);
    const lats = polygon.map((p) => p[1]);
    for (const w of plan!.waypoints) {
      expect(w.lon).toBeGreaterThanOrEqual(Math.min(...lngs));
      expect(w.lon).toBeLessThanOrEqual(Math.max(...lngs));
      expect(w.lat).toBeGreaterThanOrEqual(Math.min(...lats));
      expect(w.lat).toBeLessThanOrEqual(Math.max(...lats));
    }
  });

  test('200m四方: 分割撮影になり、3点以下・高度149m以下で収まる', () => {
    const plan = generateOverviewShots(squarePolygon(200), params);
    expect(plan).not.toBeNull();
    expect(plan!.waypoints.length).toBeGreaterThanOrEqual(2);
    expect(plan!.waypoints.length).toBeLessThanOrEqual(3);
    expect(plan!.height).toBeLessThanOrEqual(149);
  });

  test('500m四方: 3枚で収まらない場合は高度149m固定で必要枚数に自動分割', () => {
    const plan = generateOverviewShots(squarePolygon(500), params);
    expect(plan).not.toBeNull();
    expect(plan!.height).toBe(149);
    expect(plan!.waypoints.length).toBeGreaterThanOrEqual(4);
    expect(plan!.shots).toBe(plan!.waypoints.length);
  });

  test('500m四方の分割撮影でも全点が圃場のbbox内に収まる', () => {
    const polygon = squarePolygon(500);
    const plan = generateOverviewShots(polygon, params);
    const lngs = polygon.map((p) => p[0]);
    const lats = polygon.map((p) => p[1]);
    for (const w of plan!.waypoints) {
      expect(w.lon).toBeGreaterThanOrEqual(Math.min(...lngs));
      expect(w.lon).toBeLessThanOrEqual(Math.max(...lngs));
      expect(w.lat).toBeGreaterThanOrEqual(Math.min(...lats));
      expect(w.lat).toBeLessThanOrEqual(Math.max(...lats));
    }
  });

  test('indexは0からの連番、speedは入力値が入る', () => {
    const plan = generateOverviewShots(squarePolygon(200), params);
    plan!.waypoints.forEach((w, i) => {
      expect(w.index).toBe(i);
      expect(w.speed).toBe(5);
    });
  });

  test('3点未満のポリゴンはnull', () => {
    expect(
      generateOverviewShots([[140.76, 41.84]] as PolygonCoords, params),
    ).toBeNull();
  });
});
