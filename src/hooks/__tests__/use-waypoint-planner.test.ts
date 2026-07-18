/**
 * @jest-environment jsdom
 */
// 中核Presenterの分岐（通常/全体撮影モード・上限警告・エラー・状態リセット）を検査する。
// 経路計算の正しさ自体は route-generator / overview-shots のテストが担当し、
// ここでは「入力状態に応じて正しい分岐・メッセージ・状態遷移になるか」だけを見る
import { act, renderHook } from '@testing-library/react';
import { useWaypointPlanner } from '../use-waypoint-planner';
import {
  DEFAULT_FLIGHT_PARAMS,
  WAYPOINT_LIMIT,
} from '@/services/flight-constants';
import type { PolygonCoords } from '@/types/domain';

// 函館付近・約100m四方の圃場（緯度100m≒0.000898度、経度100m≒0.001206度）
const smallPolygon: PolygonCoords = [
  [140.76, 41.84],
  [140.761206, 41.84],
  [140.761206, 41.840898],
  [140.76, 41.840898],
];

// 約800m四方の大圃場（既定パラメータで200点を大きく超える）
const largePolygon: PolygonCoords = [
  [140.76, 41.84],
  [140.769648, 41.84],
  [140.769648, 41.847184],
  [140.76, 41.847184],
];

describe('useWaypointPlanner', () => {
  test('初期状態は既定パラメータで、ルート・メッセージは空', () => {
    const { result } = renderHook(() => useWaypointPlanner());
    expect(result.current.params).toEqual(DEFAULT_FLIGHT_PARAMS);
    expect(result.current.waypoints).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.warning).toBeNull();
    expect(result.current.notice).toBeNull();
    expect(result.current.areaText).toBeNull();
    expect(result.current.flightText).toBeNull();
  });

  test('圃場を描かずに生成するとエラーになる', () => {
    const { result } = renderHook(() => useWaypointPlanner());
    act(() => result.current.generate());
    expect(result.current.error).toBe('先に圃場を描いてください');
    expect(result.current.waypoints).toBeNull();
  });

  test('通常モード: ルートが生成され、面積・飛行時間の表示が出る', () => {
    const { result } = renderHook(() => useWaypointPlanner());
    act(() => result.current.setPolygon(smallPolygon));
    act(() => result.current.generate());
    expect(result.current.waypoints).not.toBeNull();
    expect(result.current.waypoints!.length).toBeGreaterThan(0);
    expect(result.current.notice).toBeNull(); // 全体撮影モードではない
    expect(result.current.warning).toBeNull(); // 小圃場は上限内
    expect(result.current.areaText).not.toBeNull();
    expect(result.current.flightText).not.toBeNull();
  });

  test('通常モード: 大圃場で上限を超えると警告が出る', () => {
    const { result } = renderHook(() => useWaypointPlanner());
    act(() => result.current.setPolygon(largePolygon));
    act(() => result.current.generate());
    expect(result.current.waypoints!.length).toBeGreaterThan(WAYPOINT_LIMIT);
    expect(result.current.warning).toContain(`上限${WAYPOINT_LIMIT}点`);
  });

  test('全体撮影モード: front/side=0で案内が出て、少数点のルートになる', () => {
    const { result } = renderHook(() => useWaypointPlanner());
    act(() => result.current.setPolygon(smallPolygon));
    act(() => {
      result.current.updateParam('front', 0);
      result.current.updateParam('side', 0);
    });
    act(() => result.current.generate());
    expect(result.current.notice).toContain('全体撮影モード');
    expect(result.current.waypoints!.length).toBeGreaterThanOrEqual(2); // DJIの最小2点
    expect(result.current.waypoints!.length).toBeLessThanOrEqual(3); // 100m四方は少数枚
    expect(result.current.warning).toBeNull();
  });

  test('全体撮影モード: 3点未満の不正ポリゴンはエラーになる', () => {
    const { result } = renderHook(() => useWaypointPlanner());
    act(() =>
      result.current.setPolygon([
        [140.76, 41.84],
        [140.761, 41.84],
      ]),
    );
    act(() => {
      result.current.updateParam('front', 0);
      result.current.updateParam('side', 0);
    });
    act(() => result.current.generate());
    expect(result.current.error).toContain('描き直してください');
    expect(result.current.waypoints).toBeNull();
  });

  test('圃場を描き直すと古いルートは無効になる', () => {
    const { result } = renderHook(() => useWaypointPlanner());
    act(() => result.current.setPolygon(smallPolygon));
    act(() => result.current.generate());
    expect(result.current.waypoints).not.toBeNull();
    act(() => result.current.setPolygon(largePolygon));
    expect(result.current.waypoints).toBeNull();
  });

  test('プリセット適用でパラメータが置き換わる', () => {
    const { result } = renderHook(() => useWaypointPlanner());
    act(() =>
      result.current.applyPreset({
        id: 'oblique-10',
        label: '斜め撮影 10m',
        description: '',
        height: 10,
        gimbalPitch: -60,
        front: 0.8,
        side: 0.7,
        speed: 5,
      }),
    );
    expect(result.current.params.height).toBe(10);
    expect(result.current.params.gimbalPitch).toBe(-60);
  });

  test('clearRouteでルートと警告・案内だけが消える（圃場は残る）', () => {
    const { result } = renderHook(() => useWaypointPlanner());
    act(() => result.current.setPolygon(largePolygon));
    act(() => result.current.generate());
    act(() => result.current.clearRoute());
    expect(result.current.waypoints).toBeNull();
    expect(result.current.warning).toBeNull();
    expect(result.current.notice).toBeNull();
    expect(result.current.polygon).not.toBeNull();
  });

  test('clearPolygonで圃場・ルート・全メッセージが消える', () => {
    const { result } = renderHook(() => useWaypointPlanner());
    act(() => result.current.setPolygon(largePolygon));
    act(() => result.current.generate());
    act(() => result.current.clearPolygon());
    expect(result.current.polygon).toBeNull();
    expect(result.current.waypoints).toBeNull();
    expect(result.current.warning).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.notice).toBeNull();
  });

  test('ルート未生成でダウンロードするとエラーになる', async () => {
    const { result } = renderHook(() => useWaypointPlanner());
    await act(async () => {
      await result.current.download();
    });
    expect(result.current.error).toBe('先にルートを生成してください');
  });
});
