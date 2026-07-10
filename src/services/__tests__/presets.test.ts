import { FLIGHT_PRESETS, getPresetById } from '../presets';

describe('FLIGHT_PRESETS', () => {
  test('4プリセットが定義されている（検証済み3種＋全体撮影）', () => {
    expect(FLIGHT_PRESETS).toHaveLength(4);
    expect(FLIGHT_PRESETS.map((p) => p.id)).toEqual([
      'overview-20',
      'detail-10',
      'oblique-10',
      'overview-color',
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

    // 全体撮影モードの発動条件（オーバーラップ0/0）を持つこと
    const color = getPresetById('overview-color');
    expect(color?.front).toBe(0);
    expect(color?.side).toBe(0);
    expect(color?.gimbalPitch).toBe(-90);
  });

  test('全プリセットが航空法の高度制限（150m未満）を満たす', () => {
    for (const p of FLIGHT_PRESETS) {
      expect(p.height).toBeLessThan(150);
      expect(p.height).toBeGreaterThan(0);
    }
  });

  test('全プリセットのジンバル角とオーバーラップ率が有効範囲内（0=全体撮影モードを許容）', () => {
    for (const p of FLIGHT_PRESETS) {
      expect(p.gimbalPitch).toBeGreaterThanOrEqual(-90);
      expect(p.gimbalPitch).toBeLessThanOrEqual(0);
      expect(p.front).toBeGreaterThanOrEqual(0);
      expect(p.front).toBeLessThan(1);
      expect(p.side).toBeGreaterThanOrEqual(0);
      expect(p.side).toBeLessThan(1);
    }
  });

  test('存在しないIDはundefinedを返す', () => {
    expect(getPresetById('zzz')).toBeUndefined();
  });
});
