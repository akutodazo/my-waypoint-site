import {
  polygonAreaSqm,
  formatArea,
  estimateFlightSeconds,
  formatDuration,
} from '../flight-metrics';
import type { PolygonCoords, Waypoint } from '@/types/domain';

// 函館付近・約100m四方（緯度100m≒0.000898度、経度100m≒0.001206度）
const square100m: PolygonCoords = [
  [140.76, 41.84],
  [140.761206, 41.84],
  [140.761206, 41.840898],
  [140.76, 41.840898],
];

describe('polygonAreaSqm', () => {
  test('100m四方はおよそ10,000㎡（±3%）', () => {
    const area = polygonAreaSqm(square100m);
    expect(area).toBeGreaterThan(9700);
    expect(area).toBeLessThan(10300);
  });

  test('3点未満は0を返す', () => {
    expect(polygonAreaSqm([[140.76, 41.84]])).toBe(0);
  });
});

describe('formatArea', () => {
  test('1600㎡は m² と ha を併記する', () => {
    expect(formatArea(1600)).toBe('1,600 m²（0.16 ha）');
  });
  test('10000㎡は 1.00 ha', () => {
    expect(formatArea(10000)).toBe('10,000 m²（1.00 ha）');
  });
});

describe('estimateFlightSeconds', () => {
  const speed = 5; // m/s
  // 東へ約100mずつ・4点（総距離≒300m）
  const line: Waypoint[] = [
    { index: 0, lon: 140.76, lat: 41.84, height: 20, speed },
    { index: 1, lon: 140.761206, lat: 41.84, height: 20, speed },
    { index: 2, lon: 140.762412, lat: 41.84, height: 20, speed },
    { index: 3, lon: 140.763618, lat: 41.84, height: 20, speed },
  ];

  test('総距離÷速度＋各点2秒の停止でおよそ68秒（300/5=60 + 4×2=8）', () => {
    const sec = estimateFlightSeconds(line, speed);
    expect(sec).toBeGreaterThan(63);
    expect(sec).toBeLessThan(73);
  });

  test('0点・1点は0を返す（移動が無い）', () => {
    expect(estimateFlightSeconds([], speed)).toBe(0);
    expect(estimateFlightSeconds([line[0]], speed)).toBe(0);
  });

  test('速度が0以下でもクラッシュせず0を返す', () => {
    expect(estimateFlightSeconds(line, 0)).toBe(0);
  });
});

describe('formatDuration', () => {
  test('90秒は「約1分30秒」', () => {
    expect(formatDuration(90)).toBe('約1分30秒');
  });
  test('60秒ちょうどは「約1分0秒」', () => {
    expect(formatDuration(60)).toBe('約1分0秒');
  });
  test('45秒は「約45秒」（1分未満は秒のみ）', () => {
    expect(formatDuration(45)).toBe('約45秒');
  });
});
