import { FLIGHT_PRESETS, getPresetById } from '../presets';

describe('FLIGHT_PRESETS', () => {
  test('検証済みの3プリセットが定義されている', () => {
    expect(FLIGHT_PRESETS).toHaveLength(3);
    expect(FLIGHT_PRESETS.map((p) => p.id)).toEqual([
      'overview-20',
      'detail-10',
      'oblique-10',
    ]);
  });

  test('事前検証で確認した高度とジンバル角の組み合わせと一致する', () => {
    const overview = getPresetById('overview-20');
    expect(overview?.height).toBe(20);
    expect(overview?.gimbalPitch).toBe(-90);

    const detail = getPresetById('detail-10');
    expect(detail?.height).toBe(10);
    expect(detail?.gimbalPitch).toBe(-90);

    const oblique = getPresetById('oblique-10');
    expect(oblique?.height).toBe(10);
    expect(oblique?.gimbalPitch).toBe(-60);
  });

  test('全プリセットが航空法の高度制限（150m未満）を満たす', () => {
    for (const p of FLIGHT_PRESETS) {
      expect(p.height).toBeLessThan(150);
      expect(p.height).toBeGreaterThan(0);
    }
  });

  test('全プリセットのジンバル角とオーバーラップ率が有効範囲内', () => {
    for (const p of FLIGHT_PRESETS) {
      expect(p.gimbalPitch).toBeGreaterThanOrEqual(-90);
      expect(p.gimbalPitch).toBeLessThanOrEqual(0);
      expect(p.front).toBeGreaterThan(0);
      expect(p.front).toBeLessThan(1);
      expect(p.side).toBeGreaterThan(0);
      expect(p.side).toBeLessThan(1);
    }
  });

  test('存在しないIDはundefinedを返す', () => {
    expect(getPresetById('zzz')).toBeUndefined();
  });
});
