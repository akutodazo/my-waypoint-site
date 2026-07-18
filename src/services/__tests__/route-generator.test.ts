import { computeSpacing, generateRoute } from '../route-generator';
import { DEFAULT_CAMERA } from '../flight-constants';
import type { FlightParams, PolygonCoords } from '@/types/domain';

const params: FlightParams = {
  height: 50,
  speed: 5,
  front: 0.8,
  side: 0.7,
};

// 函館付近・約100m四方の圃場（緯度100m≒0.000898度、経度100m≒0.001206度）
const square100m: PolygonCoords = [
  [140.76, 41.84],
  [140.761206, 41.84],
  [140.761206, 41.840898],
  [140.76, 41.840898],
];

test('高度50m・側方70%重なりのとき飛行線間隔は約21.6m', () => {
  // 撮影幅 = (34.6 / 24) × 50 = 72.1m、その30%が間隔
  const { lineSpacing } = computeSpacing(params, DEFAULT_CAMERA);
  expect(lineSpacing).toBeCloseTo(21.6, 1);
});

test('高度50m・前方80%重なりのとき撮影間隔は約10.8m', () => {
  const { photoSpacing } = computeSpacing(params, DEFAULT_CAMERA);
  expect(photoSpacing).toBeCloseTo(10.8, 1);
});

test('高度を2倍にすると間隔も2倍になる', () => {
  const a = computeSpacing(params, DEFAULT_CAMERA);
  const b = computeSpacing({ ...params, height: 100 }, DEFAULT_CAMERA);
  expect(b.lineSpacing).toBeCloseTo(a.lineSpacing * 2, 5);
});

describe('generateRoute', () => {
  test('ウェイポイントが1点以上生成される', () => {
    const wps = generateRoute(square100m, params);
    expect(wps.length).toBeGreaterThan(0);
  });

  test('全ウェイポイントに入力どおりの高度と速度が入る', () => {
    const wps = generateRoute(square100m, params);
    for (const w of wps) {
      expect(w.height).toBe(50);
      expect(w.speed).toBe(5);
    }
  });

  test('indexが0から連番になっている', () => {
    const wps = generateRoute(square100m, params);
    wps.forEach((w, i) => expect(w.index).toBe(i));
  });

  test('全ウェイポイントが圃場の外接範囲（+10m余裕）に収まる', () => {
    const wps = generateRoute(square100m, params);
    const margin = 0.00015; // ≒10m強
    for (const w of wps) {
      expect(w.lon).toBeGreaterThan(140.76 - margin);
      expect(w.lon).toBeLessThan(140.761206 + margin);
      expect(w.lat).toBeGreaterThan(41.84 - margin);
      expect(w.lat).toBeLessThan(41.840898 + margin);
    }
  });
});
